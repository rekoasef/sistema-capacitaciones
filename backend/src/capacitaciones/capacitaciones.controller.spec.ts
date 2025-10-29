import { Test, TestingModule } from '@nestjs/testing';
import { CapacitacionesController } from './capacitaciones.controller';

describe('CapacitacionesController', () => {
  let controller: CapacitacionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CapacitacionesController],
    }).compile();

    controller = module.get<CapacitacionesController>(CapacitacionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
