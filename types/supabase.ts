export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      capacitaciones: {
        Row: {
          created_at: string | null
          descripcion: string | null
          estado: Database["public"]["Enums"]["estado_capacitacion_enum"]
          id: number
          modalidad: Database["public"]["Enums"]["modalidad_enum"]
          nombre: string
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["estado_capacitacion_enum"]
          id?: never
          modalidad?: Database["public"]["Enums"]["modalidad_enum"]
          nombre: string
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["estado_capacitacion_enum"]
          id?: never
          modalidad?: Database["public"]["Enums"]["modalidad_enum"]
          nombre?: string
        }
        Relationships: []
      }
      concesionarios: {
        Row: {
          created_at: string | null
          id: number
          nombre: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          nombre: string
        }
        Update: {
          created_at?: string | null
          id?: never
          nombre?: string
        }
        Relationships: []
      }
      dias_grupo: {
        Row: {
          created_at: string | null
          fecha: string
          grupo_id: number
          hora_fin: string | null
          hora_inicio: string | null
          id: number
        }
        Insert: {
          created_at?: string | null
          fecha: string
          grupo_id: number
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: never
        }
        Update: {
          created_at?: string | null
          fecha?: string
          grupo_id?: number
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: never
        }
        Relationships: [
          {
            foreignKeyName: "dias_grupo_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      grupos: {
        Row: {
          capacitacion_id: number
          created_at: string | null
          cupo_maximo: number
          estado: Database["public"]["Enums"]["estado_grupo_enum"]
          id: number
          nombre_grupo: string | null
        }
        Insert: {
          capacitacion_id: number
          created_at?: string | null
          cupo_maximo?: number
          estado?: Database["public"]["Enums"]["estado_grupo_enum"]
          id?: never
          nombre_grupo?: string | null
        }
        Update: {
          capacitacion_id?: number
          created_at?: string | null
          cupo_maximo?: number
          estado?: Database["public"]["Enums"]["estado_grupo_enum"]
          id?: never
          nombre_grupo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grupos_capacitacion_id_fkey"
            columns: ["capacitacion_id"]
            isOneToOne: false
            referencedRelation: "capacitaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      inscripciones: {
        Row: {
          asistencia_marcada: string
          concesionario_id: number | null
          created_at: string | null
          email_inscripto: string
          grupo_id: number
          id: string
          nombre_inscripto: string
          telefono: string | null
        }
        Insert: {
          asistencia_marcada?: string
          concesionario_id?: number | null
          created_at?: string | null
          email_inscripto: string
          grupo_id: number
          id?: string
          nombre_inscripto: string
          telefono?: string | null
        }
        Update: {
          asistencia_marcada?: string
          concesionario_id?: number | null
          created_at?: string | null
          email_inscripto?: string
          grupo_id?: number
          id?: string
          nombre_inscripto?: string
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inscripciones_concesionario_id_fkey"
            columns: ["concesionario_id"]
            isOneToOne: false
            referencedRelation: "concesionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscripciones_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      permisos: {
        Row: {
          accion: string
          id: number
          recurso: string
        }
        Insert: {
          accion: string
          id?: never
          recurso: string
        }
        Update: {
          accion?: string
          id?: never
          recurso?: string
        }
        Relationships: []
      }
      rol_permisos: {
        Row: {
          id: number
          permiso_id: number
          rol_id: number
        }
        Insert: {
          id?: never
          permiso_id: number
          rol_id: number
        }
        Update: {
          id?: never
          permiso_id?: number
          rol_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "rol_permisos_permiso_id_fkey"
            columns: ["permiso_id"]
            isOneToOne: false
            referencedRelation: "permisos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rol_permisos_rol_id_fkey"
            columns: ["rol_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          descripcion: string | null
          id: number
          nombre: string
        }
        Insert: {
          descripcion?: string | null
          id?: never
          nombre: string
        }
        Update: {
          descripcion?: string | null
          id?: never
          nombre?: string
        }
        Relationships: []
      }
      usuarios_admin: {
        Row: {
          created_at: string | null
          email: string
          rol_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          rol_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          rol_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_admin_rol_id_fkey"
            columns: ["rol_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role_id: { Args: never; Returns: number }
      is_super_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      estado_capacitacion_enum: "visible" | "oculto" | "borrador"
      estado_grupo_enum: "activo" | "inactivo" | "cerrado" | "lleno"
      modalidad_enum: "presencial" | "online" | "hibrido"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      estado_capacitacion_enum: ["visible", "oculto", "borrador"],
      estado_grupo_enum: ["activo", "inactivo", "cerrado", "lleno"],
      modalidad_enum: ["presencial", "online", "hibrido"],
      nivel_mecanico_enum: ["Junior" , "Basico" , "Avanzado"]
    },
  },
} as const
