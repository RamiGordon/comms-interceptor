import { Module } from '@nestjs/common';
import { SatelliteDataService } from './satellite-data.service';

@Module({
  controllers: [],
  providers: [SatelliteDataService],
})
export class SatelliteDataModule {}
