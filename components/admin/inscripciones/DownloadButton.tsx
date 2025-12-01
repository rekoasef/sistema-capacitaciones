'use client';

import { FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { InscripcionAdminRow } from '@/lib/services/inscripcion.service';

interface DownloadButtonProps {
    data: InscripcionAdminRow[];
    fileName?: string;
}

export default function DownloadButton({ data, fileName = 'Reporte_Inscripciones' }: DownloadButtonProps) {
    
    const handleDownload = () => {
        if (!data || data.length === 0) {
            alert("No hay datos para exportar.");
            return;
        }

        // 1. Preparar los datos para Excel (Mapeo limpio)
        // Seleccionamos solo las columnas útiles para el reporte gerencial
        const excelData = data.map(row => ({
            Fecha: new Date(row.created_at).toLocaleDateString('es-AR'),
            Alumno: row.nombre_inscripto,
            Email: row.email_inscripto,
            Teléfono: row.telefono || '-',
            Curso: row.nombre_capacitacion,
            Grupo: row.nombre_grupo,
            Concesionario: row.nombre_concesionario,
            Asistencia: row.asistencia_marcada ? row.asistencia_marcada.toUpperCase() : 'PENDIENTE'
        }));

        // 2. Crear hoja de trabajo (Worksheet)
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // 3. Ajustar ancho de columnas automáticamente (Opcional, mejora UX)
        const colWidths = [
            { wch: 12 }, // Fecha
            { wch: 25 }, // Alumno
            { wch: 30 }, // Email
            { wch: 15 }, // Teléfono
            { wch: 30 }, // Curso
            { wch: 20 }, // Grupo
            { wch: 25 }, // Concesionario
            { wch: 12 }  // Asistencia
        ];
        worksheet['!cols'] = colWidths;

        // 4. Crear libro de trabajo (Workbook)
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Inscripciones");

        // 5. Generar archivo y descargar
        // Generamos un nombre con timestamp para que no se sobrescriban
        const timestamp = new Date().toISOString().slice(0,10);
        XLSX.writeFile(workbook, `${fileName}_${timestamp}.xlsx`);
    };

    return (
        <button
            onClick={handleDownload}
            disabled={data.length === 0}
            className={`
                flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm
                ${data.length > 0 
                    ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md cursor-pointer' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
            `}
            title="Descargar listado filtrado en Excel"
        >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Exportar Excel ({data.length})
        </button>
    );
}