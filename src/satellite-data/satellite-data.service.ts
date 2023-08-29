import { Injectable } from '@nestjs/common';
import { SatelliteMessage } from '../comms-interpreter/entities/satellite-message.entity';

@Injectable()
export class SatelliteDataService {
  private data: SatelliteMessage[] = [];

  getSatellite(satellite_name: string): SatelliteMessage {
    return (
      this.data.find((satellite) => satellite.name === satellite_name) || null
    );
  }

  getAll() {
    return this.data;
  }

  addSatellite(satellite: SatelliteMessage) {
    this.data.push(satellite);
  }

  reset() {
    this.data = [];
  }
}
