import { Test, TestingModule } from '@nestjs/testing';
import { CapacitacionesService } from './capacitaciones.service';

describe('CapacitacionesService', () => {
  let service: CapacitacionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CapacitacionesService],
    }).compile();

    service = module.get<CapacitacionesService>(CapacitacionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
