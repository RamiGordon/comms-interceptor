import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TopsecretDto } from './dto/topsecret.dto';
import { SatelliteMessage } from './entities/satellite-message.entity';
import { SatelliteDataService } from '../satellite-data/satellite-data.service';
import { TopsecretSplitCreateDto } from './dto/topsecret-split-create.dto';
import { isEmpty } from 'lodash';
import { TopsecretResponseDto } from './dto/topsecret-response.dto';
import {
  PRECISION_DELTA,
  SatelliteName,
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
    const messages = this.getMessages(
      satteliteMessagesDto.satellites.filter((value) => !isEmpty(value)),
    );
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
    const kenobiMessage = satelliteMessages.find(
      (satellite) => satellite.name === SatelliteName.KENOBI,
    );
    const satoMessage = satelliteMessages.find(
      (satellite) => satellite.name === SatelliteName.SATO,
    );
    const skywalkerMessage = satelliteMessages.find(
      (satellite) => satellite.name === SatelliteName.SKYWALKER,
    );
    const satelliteMessagesDto = new TopsecretDto([
      kenobiMessage,
      satoMessage,
      skywalkerMessage,
    ]);
    const response = this.topSecret(satelliteMessagesDto);

    if (!isEmpty(response)) {
      this.satelliteDataService.reset();
    }

    return response;
  }

  private getDistances(satellites: SatelliteMessage[]): number[] {
    return satellites
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((satellite) => satellite?.distance);
  }

  private getLocation(distances: number[]): number[] | number[][] | null {
    const distancesLengh = distances.filter(
      (value) => typeof value === 'number',
    );

    if (distancesLengh.length < 2) {
      return null;
    }

    let satellite_A: number[] = [];
    let satellite_B: number[] = [];
    let satellite_C: number[] = [];

    const [kenobiDistance, satoDistance, skywalkerDistance] = distances;
    if (distancesLengh.length === 3) {
      satellite_A = [...kenobiLocation, kenobiDistance];
      satellite_B = [...satoLocation, satoDistance];
      satellite_C = [...skywalkerLocation, skywalkerDistance];
    }

    if (isEmpty(kenobiDistance)) {
      satellite_A = [...satoLocation, satoDistance];
      satellite_B = [...skywalkerLocation, skywalkerDistance];
    }

    if (isEmpty(satoDistance)) {
      satellite_A = [...kenobiLocation, kenobiDistance];
      satellite_B = [...skywalkerLocation, skywalkerDistance];
    }

    if (isEmpty(skywalkerDistance)) {
      satellite_A = [...kenobiLocation, kenobiDistance];
      satellite_B = [...satoLocation, satoDistance];
    }

    const A =
      (satellite_A[1] - satellite_B[1]) / (satellite_A[0] - satellite_B[0]);
    const B =
      (-Math.pow(satellite_A[0], 2) -
        Math.pow(satellite_A[1], 2) +
        Math.pow(satellite_B[0], 2) +
        Math.pow(satellite_B[1], 2) +
        Math.pow(satellite_A[2], 2) -
        Math.pow(satellite_B[2], 2)) /
      (2 * satellite_A[0] - 2 * satellite_B[0]);

    // Bhaskara constants
    const a = Math.pow(A, 2) + 1;
    const b = -2 * A * B - 2 * satellite_A[0] * A + 2 * satellite_A[1];
    const c =
      2 * satellite_A[0] * B +
      Math.pow(B, 2) +
      Math.pow(satellite_A[0], 2) +
      Math.pow(satellite_A[1], 2) -
      Math.pow(satellite_A[2], 2);

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

    if (satellite_C.length === 0) {
      this.logger.log(
        'There may be possible positions because we have 2 satellites in place',
      );
      return [
        [xA, yA],
        [xB, yB],
      ];
    }

    const solution_A =
      Math.pow(satellite_C[0] + xA, 2) +
      Math.pow(satellite_C[1] + yA, 2) -
      Math.pow(satellite_C[2], 2);
    const solution_B =
      Math.pow(satellite_C[0] + xB, 2) +
      Math.pow(satellite_C[1] + yB, 2) -
      Math.pow(satellite_C[2], 2);

    // The three circumferences intersect at a single point
    if (solution_A < PRECISION_DELTA && solution_A > -PRECISION_DELTA) {
      this.logger.log(`Imperial ship found!: (${xA}, ${yA})`);

      return [xA, yA];
    }

    // The three circumferences intersect at a single point
    if (solution_B < PRECISION_DELTA && solution_B > -PRECISION_DELTA) {
      this.logger.log(`Imperial ship found!: (${xB}, ${yB})`);

      return [xB, yB];
    }

    this.logger.log(
      `One of the satellites capture the distance in a wrong way`,
    );
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
