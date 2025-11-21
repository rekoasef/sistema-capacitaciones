// backend/src/mail/mail.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import { GrupoSegmento } from '@prisma/client'; // <-- IMPORTANTE: Nuevo tipo de Prisma

dotenv.config();

// Interfaz para el envío de correo de confirmación (R7 con Segmentos)
interface EmailDetails {
  email: string;
  nombreUsuario: string;
  nombreCapacitacion: string;
  segmentos: GrupoSegmento[]; // <-- CORRECCIÓN: Se añade el campo faltante (Soluciona Error 3)
  ubicacion: string;
  concesionario: string | null;
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly fromEmail = process.env.MAIL_FROM || 'no-reply@crucianelli.com.ar';

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || '587', 10),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      // Desactivar TLS para entornos de desarrollo si es necesario
      tls: {
        rejectUnauthorized: process.env.NODE_ENV !== 'development',
      },
    });
  }

  // Helper para formatear solo la fecha (solo para el encabezado del email)
  private formatDateOnly(date: Date): string {
    const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('es-AR', dateOptions);
  }

  // Método para enviar el email de confirmación (R7 con Segmentos)
  async sendConfirmationEmail(details: EmailDetails) {

    // Generar la lista HTML para todos los segmentos
    const segmentosHtml = details.segmentos.map(segmento => {
        // Usamos Intl.DateTimeFormat para el formato de fecha para el segmento
        const dia = new Date(segmento.dia).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

        return `<li><strong>Día ${dia}:</strong> ${segmento.horaInicio} - ${segmento.horaFin} hs</li>`;
    }).join('');

    // Determinar la fecha de inicio/fin para el título (usando el primer y último segmento)
    const fechaInicio = details.segmentos.length > 0 ? this.formatDateOnly(details.segmentos[0].dia) : 'N/A';
    const fechaFin = details.segmentos.length > 0 ? this.formatDateOnly(details.segmentos[details.segmentos.length - 1].dia) : 'N/A';

    // Contenido del correo con la ubicación y los segmentos
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
        <h2 style="color: #D80027;">¡Inscripción Exitosa!</h2>
        <p>Hola ${details.nombreUsuario},</p>
        <p>Confirmamos tu inscripción a la siguiente capacitación:</p>

        <div style="border-left: 4px solid #0056b3; padding-left: 15px; margin: 20px 0;">
          <h3 style="color: #0056b3; margin-top: 0;">${details.nombreCapacitacion}</h3>

          <p><strong>Fechas del Curso (${fechaInicio} al ${fechaFin}):</strong></p>
          <ul style="padding-left: 20px;">
            ${segmentosHtml}
          </ul>

          <p><strong>Ubicación:</strong> ${details.ubicacion}</p>
          ${details.concesionario ? `<p><strong>Concesionario:</strong> ${details.concesionario}</p>` : ''}
        </div>

        <p>Por favor, guardá esta información. Si tenés alguna pregunta, contactanos.</p>
        <p>¡Te esperamos!</p>
        <p style="font-size: 0.9em; color: #777;">Equipo de Capacitaciones Crucianelli</p>
      </div>
    `;

    const mailOptions = {
      from: this.fromEmail,
      to: details.email,
      subject: `Confirmación: Inscripción a ${details.nombreCapacitacion}`,
      html: emailHtml,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Nodemailer Error:', error);
      throw new InternalServerErrorException('Error al enviar el correo de confirmación.');
    }
  }

  // Método para verificar la conexión SMTP (opcional)
  async verifyConnection() {
    return this.transporter.verify();
  }
}