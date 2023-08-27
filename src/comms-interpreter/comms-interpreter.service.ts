import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SatelliteMessagesDto } from './dto/satellite-messages.dto';
import { SatelliteMessage } from './entities/satellite-message.entity';
import {
  kenobiLocation,
  satoLocation,
  skywalkerLocation,
} from '../utils/satellite-locations';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const trilat = require('trilat');

@Injectable()
export class CommunicationInterpreterService {
  private logger = new Logger();

  topSecret(satteliteMessagesDto: SatelliteMessagesDto): number[] {
    const distances = this.getDistances(satteliteMessagesDto.satellites);

    if (distances.length < 3) {
      throw new BadRequestException(
        "There is not enough information to determine the message or the sender's position.",
      );
    }
    const location = this.getLocation(distances);

    return location;
  }

  private getDistances(satellites: SatelliteMessage[]): number[] {
    return satellites.map((satellite) => satellite.distance);
  }

  private getLocation(distances: number[]): number[] {
    const [kenobiX, kenobiY] = kenobiLocation;
    const [skywalkerX, skywalkerY] = skywalkerLocation;
    const [satoX, satoY] = satoLocation;
    const [r1, r2, r3] = distances;
    const input = [
      [kenobiX, kenobiY, r1],
      [skywalkerX, skywalkerY, r2],
      [satoX, satoY, r3],
    ];

    return trilat(input);
  }
}
