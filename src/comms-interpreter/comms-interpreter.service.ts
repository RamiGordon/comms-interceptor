import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SatelliteMessagesDto } from './dto/satellite-messages.dto';
import { SatelliteMessage } from './entities/satellite-message.entity';

@Injectable()
export class CommunicationInterpreterService {
  private logger = new Logger();

  topSecret(satteliteMessagesDto: SatelliteMessagesDto): number[] {
    const distances = this.getDistances(satteliteMessagesDto.satellites);
    const location = this.getLocation(distances);

    if (!location) {
      throw new BadRequestException(
        "There is not enough information to determine the message or the sender's position.",
      );
    }

    return location;
  }

  private getDistances(satellites: SatelliteMessage[]): number[] {
    return satellites.map((satellite) => satellite.distance);
  }

  private getLocation(distances: number[]): number[] | null {
    this.logger.log({ length: distances.length });
    return distances.length > 1 ? [2, 3] : null;
  }
}
