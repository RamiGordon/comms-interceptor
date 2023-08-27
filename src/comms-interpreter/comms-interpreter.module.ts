import { Module } from '@nestjs/common';
import { CommunicationInterpreterService } from './comms-interpreter.service';
import { CommunicationInterpreterController } from './comms-interpreter.controller';

@Module({
  controllers: [CommunicationInterpreterController],
  providers: [CommunicationInterpreterService],
})
export class CommunicationInterpreterModule {}
