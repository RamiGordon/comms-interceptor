import { Test, TestingModule } from '@nestjs/testing';
import { CommunicationInterpreterService } from '../comms-interpreter.service';
import { SatelliteMessagesDto } from '../dto/satellite-messages.dto';
import { BadRequestException } from '@nestjs/common';

jest.mock('trilat', () => jest.fn().mockReturnValue([2, 3]));

describe('CommunicationInterpreterService', () => {
  let service: CommunicationInterpreterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommunicationInterpreterService],
    }).compile();

    service = module.get<CommunicationInterpreterService>(
      CommunicationInterpreterService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('topSecret', () => {
    it('should return the location based on three distances', () => {
      const payloadMock = new SatelliteMessagesDto([
        {
          name: 'kenobi',
          distance: 100.0,
          message: ['este', '', '', 'mensaje', ''],
        },
        {
          name: 'skywalker',
          distance: 115.5,
          message: ['', 'es', '', '', 'secreto'],
        },
        {
          name: 'sato',
          distance: 142.7,
          message: ['este', '', 'un', '', ''],
        },
      ]);
      const response = service.topSecret(payloadMock);

      expect(response).toStrictEqual([2, 3]);
    });

    it('should return an error based on two distances', () => {
      const payloadMock = new SatelliteMessagesDto([
        {
          name: 'skywalker',
          distance: 115.5,
          message: ['', 'es', '', '', 'secreto'],
        },
        {
          name: 'sato',
          distance: 142.7,
          message: ['este', '', 'un', '', ''],
        },
      ]);

      expect(() => service.topSecret(payloadMock)).toThrow(BadRequestException);
      expect(() => service.topSecret(payloadMock)).toThrowError(
        "There is not enough information to determine the message or the sender's position.",
      );
    });

    it('should return an error based on one distance', () => {
      const payloadMock = new SatelliteMessagesDto([
        {
          name: 'sato',
          distance: 142.7,
          message: ['este', '', 'un', '', ''],
        },
      ]);

      expect(() => service.topSecret(payloadMock)).toThrow(BadRequestException);
      expect(() => service.topSecret(payloadMock)).toThrowError(
        "There is not enough information to determine the message or the sender's position.",
      );
    });
  });
});
