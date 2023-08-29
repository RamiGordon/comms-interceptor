import {
  Controller,
  Post,
  Body,
  UsePipes,
  Param,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { CommunicationInterpreterService } from './comms-interpreter.service';
import {
  SatelliteMessagesDto,
  SatelliteMessagesDtoSchema,
} from './dto/satellite-messages.dto';
import { JoiValidationPipe } from '../pipes/joi-validation.pipe';
import { TopsecretSplitCreateDto } from './dto/topsecret-split-create.dto';

@Controller('comms-interpreter')
export class CommunicationInterpreterController {
  constructor(
    private readonly communicationInterpreterService: CommunicationInterpreterService,
  ) {}

  @Post('topsecret')
  @UsePipes(new JoiValidationPipe(SatelliteMessagesDtoSchema))
  @HttpCode(HttpStatus.OK)
  topsecret(
    @Body()
    satteliteMessages: SatelliteMessagesDto,
  ) {
    return this.communicationInterpreterService.topSecret(satteliteMessages);
  }

  // TODO: add joi validation schema
  @Post('topsecret_split/:satellite_name')
  @HttpCode(HttpStatus.OK)
  captureSatelliteMessage(
    @Param('satellite_name') satelliteName: string,
    @Body() topsecretSplitCreateDto: TopsecretSplitCreateDto,
  ) {
    return this.communicationInterpreterService.captureSatelliteMessage(
      satelliteName,
      topsecretSplitCreateDto,
    );
  }

  @Get('topsecret_split')
  @HttpCode(HttpStatus.OK)
  decodeMessageAndPosition() {
    return this.communicationInterpreterService.decodeMessageAndPosition();
  }
}
