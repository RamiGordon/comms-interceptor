import { Test, TestingModule } from '@nestjs/testing';
import { CommsInterpreterService } from '../comms-interpreter.service';
import { TopsecretDto } from '../dto/topsecret.dto';
import { NotFoundException } from '@nestjs/common';

describe('CommsInterpreterService', () => {
  let service: CommsInterpreterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommsInterpreterService],
    }).compile();

    service = module.get<CommsInterpreterService>(CommsInterpreterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('topSecret', () => {
    it('should return the location based on three distances', () => {
      const payloadMock = new TopsecretDto([
        {
          name: 'kenobi',
          distance: 600,
          message: ['este', '', '', 'mensaje', ''],
        },
        {
          name: 'skywalker',
          distance: 100,
          message: ['', 'es', '', '', 'secreto'],
        },
        {
          name: 'sato',
          distance: 500,
          message: ['este', '', 'un', '', ''],
        },
      ]);
      const { position } = service.topSecret(payloadMock);

      expect(position).toBeDefined();
    });

    it('should return an error based on two distances', () => {
      const payloadMock = new TopsecretDto([
        {
          name: 'skywalker',
          distance: 600,
          message: ['', 'es', '', 'mensaje', 'secreto'],
        },
        {
          name: 'sato',
          distance: 500,
          message: ['este', '', 'un', '', ''],
        },
      ]);

      expect(() => service.topSecret(payloadMock)).toThrow(NotFoundException);
    });

    it('should return an error based on one distance', () => {
      const payloadMock = new TopsecretDto([
        {
          name: 'sato',
          distance: 300,
          message: ['may', 'the', 'force', 'be', 'with', 'you'],
        },
      ]);

      expect(() => service.topSecret(payloadMock)).toThrow(NotFoundException);
      expect(() => service.topSecret(payloadMock)).toThrowError(
        "There is not enough information to determine the message or the sender's position.",
      );
    });

    it('should return the decoded message if it has all the required data', () => {
      const payloadMock = new TopsecretDto([
        {
          name: 'kenobi',
          distance: 600,
          message: ['este', '', '', 'mensaje', ''],
        },
        {
          name: 'skywalker',
          distance: 100,
          message: ['', 'es', '', '', 'secreto'],
        },
        {
          name: 'sato',
          distance: 500,
          message: ['', 'este', '', 'un', '', ''],
        },
      ]);
      const { message } = service.topSecret(payloadMock);

      expect(message).toStrictEqual('este es un mensaje secreto');
    });

    it('should return the decoded message if all satellites has de message complete', () => {
      const payloadMock = new TopsecretDto([
        {
          name: 'kenobi',
          distance: 600,
          message: ['may', 'the', 'force', 'be', 'with', 'you'],
        },
        {
          name: 'skywalker',
          distance: 100,
          message: ['may', 'the', 'force', 'be', 'with', 'you'],
        },
        {
          name: 'sato',
          distance: 500,
          message: ['may', 'the', 'force', 'be', 'with', 'you'],
        },
      ]);
      const { message } = service.topSecret(payloadMock);

      expect(message).toStrictEqual('may the force be with you');
    });

    it('should return an error if it does not have enough information to decode the message', () => {
      const payloadMock = new TopsecretDto([
        {
          name: 'kenobi',
          distance: 600,
          message: ['', '', '', 'mensaje', ''],
        },
        {
          name: 'skywalker',
          distance: 100,
          message: ['', 'es', '', '', 'secreto'],
        },
        {
          name: 'sato',
          distance: 500,
          message: ['', '', 'un', '', ''],
        },
      ]);

      expect(() => service.topSecret(payloadMock)).toThrow(NotFoundException);
      expect(() => service.topSecret(payloadMock)).toThrowError(
        "There is not enough information to determine the message or the sender's position.",
      );
    });

    it('case 1: should return an error if it does not have enough information to decode the message', () => {
      const payloadMock = new TopsecretDto([
        {
          name: 'kenobi',
          distance: 600,
          message: ['', 'the', '', 'be', '', 'you', ''],
        },
        {
          name: 'skywalker',
          distance: 100,
          message: ['may', '', '', '', '', 'you'],
        },
        {
          name: 'sato',
          distance: 500,
          message: ['', '', 'force', '', '', ''],
        },
      ]);

      expect(() => service.topSecret(payloadMock)).toThrow(NotFoundException);
      expect(() => service.topSecret(payloadMock)).toThrowError(
        "There is not enough information to determine the message or the sender's position.",
      );
    });

    it('case 2: should return an error if the distances are too far away', () => {
      const payloadMock = new TopsecretDto([
        {
          name: 'kenobi',
          distance: 100,
          message: ['', 'the', '', 'be', '', 'you', ''],
        },
        {
          name: 'skywalker',
          distance: 100,
          message: ['may', '', '', '', '', 'you'],
        },
        {
          name: 'sato',
          distance: 100,
          message: ['', '', 'force', '', '', ''],
        },
      ]);

      expect(() => service.topSecret(payloadMock)).toThrow(NotFoundException);
      expect(() => service.topSecret(payloadMock)).toThrowError(
        "There is not enough information to determine the message or the sender's position.",
      );
    });
  });
});
