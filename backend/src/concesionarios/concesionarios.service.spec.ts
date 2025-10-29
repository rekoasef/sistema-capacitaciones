import { Test, TestingModule } from '@nestjs/testing';
import { ConcesionariosService } from './concesionarios.service';

describe('ConcesionariosService', () => {
  let service: ConcesionariosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConcesionariosService],
    }).compile();

    service = module.get<ConcesionariosService>(ConcesionariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
