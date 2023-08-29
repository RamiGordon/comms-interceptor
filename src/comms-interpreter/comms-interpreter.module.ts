import { Module } from '@nestjs/common';
import { CommsInterpreterService } from './comms-interpreter.service';
import { CommsInterpreterController } from './comms-interpreter.controller';
import { SatelliteDataModule } from '../satellite-data/satellite-data.module';

@Module({
  imports: [SatelliteDataModule],
  controllers: [CommsInterpreterController],
  providers: [CommsInterpreterService],
})
export class CommsInterpreterModule {}
