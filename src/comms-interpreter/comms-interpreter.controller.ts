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
import { TopsecretDto, TopsecretDtoSchema } from './dto/topsecret.dto';
import { JoiValidationPipe } from '../pipes/joi-validation.pipe';
import {
  TopsecretSplitCreateDto,
  TopsecretSplitCreateDtoSchema,
} from './dto/topsecret-split-create.dto';
import { TopsecretResponseDto } from './dto/topsecret-response.dto';
import { ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('comms-interpreter')
@Controller('comms-interpreter')
export class CommsInterpreterController {
  constructor(
    private readonly commsInterpreterService: CommsInterpreterService,
  ) {}

  @Post('topsecret')
  @UsePipes(new JoiValidationPipe(TopsecretDtoSchema))
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Message and Position decoded',
    type: TopsecretResponseDto,
  })
  @ApiBody({ type: TopsecretDto })
  topsecret(
    @Body()
    satelliteMessagesDto: TopsecretDto,
  ): TopsecretResponseDto {
    return this.commsInterpreterService.topSecret(satelliteMessagesDto);
  }

  @Post('topsecret_split/:satellite_name')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Satellite message captured',
  })
  @ApiBody({ type: TopsecretSplitCreateDto })
  captureSatelliteMessage(
    @Param('satellite_name') satelliteName: string,
    @Body(new JoiValidationPipe(TopsecretSplitCreateDtoSchema))
    topsecretSplitCreateDto: TopsecretSplitCreateDto,
  ) {
    return this.commsInterpreterService.captureSatelliteMessage(
      satelliteName,
      topsecretSplitCreateDto,
    );
  }

  @Get('topsecret_split')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Message and Position decoded',
    type: TopsecretResponseDto,
  })
  decodeMessageAndPosition(): TopsecretResponseDto {
    return this.commsInterpreterService.decodeMessageAndPosition();
  }
}
