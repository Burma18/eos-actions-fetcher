import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { ActionSchema } from './modules/actions/schemas/action.schema';
import { FetchEosActionsTask } from './modules/schedule/fetch-eos-actions.task';
import mongoose from 'mongoose';
import { ActionsModule } from './modules/actions/actions.module';
import { environment } from './environment';

@Module({
  imports: [
    MongooseModule.forRoot(environment.database.mongoUrl),
    MongooseModule.forFeature([{ name: 'Action', schema: ActionSchema }]),
    ScheduleModule.forRoot(),
    HttpModule,
    ActionsModule,
  ],
  providers: [FetchEosActionsTask],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  async onModuleInit() {
    try {
      mongoose.connection.on('connected', () => {
        this.logger.log('Connected to MongoDB successfully!');
      });

      mongoose.connection.on('error', (err) => {
        this.logger.error('Failed to connect to MongoDB', err);
      });

      mongoose.connection.on('disconnected', () => {
        this.logger.warn('Disconnected from MongoDB');
      });
    } catch (error) {
      this.logger.error('Error initializing MongoDB connection', error);
    }
  }
}
