import { Test, TestingModule } from '@nestjs/testing';
import { InscripcionesController } from './inscripciones.controller';

describe('InscripcionesController', () => {
  let controller: InscripcionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InscripcionesController],
    }).compile();

    controller = module.get<InscripcionesController>(InscripcionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
