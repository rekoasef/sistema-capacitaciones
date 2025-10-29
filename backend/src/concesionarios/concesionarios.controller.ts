// src/concesionarios/concesionarios.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ConcesionariosService } from './concesionarios.service';

@Controller('concesionarios')
export class ConcesionariosController {
  constructor(private readonly concesionariosService: ConcesionariosService) {}

  @Get()
  findAll() {
    return this.concesionariosService.findAll();
  }
}