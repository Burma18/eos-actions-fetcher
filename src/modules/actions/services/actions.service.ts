import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Action } from '../schemas/action.schema';

@Injectable()
export class ActionsService {
  private readonly logger = new Logger(ActionsService.name);

  constructor(@InjectModel('Action') private actionModel: Model<Action>) {}

  async createAction(
    trx_id: string,
    block_time: string,
    block_num: number,
  ): Promise<Action> {
    const newAction = new this.actionModel({ trx_id, block_time, block_num });
    return newAction.save();
  }

  async findActionById(trx_id: string): Promise<Action | null> {
    return this.actionModel.findOne({ trx_id }).exec();
  }

  async getAllActions(): Promise<Action[]> {
    return this.actionModel.find().exec();
  }
  
}
