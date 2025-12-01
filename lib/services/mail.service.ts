import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
    to: string;
    nombreAlumno: string;
    nombreCurso: string;
    nombreGrupo: string;
    ubicacion?: string | null;
    // FIX: Permitimos 'string | null' en los horarios para que coincida con la Base de Datos
    dias?: { fecha: string; hora_inicio: string | null; hora_fin: string | null }[];
}

export async function sendInscripcionEmail({ to, nombreAlumno, nombreCurso, nombreGrupo, ubicacion, dias }: EmailParams) {
    
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
        console.log("Simulando envío de email a:", to);
        return;
    }

    // 1. Lógica de Visualización
    // Si 'ubicacion' tiene texto real, es Presencial. Si es null/vacío, es Online.
    const esPresencial = ubicacion && ubicacion.length > 2;
    const modalidadTexto = esPresencial ? 'Presencial' : 'Online';
    
    // Generamos la fila de lugar SOLO si es presencial. Si es online, desaparece.
    const filaLugar = esPresencial 
        ? `<tr>
             <td style="padding: 5px 0; color: #666666; font-size: 14px; font-weight: bold;">Lugar:</td>
             <td style="padding: 5px 0; color: #333333; font-size: 14px;">${ubicacion}</td>
           </tr>`
        : ''; 

    // 2. Lógica de Días (Construcción a prueba de fallos)
    let diasHtml = '';
    if (dias && Array.isArray(dias) && dias.length > 0) {
        const listaItems = dias.map(d => {
            let fechaStr = d.fecha;
            try {
                // Ajuste de zona horaria para Argentina/Local
                const dateObj = new Date(d.fecha);
                const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
                const adjustedDate = new Date(dateObj.getTime() + userTimezoneOffset);
                fechaStr = adjustedDate.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
            } catch (e) { /* Fallback */ }

            // Manejo seguro de nulos con fallback a "00:00"
            const inicio = d.hora_inicio ? d.hora_inicio.slice(0, 5) : "00:00";
            const fin = d.hora_fin ? d.hora_fin.slice(0, 5) : "00:00";

            return `
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee; width: 60%;">
                        <strong style="text-transform: capitalize; color: #333;">${fechaStr}</strong>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee; text-align: right; color: #666; width: 40%;">
                        ${inicio} a ${fin} hs
                    </td>
                </tr>
            `;
        }).join('');

        diasHtml = `
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; border-top: 2px solid #eee;">
                <tr>
                    <td colspan="2" style="padding: 15px 0 5px 0; color: #CC0000; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                        Cronograma
                    </td>
                </tr>
                ${listaItems}
            </table>
        `;
    } else {
        diasHtml = `<p style="color: #999; font-style: italic; font-size: 13px; margin-top: 15px; text-align: center;">Cronograma a confirmar.</p>`;
    }

    // 3. HTML Limpio (Sin botón, solo info)
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td bgcolor="#CC0000" align="center" style="padding: 30px 20px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">¡Inscripción Confirmada!</h1>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Hola <strong>${nombreAlumno}</strong>,</p>
                            <p style="color: #555; font-size: 15px; line-height: 1.6;">Tu lugar ha sido reservado exitosamente. Aquí tienes los detalles operativos:</p>
                            
                            <!-- Card Datos -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 6px; border-left: 4px solid #CC0000; margin: 25px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h2 style="margin: 0 0 15px 0; color: #111; font-size: 18px;">${nombreCurso}</h2>
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td width="30%" style="padding: 5px 0; color: #666; font-weight: bold; font-size: 14px;">Grupo:</td>
                                                <td width="70%" style="padding: 5px 0; color: #333; font-size: 14px;">${nombreGrupo}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px 0; color: #666; font-weight: bold; font-size: 14px;">Modalidad:</td>
                                                <td style="padding: 5px 0; color: #333; font-size: 14px;">${modalidadTexto}</td>
                                            </tr>
                                            ${filaLugar}
                                        </table>
                                        ${diasHtml}
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #999; font-size: 13px; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
                                Si tienes alguna duda, responde a este correo.<br>
                                Crucianelli S.A. - Sistema de Gestión de Capacitaciones
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    const msg = {
        to,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: `Confirmación: ${nombreCurso}`,
        html: htmlContent,
    };

    try {
        await sgMail.send(msg);
        console.log(`✅ Email enviado a ${to}`);
    } catch (error: any) {
        console.error("🔴 Error enviando email:", error);
    }
}