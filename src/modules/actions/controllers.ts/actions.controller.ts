import { Controller, Get, Param } from '@nestjs/common';
import { ActionsService } from '../services/actions.service';
import { Action } from '../schemas/action.schema';

@Controller('actions')
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  @Get()
  async getAllActions(): Promise<Action[]> {
    return this.actionsService.getAllActions();
  }

  @Get(':trx_id')
  async getAction(@Param('trx_id') trx_id: string): Promise<Action | null> {
    return this.actionsService.findActionById(trx_id);
  }
}
