import { Controller, Post, Body } from '@nestjs/common';
import { CommunicationInterpreterService } from './comms-interpreter.service';
import { SatelliteMessagesDto } from './dto/satellite-messages.dto';

@Controller('comms-interpreter')
export class CommunicationInterpreterController {
  constructor(
    private readonly communicationInterpreterService: CommunicationInterpreterService,
  ) {}

  @Post('topsecret')
  topsecret(
    @Body()
    satteliteMessages: SatelliteMessagesDto,
  ) {
    return this.communicationInterpreterService.topSecret(satteliteMessages);
  }
}
