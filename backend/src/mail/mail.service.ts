// backend/src/mail/mail.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';

// --- ¡LA SOLUCIÓN! ---
// Usamos 'require' en lugar de 'import' para compatibilidad con la librería de SendGrid
const sgMail = require('@sendgrid/mail');

@Injectable()
export class MailService implements OnModuleInit {

  // Ya no necesitamos un constructor, usamos OnModuleInit para configurar
  onModuleInit() {
    const apiKey = process.env.SENDGRID_API_KEY;

    if (!apiKey) {
      console.warn('ADVERTENCIA: SENDGRID_API_KEY no está definida. Los emails reales no se enviarán.');
    } else {
      // ¡Ahora 'sgMail.setApiKey' SÍ existirá y funcionará!
      sgMail.setApiKey(apiKey);
      console.log('Servicio de Mail (SendGrid) inicializado y listo para enviar correos.');
    }
  }

  async enviarEmailConfirmacion(
    emailUsuario: string,
    nombreUsuario: string,
    capacitacion: any,
    grupo: any,
  ) {
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;

    if (!fromEmail || !process.env.SENDGRID_API_KEY) {
      console.error('Error: Variables de SendGrid no configuradas. Simulando envío de email.');
      return;
    }

    const fechaFormateada = new Date(grupo.fechaInicio).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const msg = {
      to: emailUsuario,
      from: {
        email: fromEmail,
        name: 'Capacitaciones Crucianelli',
      },
      subject: '✅ Confirmación de Inscripción - Capacitación Crucianelli',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h1 style="color: #D80027; text-align: center;">¡Inscripción Confirmada!</h1>
          <p style="font-size: 16px;">¡Hola ${nombreUsuario}!</p>
          <p style="font-size: 16px;">Tu inscripción ha sido confirmada con éxito. Estamos muy contentos de tenerte con nosotros.</p>
          <hr>
          <h3 style="color: #333;">Detalles de la capacitación:</h3>
          <ul style="font-size: 16px; list-style-type: none; padding-left: 0;">
            <li><b>Capacitación:</b> ${capacitacion.nombre}</li>
            <li><b>Instructor:</b> ${capacitacion.instructor}</li>
            <li><b>Fecha:</b> ${fechaFormateada}</li>
          </ul>
          <p style="font-size: 16px;">¡Te esperamos!</p>
          <br>
          <p style="font-size: 12px; color: #888; text-align: center;">
            Este es un email automático, por favor no respondas a este correo.
          </p>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`Email enviado exitosamente a ${emailUsuario}`);
    } catch (error: any) {
      console.error('Error al enviar email con SendGrid:');
      if (error.response) {
        console.error(error.response.body);
      } else {
        console.error(error);
      }
    }
  }
}