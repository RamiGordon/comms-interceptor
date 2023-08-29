import { Module } from '@nestjs/common';
import { CommunicationInterpreterService } from './comms-interpreter.service';
import { CommunicationInterpreterController } from './comms-interpreter.controller';
import { SatelliteDataModule } from '../satellite-data/satellite-data.module';

@Module({
  imports: [SatelliteDataModule],
  controllers: [CommunicationInterpreterController],
  providers: [CommunicationInterpreterService],
})
export class CommunicationInterpreterModule {}
