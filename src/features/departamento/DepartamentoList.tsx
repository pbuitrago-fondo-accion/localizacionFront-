import { useState } from 'react';
import { Box, CircularProgress, Alert, Chip, Dialog } from '@mui/material';
import RioDataTable from '../../components/RioDataTable';
import { useConfirm } from '../../hooks/useConfirm';
import {
    useGetDepartamentosQuery,
    useCreateDepartamentoMutation,
    useUpdateDepartamentoMutation,
    useDeleteDepartamentoMutation,
} from './departamentoApi';
import { useGetPaisesQuery } from '../pais/paisApi';
import type { Departamento, DepartamentoRequest } from './types';
import DepartamentoForm from './DepartamentoForm';

export default function DepartamentoList() {
    const { data: departamentos, isLoading, isError } = useGetDepartamentosQuery();
    const { data: paises } = useGetPaisesQuery();
    const [createDepartamento] = useCreateDepartamentoMutation();
    const [updateDepartamento] = useUpdateDepartamentoMutation();
    const [deleteDepartamento] = useDeleteDepartamentoMutation();
    const confirmar = useConfirm();

    const [dialogoAbierto, setDialogoAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<Departamento | null>(null);

    const cerrarDialogo = () => { setDialogoAbierto(false); };
    const handleCrear = () => { setSeleccionado(null); setDialogoAbierto(true); };
    const handleEditar = (fila: Departamento) => { setSeleccionado(fila); setDialogoAbierto(true); };

    const handleEliminar = async (fila: Departamento) => {
        const confirmado = await confirmar({
            header: 'Confirmar eliminación',
            message: `¿Deseas eliminar el departamento "${fila.departamentoNombre}"?`,
        });
        if (confirmado) await deleteDepartamento(fila.departamentoId);
    };

    const handleGuardar = async (data: DepartamentoRequest, esEditar: boolean) => {
        if (esEditar) await updateDepartamento(data);
        else await createDepartamento(data);
        cerrarDialogo();
    };

    const paisNombre = (paisId: unknown) => paises?.find((p) => p.paisId === paisId)?.paisNombre ?? String(paisId ?? '—');

    const columnas: { campo: keyof Departamento & string; encabezado: string; anchoFijo?: number; align?: 'left' | 'center' | 'right'; alignEncabezado?: 'left' | 'center' | 'right'; render?: (valor: unknown, fila: unknown) => React.ReactNode }[] = [
        { campo: 'departamentoId', encabezado: 'ID', anchoFijo: 80, align: 'center', alignEncabezado: 'center' },
        { campo: 'departamentoCodigo', encabezado: 'Código', anchoFijo: 120 },
        { campo: 'departamentoNombre', encabezado: 'Nombre' },
        { campo: 'departamentoPaisId', encabezado: 'País', anchoFijo: 160, render: (valor: unknown) => paisNombre(valor), exportarValor: (valor: unknown) => paisNombre(valor) },
        {
            campo: 'logDesactivacionFecha',
            encabezado: 'Estado',
            anchoFijo: 110,
            align: 'center',
            alignEncabezado: 'center',
            render: (valor: unknown) => (
                <Chip label={valor == null ? 'ACTIVO' : 'INACTIVO'} color={valor == null ? 'success' : 'default'} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
            ),
            exportarValor: (valor: unknown) => valor == null ? 'ACTIVO' : 'INACTIVO',
        },
    ];

    return (
        <Box sx={{ p: 2 }}>
            {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
            {isError && <Alert severity="error">No se pudieron cargar los departamentos.</Alert>}
            {!isLoading && !isError && (
                <RioDataTable
                    titulo="Departamentos"
                    mensajeVacio="No hay departamentos registrados."
                    columnas={columnas}
                    datos={departamentos ?? []}
                    dataKey="departamentoId"
                    onEditar={handleEditar}
                    onEliminar={handleEliminar}
                    onCrear={handleCrear}
                    labelCrear="Crear Departamento"
                    exportarNombreArchivo="Departamentos"
                />
            )}
            <Dialog
                open={dialogoAbierto}
                onClose={cerrarDialogo}
                maxWidth="sm"
                fullWidth
                TransitionProps={{ onExited: () => setSeleccionado(null) }}
            >
                <DepartamentoForm
                    key={seleccionado?.departamentoId ?? 'nuevo'}
                    departamento={seleccionado}
                    onCancelar={cerrarDialogo}
                    onGuardar={handleGuardar}
                />
            </Dialog>
        </Box>
    );
}
