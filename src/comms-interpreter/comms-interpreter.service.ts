import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TopsecretDto } from './dto/topsecret.dto';
import { SatelliteMessage } from './entities/satellite-message.entity';
import { SatelliteDataService } from '../satellite-data/satellite-data.service';
import { TopsecretSplitCreateDto } from './dto/topsecret-split-create.dto';
import { isEmpty } from 'lodash';
import { TopsecretResponseDto } from './dto/topsecret-response.dto';
import {
  kenobiLocation,
  satoLocation,
  skywalkerLocation,
} from '../utils/satellite-locations';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const trilat = require('trilat');

@Injectable()
export class CommsInterpreterService {
  private satelliteDataService = new SatelliteDataService();
  private logger = new Logger();

  topSecret(satteliteMessagesDto: TopsecretDto): TopsecretResponseDto {
    const distances = this.getDistances(satteliteMessagesDto.satellites);
    const position = this.getLocation(distances);
    const messages = this.getMessages(satteliteMessagesDto.satellites);
    const message = this.getMessage(messages);

    if (!position || !message) {
      throw new NotFoundException(
        "There is not enough information to determine the message or the sender's position.",
      );
    }
    const [x, y] = position;

    return { position: { x, y }, message };
  }

  captureSatelliteMessage(
    satellite_name: string,
    topsecretSplitCreateDto: TopsecretSplitCreateDto,
  ): void {
    const { distance, message } = topsecretSplitCreateDto;
    const satelliteData = new SatelliteMessage({
      name: satellite_name,
      distance,
      message,
    });

    this.logger.log(`storing satellite data for '${satellite_name}'`);

    this.satelliteDataService.create(satelliteData);
  }

  decodeMessageAndPosition(): TopsecretResponseDto {
    const satelliteMessages = this.satelliteDataService.findAll();
    const satelliteMessagesDto = new TopsecretDto(satelliteMessages);
    const response = this.topSecret(satelliteMessagesDto);

    if (!isEmpty(response)) {
      this.satelliteDataService.reset();
    }

    return response;
  }

  private getDistances(satellites: SatelliteMessage[]): number[] {
    return satellites.map((satellite) => satellite.distance);
  }

  private getLocation(distances: number[]): number[] {
    const [kenobiX, kenobiY] = kenobiLocation;
    const [skywalkerX, skywalkerY] = skywalkerLocation;
    const [satoX, satoY] = satoLocation;
    const [kenobiR, skywalkerR, satoR] = distances;
    const input = [
      [kenobiX, kenobiY, kenobiR],
      [skywalkerX, skywalkerY, skywalkerR],
      [satoX, satoY, satoR],
    ];

    return trilat(input);
  }

  private getMessages(satellites: SatelliteMessage[]): string[][] {
    return satellites.map((satellite) => satellite.message);
  }

  private getMessage(messages: string[][]): string | null {
    this.logger.log('Decoding message...');

    const messageLength = messages.reduce(
      (max, message) => Math.max(max, message.length),
      0,
    );

    if (messageLength === 0) {
      this.logger.error('No messages to decode');

      return null;
    }
    const decodedMessage = [];
    let error = false;

    for (let i = 0; i < messageLength; i++) {
      const words = messages.map((message) => message[i] || '');
      const word = words.find((word) => word !== '');

      if (!word) {
        error = true;
        this.logger.error(`Partial message: ${decodedMessage.join(' ')}`);

        break;
      }
      decodedMessage.push(word);
    }

    if (error) {
      this.logger.error('Error while decoding message. Incomplete message.');

      return null;
    }

    this.logger.log(`Message decoded: ${decodedMessage.join(' ')}`);
    return decodedMessage.join(' ');
  }
}
