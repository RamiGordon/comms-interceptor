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
} from '../utils/satellite-locations.stub';
import {
  ICalculateBhaskaraConstants,
  ICalculateBhaskaraConstantsResponse,
  ICalculateCeoefficientsResponse,
  ICalculateCoordinatesResponse,
  ICalculateSatelliteLocations,
  ICalculateSolution,
} from './interfaces/Locations';

@Injectable()
export class CommsInterpreterService {
  private satelliteDataService = new SatelliteDataService();
  private logger = new Logger();

  topSecret(satteliteMessagesDto: TopsecretDto): TopsecretResponseDto {
    const distances = this.getDistances(satteliteMessagesDto.satellites);
    const position = this.getLocation(distances);
    const messages = this.getMessagesData(
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

  private getMessage(messages: string[][]): string | null {
    this.logger.log('Decoding message...');
    const sortedMessages = messages.sort((a, b) => b.length - a.length);
    const maxLength = Math.max(
      ...sortedMessages.map((message) => message.length),
    );
    const msg = [];

    for (let x = 0; x < maxLength; x++) {
      for (let z = 0; z < messages.length; z++) {
        if (!isEmpty(sortedMessages[z][x])) {
          msg.push(sortedMessages[z][x]);
        }
      }
    }

    const messageLength = Math.min(
      ...messages.map((message) => message.length),
    );

    const decodedMessage = [...new Set(msg)];
    if (decodedMessage.length < messageLength) {
      this.logger.error(`Partial message: ${decodedMessage.join(' ')}`);

      return null;
    }

    this.logger.log(`Message decoded: ${decodedMessage.join(' ')}`);
    return decodedMessage.join(' ');
  }

  private getMessagesData(satellites: SatelliteMessage[]): string[][] {
    return satellites.map((satellite) => satellite.message);
  }

  private getLocation(distances: number[]): number[] | number[][] | null {
    const distancesLength = distances.filter(
      (value) => typeof value === 'number',
    ).length;

    if (distancesLength < 2) {
      return null;
    }
    const [kenobiDistance, satoDistance, skywalkerDistance] = distances;
    const [satellite_A, satellite_B, satellite_C] =
      this.calculateSatelliteLocations({
        kenobiDistance,
        satoDistance,
        skywalkerDistance,
        distancesLength,
      });

    const coordinates = this.calculateCoordinates(satellite_A, satellite_B);

    if (!coordinates) {
      return null;
    }
    const { xA, yA, xB, yB } = coordinates;

    if (!satellite_C) {
      this.logger.log(
        'There may be possible positions because we have 2 satellites in place',
      );

      return [
        [xA, yA],
        [xB, yB],
      ];
    }

    const solution_A = this.calculateSolution({
      satellite: satellite_C,
      x: xA,
      y: yA,
    });
    const solution_B = this.calculateSolution({
      satellite: satellite_C,
      x: xB,
      y: yB,
    });

    if (this.isSolutionValid(solution_A)) {
      this.logger.log(`Imperial ship found!: (${xA}, ${yA})`);

      return [xA, yA];
    }

    if (this.isSolutionValid(solution_B)) {
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

  private getDistances(satellites: SatelliteMessage[]): number[] {
    return satellites
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((satellite) => satellite?.distance);
  }

  private calculateSatelliteLocations({
    kenobiDistance,
    satoDistance,
    skywalkerDistance,
    distancesLength,
  }: ICalculateSatelliteLocations): number[][] {
    if (distancesLength === 3) {
      return [
        [...kenobiLocation, kenobiDistance],
        [...satoLocation, satoDistance],
        [...skywalkerLocation, skywalkerDistance],
      ];
    }

    if (isEmpty(kenobiDistance)) {
      return [
        [...satoLocation, satoDistance],
        [...skywalkerLocation, skywalkerDistance],
      ];
    }

    if (isEmpty(satoDistance)) {
      return [
        [...kenobiLocation, kenobiDistance],
        [...skywalkerLocation, skywalkerDistance],
      ];
    }

    if (isEmpty(skywalkerDistance)) {
      return [
        [...kenobiLocation, kenobiDistance],
        [...satoLocation, satoDistance],
      ];
    }
  }

  private calculateCeoefficients(
    satellite_A: number[],
    satellite_B: number[],
  ): ICalculateCeoefficientsResponse {
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

    return { A, B };
  }

  private calculateBhaskaraConstants({
    A,
    B,
    satellite_A,
  }: ICalculateBhaskaraConstants): ICalculateBhaskaraConstantsResponse {
    const a = Math.pow(A, 2) + 1;
    const b = -2 * A * B - 2 * satellite_A[0] * A + 2 * satellite_A[1];
    const c =
      2 * satellite_A[0] * B +
      Math.pow(B, 2) +
      Math.pow(satellite_A[0], 2) +
      Math.pow(satellite_A[1], 2) -
      Math.pow(satellite_A[2], 2);

    return { a, b, c };
  }

  private calculateCoordinates(
    satellite_A: number[],
    satellite_B: number[],
  ): ICalculateCoordinatesResponse | null {
    const { A, B } = this.calculateCeoefficients(satellite_A, satellite_B);

    const { a, b, c } = this.calculateBhaskaraConstants({ A, B, satellite_A });

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

    return { xA, yA, xB, yB };
  }

  private calculateSolution({ satellite, x, y }: ICalculateSolution): number {
    return (
      Math.pow(satellite[0] + x, 2) +
      Math.pow(satellite[1] + y, 2) -
      Math.pow(satellite[2], 2)
    );
  }

  private isSolutionValid(solution: number): boolean {
    return solution < PRECISION_DELTA && solution > -PRECISION_DELTA;
  }
}
