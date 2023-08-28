import { Test, TestingModule } from '@nestjs/testing';
import { CommunicationInterpreterService } from '../comms-interpreter.service';
import { SatelliteMessagesDto } from '../dto/satellite-messages.dto';
import { BadRequestException } from '@nestjs/common';

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
      const { position } = service.topSecret(payloadMock);

      expect(position).toStrictEqual({ x: 2, y: 3 });
    });

    it('should return the location based on two distances', () => {
      const payloadMock = new SatelliteMessagesDto([
        {
          name: 'skywalker',
          distance: 115.5,
          message: ['', 'es', '', 'mensaje', 'secreto'],
        },
        {
          name: 'sato',
          distance: 142.7,
          message: ['este', '', 'un', '', ''],
        },
      ]);
      const { position } = service.topSecret(payloadMock);

      expect(position).toStrictEqual({ x: 2, y: 3 });
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

    it('should return the decoded message if it has all data needed', () => {
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
      const { message } = service.topSecret(payloadMock);

      expect(message).toStrictEqual('este es un mensaje secreto');
    });

    it('should return an error', () => {
      const payloadMock = new SatelliteMessagesDto([
        {
          name: 'kenobi',
          distance: 100.0,
          message: ['', '', '', 'mensaje', ''],
        },
        {
          name: 'skywalker',
          distance: 115.5,
          message: ['', 'es', '', '', 'secreto'],
        },
        {
          name: 'sato',
          distance: 142.7,
          message: ['', '', 'un', '', ''],
        },
      ]);

      expect(() => service.topSecret(payloadMock)).toThrow(BadRequestException);
      expect(() => service.topSecret(payloadMock)).toThrowError(
        "There is not enough information to determine the message or the sender's position.",
      );
    });
  });
});
