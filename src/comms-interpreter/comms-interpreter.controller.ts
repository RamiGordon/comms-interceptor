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
import { CommsInterpreterService } from './comms-interpreter.service';
import {
  SatelliteMessagesDto,
  SatelliteMessagesDtoSchema,
} from './dto/satellite-messages.dto';
import { JoiValidationPipe } from '../pipes/joi-validation.pipe';
import { TopsecretSplitCreateDto } from './dto/topsecret-split-create.dto';
import { TopsecretResponseDto } from './dto/topsecret-response.dto';

@Controller('comms-interpreter')
export class CommsInterpreterController {
  constructor(
    private readonly commsInterpreterService: CommsInterpreterService,
  ) {}

  @Post('topsecret')
  @UsePipes(new JoiValidationPipe(SatelliteMessagesDtoSchema))
  @HttpCode(HttpStatus.OK)
  topsecret(
    @Body()
    satelliteMessagesDto: SatelliteMessagesDto,
  ): TopsecretResponseDto {
    return this.commsInterpreterService.topSecret(satelliteMessagesDto);
  }

  // TODO: add joi validation schema
  @Post('topsecret_split/:satellite_name')
  @HttpCode(HttpStatus.OK)
  captureSatelliteMessage(
    @Param('satellite_name') satelliteName: string,
    @Body() topsecretSplitCreateDto: TopsecretSplitCreateDto,
  ) {
    return this.commsInterpreterService.captureSatelliteMessage(
      satelliteName,
      topsecretSplitCreateDto,
    );
  }

  @Get('topsecret_split')
  @HttpCode(HttpStatus.OK)
  decodeMessageAndPosition(): TopsecretResponseDto {
    return this.commsInterpreterService.decodeMessageAndPosition();
  }
}
