import { z } from 'zod';

// ====================================================================
// Esquema de Validación para el Formulario de Inscripción Pública
// ====================================================================

export const InscripcionFormSchema = z.object({
  // Datos del Alumno
  nombre_inscripto: z.string()
    .min(3, "El nombre completo debe tener al menos 3 caracteres.")
    .max(100, "El nombre es demasiado largo."),
  
  email_inscripto: z.string()
    .email("Por favor, ingresa una dirección de correo válida."),
  
  telefono: z.string()
    .min(6, "El teléfono debe tener al menos 6 caracteres para poder contactarte.")
    .max(20, "El número es demasiado largo."),

  // Relaciones (Selects y Datos Ocultos)
  
  // Usamos z.coerce.number() porque los valores de los <select> HTML suelen ser strings
  concesionario_id: z.coerce.number()
    .min(1, "Es obligatorio seleccionar el concesionario al que perteneces."),
  
  grupo_id: z.coerce.number()
    .min(1, "Error crítico: No se ha identificado el grupo de cursado."),
});

// ====================================================================
// Tipo Inferido para usar en React Hook Form
// ====================================================================

export type InscripcionFormInputs = z.infer<typeof InscripcionFormSchema>;