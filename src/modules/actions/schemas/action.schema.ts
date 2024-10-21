import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActionDocument = Action & Document;

@Schema()
export class Action {
  @Prop({ unique: true, required: true })
  trx_id: string;

  @Prop({ required: true })
  block_time: Date;

  @Prop({ required: true })
  block_num: number;
}

export const ActionSchema = SchemaFactory.createForClass(Action);
