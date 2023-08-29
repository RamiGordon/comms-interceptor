import { Test, TestingModule } from '@nestjs/testing';
import { CommunicationInterpreterController } from '../comms-interpreter.controller';
import { CommunicationInterpreterService } from '../comms-interpreter.service';
import { SatelliteMessagesDto } from '../dto/satellite-messages.dto';

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

  it('should call comms service when calling to topsecret method', () => {
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

  it('should call service response when calling topsecret service', () => {
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
