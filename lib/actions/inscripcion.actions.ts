'use server';

import { revalidatePath } from 'next/cache';
import { isSuperAdmin } from '@/lib/utils/auth.utils';
import { createInscripcion, deleteInscripcion, updateAsistencia } from '@/lib/services/inscripcion.service';
import { createMecanico } from '@/lib/services/mecanico.service';
import { InscripcionFormSchema, InscripcionFormInputs } from '@/types/inscripcion.types';
import { createClient } from '@/lib/supabase/server';
import { sendInscripcionEmail } from '@/lib/services/mail.service';

export async function createInscripcionAction(data: InscripcionFormInputs) {
    const validation = InscripcionFormSchema.safeParse(data);

    if (!validation.success) {
        return { success: false, message: 'Datos inválidos.', errors: validation.error.flatten().fieldErrors };
    }

    const { es_nuevo_mecanico, mecanico_id, nuevo_nombre, nuevo_apellido, concesionario_id, email_inscripto, telefono, grupo_id } = validation.data;
    const supabase = createClient();

    try {
        let finalMecanicoId: number;
        let finalNombreCompleto: string;

        if (es_nuevo_mecanico === "true") {
            const newId = await createMecanico({
                concesionario_id: concesionario_id,
                nombre: nuevo_nombre!,   
                apellido: nuevo_apellido!, 
                rol: 'Mecánico', 
                nivel: 'Junior'          
            });
            finalMecanicoId = newId;
            finalNombreCompleto = `${nuevo_nombre} ${nuevo_apellido}`; 
        } else {
            if (!mecanico_id) throw new Error("ID de mecánico no válido.");
            finalMecanicoId = parseInt(mecanico_id);
            const { data: rawMecanico, error } = await supabase
                // @ts-ignore
                .from('mecanicos').select('nombre, apellido').eq('id', finalMecanicoId).single();
            if (error || !rawMecanico) finalNombreCompleto = "Mecánico";
            else {
                const m = rawMecanico as unknown as { nombre: string; apellido: string };
                finalNombreCompleto = `${m.nombre} ${m.apellido}`;
            }
        }

        await createInscripcion({
            grupo_id,
            concesionario_id,
            email_inscripto,
            telefono,
            nombre_inscripto: finalNombreCompleto,
            mecanico_id: finalMecanicoId
        });

        // --- PREPARACIÓN DE EMAIL ROBUSTA (V2) ---
        // 1. Datos del Grupo y Curso (Join simple)
        const { data: grupoData } = await supabase
            .from('grupos')
            .select('nombre_grupo, capacitacion:capacitaciones(nombre, ubicacion)')
            .eq('id', grupo_id)
            .single();
        
        // 2. Datos de Días (CONSULTA EXPLÍCITA y SEPARADA)
        // Esto asegura que traigamos los días sí o sí, sin depender de alias raros
        const { data: diasData } = await supabase
            .from('dias_grupo')
            .select('fecha, hora_inicio, hora_fin')
            .eq('grupo_id', grupo_id)
            .order('fecha', { ascending: true });

        if (grupoData) {
            // @ts-ignore
            const nombreCurso = grupoData.capacitacion?.nombre || 'Capacitación';
            // @ts-ignore
            const ubicacion = grupoData.capacitacion?.ubicacion || null;
            const dias = diasData || []; // Usamos el resultado de la consulta explícita
            
            await sendInscripcionEmail({
                to: email_inscripto,
                nombreAlumno: finalNombreCompleto,
                nombreCurso: nombreCurso,
                nombreGrupo: grupoData.nombre_grupo || 'General',
                ubicacion: ubicacion,
                dias: dias
            });
        }

        revalidatePath('/'); 
        revalidatePath('/admin/inscripciones');
        revalidatePath('/admin/concesionarios'); 

        return { success: true, message: '¡Inscripción confirmada! Revisa tu correo.' };

    } catch (error) {
        console.error("Error en createInscripcionAction:", error);
        return { success: false, message: (error as Error).message || 'Error técnico.' };
    }
}

export async function deleteInscripcionAction(id: string) {
    if (!(await isSuperAdmin())) return { success: false, message: 'No autorizado.' };
    try {
        await deleteInscripcion(id);
        revalidatePath('/admin/inscripciones');
        revalidatePath('/admin/dashboard');
        revalidatePath('/'); 
        return { success: true, message: 'Eliminado.' };
    } catch (error) { return { success: false, message: (error as Error).message }; }
}

export async function updateAsistenciaAction(id: string, estado: string) {
    if (!(await isSuperAdmin())) return { success: false, message: 'No autorizado.' };
    try {
        await updateAsistencia(id, estado);
        revalidatePath('/admin/inscripciones');
        revalidatePath('/admin/dashboard');
        return { success: true, message: 'Asistencia actualizada.' };
    } catch (error) { return { success: false, message: (error as Error).message }; }
}