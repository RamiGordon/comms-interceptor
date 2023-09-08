import { SatelliteMessage } from '@comms-interpreter/entities/satellite-message.entity';
import { Injectable } from '@nestjs/common';
import { isEmpty } from 'lodash';

@Injectable()
export class SatelliteDataService {
  private data: SatelliteMessage[] = [];

  findOne(satellite_name: string): SatelliteMessage {
    return (
      this.data.find((satellite) => satellite.name === satellite_name) || null
    );
  }

  findAll() {
    return this.data;
  }

  create(satellite: SatelliteMessage) {
    const existedSatellite = this.findOne(satellite.name);

    if (!isEmpty(existedSatellite)) {
      return this.update(satellite);
    }

    this.data.push(satellite);

    return satellite;
  }

  update(satelliteDto: SatelliteMessage) {
    const satellite = this.findOne(satelliteDto.name);

    satellite.distance = satelliteDto.distance;
    satellite.message = satelliteDto.message;

    return satellite;
  }

  reset() {
    this.data = [];
  }
}
