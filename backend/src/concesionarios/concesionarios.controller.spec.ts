import { Test, TestingModule } from '@nestjs/testing';
import { ConcesionariosController } from './concesionarios.controller';

describe('ConcesionariosController', () => {
  let controller: ConcesionariosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConcesionariosController],
    }).compile();

    controller = module.get<ConcesionariosController>(ConcesionariosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
