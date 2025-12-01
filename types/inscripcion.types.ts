import { z } from 'zod';

// ====================================================================
// Esquema de Validación Inteligente (Híbrido)
// ====================================================================

export const InscripcionFormSchema = z.object({
  // Datos Generales
  grupo_id: z.coerce.number().min(1, "Error crítico: Grupo no identificado."),
  concesionario_id: z.coerce.number().min(1, "Debes seleccionar un concesionario."),
  
  // Datos de Contacto (Siempre requeridos para la inscripción)
  email_inscripto: z.string().email("Ingresa un correo válido."),
  telefono: z.string().min(6, "El teléfono es requerido."),

  // LÓGICA CONDICIONAL: ¿Es nuevo o existente?
  // Usamos un campo bandera 'es_nuevo_mecanico' (string "true" o "false" desde el form)
  es_nuevo_mecanico: z.enum(["true", "false"]),

  // Campos para Mecánico Existente (Opcional si es nuevo)
  mecanico_id: z.string().optional(), // Viene como string del select, lo convertiremos

  // Campos para Nuevo Mecánico (Opcionales si es existente)
  nuevo_nombre: z.string().optional(),
  nuevo_apellido: z.string().optional(),

}).superRefine((data, ctx) => {
  // VALIDACIÓN CRUZADA (Custom Logic)
  
  if (data.es_nuevo_mecanico === "false") {
    // Si NO es nuevo, debe haber seleccionado un ID
    if (!data.mecanico_id || data.mecanico_id === "0") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debes seleccionar un mecánico de la lista.",
        path: ["mecanico_id"],
      });
    }
  } else {
    // Si ES nuevo, nombre y apellido son obligatorios
    if (!data.nuevo_nombre || data.nuevo_nombre.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El nombre es obligatorio para el nuevo registro.",
        path: ["nuevo_nombre"],
      });
    }
    if (!data.nuevo_apellido || data.nuevo_apellido.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El apellido es obligatorio.",
        path: ["nuevo_apellido"],
      });
    }
  }
});

export type InscripcionFormInputs = z.infer<typeof InscripcionFormSchema>;