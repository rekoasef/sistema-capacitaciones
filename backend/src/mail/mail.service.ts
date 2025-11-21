// backend/src/mail/mail.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

// Interfaz para el envío de correo de confirmación (R7)
interface EmailDetails {
  email: string;
  nombreUsuario: string;
  nombreCapacitacion: string;
  fechaInicio: Date;
  fechaFin: Date; // R1: Nuevo campo
  ubicacion: string; // R6: Nuevo campo
  concesionario: string | null;
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly fromEmail = process.env.MAIL_FROM || 'no-reply@crucianelli.com.ar';

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Helper para formatear fechas
  private formatDateTime(date: Date): string {
    const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
    return `${date.toLocaleDateString('es-AR', dateOptions)} a las ${date.toLocaleTimeString('es-AR', timeOptions)} hs`;
  }

  // Método para enviar el email de confirmación (R7)
  async sendConfirmationEmail(details: EmailDetails) {
    const formattedInicio = this.formatDateTime(details.fechaInicio);
    const formattedFin = this.formatDateTime(details.fechaFin);
    
    // Contenido del correo con la ubicación y la hora de fin (R7)
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
        <h2 style="color: #D80027;">¡Inscripción Exitosa!</h2>
        <p>Hola ${details.nombreUsuario},</p>
        <p>Confirmamos tu inscripción a la siguiente capacitación:</p>
        
        <div style="border-left: 4px solid #0056b3; padding-left: 15px; margin: 20px 0;">
          <h3 style="color: #0056b3; margin-top: 0;">${details.nombreCapacitacion}</h3>
          <p><strong>Ubicación:</strong> ${details.ubicacion}</p>
          <p><strong>Comienzo:</strong> ${formattedInicio}</p>
          <p><strong>Finalización:</strong> ${formattedFin}</p>
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