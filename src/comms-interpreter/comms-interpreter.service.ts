import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TopsecretDto } from './dto/topsecret.dto';
import { SatelliteMessage } from './entities/satellite-message.entity';
import { SatelliteDataService } from '../satellite-data/satellite-data.service';
import { TopsecretSplitCreateDto } from './dto/topsecret-split-create.dto';
import { isEmpty } from 'lodash';
import { TopsecretResponseDto } from './dto/topsecret-response.dto';
import {
  PRECISION_DELTA,
  kenobiLocation,
  satoLocation,
  skywalkerLocation,
} from '../utils/satellite-locations';

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

    if (typeof position[0] !== 'number' || typeof position[1] !== 'number') {
      throw new NotFoundException(
        `There is not enough information to determine the exact sender's position. Those are two possible solutions: { (${position[0]}) ; (${position[1]}) }`,
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

  private getLocation(distances: number[]): number[] | number[][] | null {
    const [Kx, Ky] = kenobiLocation;
    const [skyX, skyY] = skywalkerLocation;
    const [Sx, Sy] = satoLocation;
    const [Dk, Dsky, Ds] = distances;

    const A = (Ky - Sy) / (Kx - Sx);
    const B =
      (-Math.pow(Kx, 2) -
        Math.pow(Ky, 2) +
        Math.pow(Sx, 2) +
        Math.pow(Sy, 2) +
        Math.pow(Dk, 2) -
        Math.pow(Ds, 2)) /
      (2 * Kx - 2 * Sx);

    // Bhaskara constants
    const a = Math.pow(A, 2) + 1;
    const b = -2 * A * B - 2 * Kx * A + 2 * Ky;
    const c =
      2 * Kx * B +
      Math.pow(B, 2) +
      Math.pow(Kx, 2) +
      Math.pow(Ky, 2) -
      Math.pow(Dk, 2);

    // Bhaskara delta
    const delta = Math.pow(b, 2) - 4 * a * c;
    const error = Math.sign(delta) === -1;

    if (error) {
      return null;
    }

    // Bhaskara
    const yA = (-b + Math.sqrt(delta)) / (2 * a);
    const yB = (-b - Math.sqrt(delta)) / (2 * a);

    // radical axis
    const xA = -yA * A + B;
    const xB = -yB * A + B;

    const solutionA =
      Math.pow(skyX + xA, 2) + Math.pow(skyY + yA, 2) - Math.pow(Dsky, 2);
    const solutionB =
      Math.pow(skyX + xB, 2) + Math.pow(skyY + yB, 2) - Math.pow(Dsky, 2);

    // The three circumferences intersect at a single point
    if (solutionA < PRECISION_DELTA && solutionA > -PRECISION_DELTA) {
      return [xA, yA];
    }

    // The three circumferences intersect at a single point
    if (solutionB < PRECISION_DELTA && solutionB > -PRECISION_DELTA) {
      return [xB, yB];
    }

    // There may be possible positions
    return [
      [xA, yA],
      [xB, yB],
    ];
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
