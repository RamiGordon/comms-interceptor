import { CommsInterpreterController } from '@comms-interpreter/comms-interpreter.controller';
import { CommsInterpreterService } from '@comms-interpreter/comms-interpreter.service';
import { SatelliteDataModule } from '@satellite-data/satellite-data.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [SatelliteDataModule],
  controllers: [CommsInterpreterController],
  providers: [CommsInterpreterService],
})
export class CommsInterpreterModule {}
