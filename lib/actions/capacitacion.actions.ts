'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { 
    createCapacitacion, 
    updateCapacitacion, 
    deleteCapacitacion,
    getCapacitaciones 
} from '@/lib/services/capacitacion.service'; 
import { isSuperAdmin } from '@/lib/utils/auth.utils'; 
import { 
    CapacitacionFormInputs,
    CapacitacionRow 
} from '@/types/capacitacion.types';

// Esquema Local para el Action
const ModalidadEnum = z.enum(['presencial', 'online', 'hibrido']);
const EstadoCapacitacionEnum = z.enum(['visible', 'oculto', 'borrador']);

const LocalCapacitacionSchema = z.object({
    id: z.coerce.number().optional(), 
    nombre: z.string().min(5).max(255),
    descripcion: z.string().min(20).max(1000),
    modalidad: ModalidadEnum.default('online'),
    estado: EstadoCapacitacionEnum.default('borrador'),
    ubicacion: z.string().optional().nullable(), // Agregamos ubicacion
});

export async function getCapacitacionesAction(): Promise<{ success: true, data: CapacitacionRow[] } | { success: false, message: string }> {
    if (!(await isSuperAdmin())) return { success: false, message: 'Fallo de autorización.' };
    try {
        const data = await getCapacitaciones(); 
        return { success: true, data };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

export async function createCapacitacionAction(prevState: any, formData: FormData) {
    if (!(await isSuperAdmin())) return { message: 'No autorizado.' };
    
    const validatedFields = LocalCapacitacionSchema.safeParse({
        nombre: formData.get('nombre'),
        descripcion: formData.get('descripcion'),
        modalidad: formData.get('modalidad'),
        estado: formData.get('estado'),
        ubicacion: formData.get('ubicacion'), // Leemos ubicacion
    });

    if (!validatedFields.success) return { errors: validatedFields.error.flatten().fieldErrors, message: 'Campos inválidos.' };
    
    const data: Omit<CapacitacionFormInputs, 'id'> = validatedFields.data;

    try {
        await createCapacitacion(data); 
        revalidatePath('/admin/capacitaciones'); 
        return { success: true, message: 'Capacitación creada con éxito.' };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

export async function updateCapacitacionAction(prevState: any, formData: FormData) {
    if (!(await isSuperAdmin())) return { message: 'No autorizado.' };

    const validatedFields = LocalCapacitacionSchema.safeParse({
        id: formData.get('id'), 
        nombre: formData.get('nombre'),
        descripcion: formData.get('descripcion'),
        modalidad: formData.get('modalidad'),
        estado: formData.get('estado'),
        ubicacion: formData.get('ubicacion'), // Leemos ubicacion
    });

    if (!validatedFields.success) return { errors: validatedFields.error.flatten().fieldErrors, message: 'Campos inválidos.' };

    const { id, ...updateData } = validatedFields.data;
    if (!id) return { message: 'Falta ID.' };

    try {
        await updateCapacitacion(id, updateData);
        revalidatePath('/admin/capacitaciones');
        return { success: true, message: 'Actualizada con éxito.' };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

export async function deleteCapacitacionAction(id: number) {
    if (!(await isSuperAdmin())) return { success: false, message: 'No autorizado.' };
    try {
        await deleteCapacitacion(id);
        revalidatePath('/admin/capacitaciones');
        return { success: true, message: 'Eliminada con éxito.' };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}