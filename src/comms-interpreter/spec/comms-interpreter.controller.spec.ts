import { Test, TestingModule } from '@nestjs/testing';
import { CommunicationInterpreterController } from '../comms-interpreter.controller';
import { CommunicationInterpreterService } from '../comms-interpreter.service';
import { SatelliteMessagesDto } from '../dto/satellite-messages.dto';
import { TopsecretSplitCreateDto } from '../dto/topsecret-split-create.dto';
import { BadRequestException } from '@nestjs/common';

describe('CommunicationInterpreterController', () => {
  let controller: CommunicationInterpreterController;
  let service: CommunicationInterpreterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunicationInterpreterController],
      providers: [CommunicationInterpreterService],
    }).compile();

    controller = module.get<CommunicationInterpreterController>(
      CommunicationInterpreterController,
    );
    service = module.get<CommunicationInterpreterService>(
      CommunicationInterpreterService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('/topsecret (POST)', () => {
    it('should call topSecret method from comms service', () => {
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

      const topsecretSpy = jest.spyOn(service, 'topSecret');

      controller.topsecret(payloadMock);
      expect(topsecretSpy).toHaveBeenCalled();
    });

    it('should return topsecret response', () => {
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
      const mockResponse = { position: { x: 2, y: 3 }, message: '' };
      const topsecretSpy = jest
        .spyOn(service, 'topSecret')
        .mockReturnValue(mockResponse);
      const response = controller.topsecret(payloadMock);

      expect(topsecretSpy).toHaveBeenCalledWith(payloadMock);
      expect(response).toBe(mockResponse);
    });
  });

  describe('/topsecret_split/:satellite_name (POST)', () => {
    it('should call captureSatelliteMessage method from comms service', () => {
      const payloadMock = new TopsecretSplitCreateDto({
        distance: 100.0,
        message: ['este', '', '', 'mensaje', ''],
      });

      const captureSatelliteMessageSpy = jest.spyOn(
        service,
        'captureSatelliteMessage',
      );

      controller.captureSatelliteMessage('kenobi', payloadMock);
      expect(captureSatelliteMessageSpy).toHaveBeenCalled();
    });
  });

  describe('/topsecret_split (GET)', () => {
    const mockResponse = { position: { x: 1, y: 2 }, message: 'a message' };

    it('should call decodeMessageAndPosition method from comms service', () => {
      const decodeMessageAndPositionSpy = jest
        .spyOn(service, 'decodeMessageAndPosition')
        .mockReturnValue(mockResponse);

      controller.decodeMessageAndPosition();
      expect(decodeMessageAndPositionSpy).toHaveBeenCalled();
    });

    it('should return decodeMessageAndPosition response if message and position can be calulated', () => {
      jest
        .spyOn(service, 'decodeMessageAndPosition')
        .mockReturnValue(mockResponse);
      const response = controller.decodeMessageAndPosition();

      expect(response).toBe(mockResponse);
    });

    it('should return an error response if message and position can not be calulated', () => {
      jest.spyOn(service, 'decodeMessageAndPosition');

      expect(() => controller.decodeMessageAndPosition()).toThrow(
        BadRequestException,
      );
    });
  });
});
