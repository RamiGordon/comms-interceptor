import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { CommunicationInterpreterService } from './comms-interpreter.service';
import {
  SatelliteMessagesDto,
  SatelliteMessagesDtoSchema,
} from './dto/satellite-messages.dto';
import { JoiValidationPipe } from '../pipes/joi-validation.pipe';

@Controller('comms-interpreter')
export class CommunicationInterpreterController {
  constructor(
    private readonly communicationInterpreterService: CommunicationInterpreterService,
  ) {}

  @Post('topsecret')
  @UsePipes(new JoiValidationPipe(SatelliteMessagesDtoSchema))
  topsecret(
    @Body()
    satteliteMessages: SatelliteMessagesDto,
  ) {
    return this.communicationInterpreterService.topSecret(satteliteMessages);
  }
}
