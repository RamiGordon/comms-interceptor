import { Test, TestingModule } from '@nestjs/testing';
import { SatelliteDataService } from './satellite-data.service';

describe('SatelliteDataService', () => {
  let service: SatelliteDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SatelliteDataService],
    }).compile();

    service = module.get<SatelliteDataService>(SatelliteDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
