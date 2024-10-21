import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { Action } from '../actions/schemas/action.schema';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FetchEosActionsTask {
  private readonly logger = new Logger(FetchEosActionsTask.name);
  private readonly url = 'https://eos.greymass.com/v1/history/get_actions';
  private readonly payload = { account_name: 'eosio', pos: -1, offset: -100 };

  constructor(
    private readonly httpService: HttpService,
    @InjectModel('Action') private actionModel: Model<Action>,
  ) {}

  @Cron('*/1 * * * *') // Runs every minute
  async handleCron() {
    this.logger.debug('Fetching EOS actions...');

    try {
      const stream = await this.fetchEosActions();
      this.processStream(stream);
    } catch (error) {
      this.logger.error('Error fetching EOS actions:', error);
    }
  }

  private async fetchEosActions() {
    const response = await firstValueFrom(
      this.httpService.post(this.url, this.payload, {
        responseType: 'stream',
      }),
    );
    return response.data;
  }

  private processStream(stream) {
    let rawData = '';
    let chunkCount = 0;

    stream.on('data', (chunk) => {
      rawData += chunk.toString();
      chunkCount++;
      this.logger.log(`Received chunk ${chunkCount}`);
    });

    stream.on('end', async () => {
      this.logger.log(`Finished receiving ${chunkCount} chunks.`);
      await this.processActions(rawData);
    });

    stream.on('error', (err) => {
      this.logger.error('Error fetching EOS actions:', err);
    });
  }

  private async processActions(rawData: string) {
    try {
      this.logger.debug('Raw data received: ', rawData);
      const { actions = [] } = JSON.parse(rawData);
      this.logger.log(`Processing ${actions.length} actions...`);

      let createdCount = 0;

      for (const action of actions) {
        try {
          const { trx_id } = action.action_trace;
          const { block_time, block_num } = action;

          if (!trx_id) {
            this.logger.warn('Skipping action due to missing trx_id:', action);
            continue;
          }

          const existingAction = await this.actionModel.findOne({ trx_id });
          if (existingAction) {
            this.logger.log(
              `Action with trx_id ${trx_id} already exists in the database.`,
            );
          } else {
            await this.saveAction({ trx_id, block_time, block_num });
            createdCount++;
            this.logger.log(
              `Created new action with trx_id ${trx_id} in the database.`,
            );
          }
        } catch (err) {
          this.logger.error(
            `Error processing action: ${JSON.stringify(action)}`,
            err,
          );
        }
      }

      this.logger.log(
        `Successfully created ${createdCount} new actions in the database.`,
      );
      this.logger.debug('EOS actions processing completed.');
    } catch (err) {
      this.logger.error('Error parsing EOS actions JSON:', err.message);
    }
  }

  private async saveAction(actionData: {
    trx_id: string;
    block_time: string;
    block_num: number;
  }) {
    const newAction = new this.actionModel(actionData);
    await newAction.save();
  }
}
