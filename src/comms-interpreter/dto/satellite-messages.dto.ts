import { SatelliteMessage } from '../entities/satellite-message.entity';

export class SatelliteMessagesDto {
  satellites: SatelliteMessage[];

  constructor(satellites: SatelliteMessage[]) {
    this.satellites = satellites;
  }
}
