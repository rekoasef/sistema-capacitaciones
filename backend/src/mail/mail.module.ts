// src/mail/mail.module.ts

import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';

@Global() // <-- ¡IMPORTANTE! Hace que el módulo sea global
@Module({
  providers: [MailService],
  exports: [MailService], // Exportamos el servicio para que sea inyectable
})
export class MailModule {}