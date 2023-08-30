import { Test, TestingModule } from '@nestjs/testing';
import { CommsInterpreterService } from '../comms-interpreter.service';
import { TopsecretDto } from '../dto/topsecret.dto';
import { NotFoundException } from '@nestjs/common';

jest.mock('trilat', () => jest.fn().mockReturnValue([2, 3]));

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

    // FIXME
    xit('should return an error based on two distances', () => {
      const payloadMock = new TopsecretDto([
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

      expect(() => service.topSecret(payloadMock)).toThrow(NotFoundException);
      expect(() => service.topSecret(payloadMock)).toThrowError(
        "There is not enough information to determine the message or the sender's position.",
      );
    });

    it('should return an error based on one distance', () => {
      const payloadMock = new TopsecretDto([
        {
          name: 'sato',
          distance: 142.7,
          message: ['este', '', 'un', '', ''],
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

    it('should return an error if it does not have enough information to decode the message', () => {
      const payloadMock = new TopsecretDto([
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

      expect(() => service.topSecret(payloadMock)).toThrow(NotFoundException);
      expect(() => service.topSecret(payloadMock)).toThrowError(
        "There is not enough information to determine the message or the sender's position.",
      );
    });
  });
});
