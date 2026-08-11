import { useState } from 'react';
import { Box, CircularProgress, Alert, Chip, Dialog } from '@mui/material';
import RioDataTable from '../../components/RioDataTable';
import { useConfirm } from '../../hooks/useConfirm';
import {
    useGetPaisesQuery,
    useCreatePaisMutation,
    useUpdatePaisMutation,
    useDeletePaisMutation,
} from './paisApi';
import type { Pais, PaisRequest } from './types';
import PaisForm from './PaisForm';
import DepartamentosPanel from '../departamento/DepartamentosPanel';

const columnas = [
    { campo: 'paisCodigoIso', encabezado: 'Código ISO', anchoFijo: 140 },
    { campo: 'paisNombre', encabezado: 'Nombre' },
    {
        campo: 'logDesactivacionFecha',
        encabezado: 'Estado',
        anchoFijo: 110,
        align: 'center' as const,
        alignEncabezado: 'center' as const,
        render: (valor: unknown) => (
            <Chip
                label={valor == null ? 'ACTIVO' : 'INACTIVO'}
                color={valor == null ? 'success' : 'default'}
                size="small"
                sx={{ fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.03em' }}
            />
        ),
        exportarValor: (valor: unknown) => valor == null ? 'ACTIVO' : 'INACTIVO',
    },
] satisfies {
    campo: keyof Pais;
    encabezado: string;
    render?: (valor: unknown, fila: unknown) => React.ReactNode;
    anchoFijo?: number;
    align?: 'left' | 'center' | 'right';
    alignEncabezado?: 'left' | 'center' | 'right';
}[];

export default function PaisList() {
    const { data: paises, isLoading, isError } = useGetPaisesQuery();
    const [createPais] = useCreatePaisMutation();
    const [updatePais] = useUpdatePaisMutation();
    const [deletePais] = useDeletePaisMutation();
    const confirmar = useConfirm();

    const [dialogoAbierto, setDialogoAbierto] = useState(false);
    const [paisSeleccionado, setPaisSeleccionado] = useState<Pais | null>(null);

    const cerrarDialogo = () => { setDialogoAbierto(false); };
    const handleCrear = () => { setPaisSeleccionado(null); setDialogoAbierto(true); };
    const handleEditar = (fila: Pais) => { setPaisSeleccionado(fila); setDialogoAbierto(true); };

    const handleEliminar = async (fila: Pais) => {
        const confirmado = await confirmar({
            header: 'Confirmar eliminación',
            message: `¿Deseas eliminar el país "${fila.paisNombre}"?`,
        });
        if (confirmado) await deletePais(fila.paisId);
    };

    const handleGuardar = async (data: PaisRequest, esEditar: boolean) => {
        if (esEditar) await updatePais(data);
        else await createPais(data);
        cerrarDialogo();
    };

    return (
        <Box sx={{ p: 2 }}>
            {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
            {isError && <Alert severity="error">No se pudieron cargar los países.</Alert>}
            {!isLoading && !isError && (
                <RioDataTable
                    titulo="Países"
                    mensajeVacio="No hay países registrados."
                    columnas={columnas}
                    datos={paises ?? []}
                    dataKey="paisId"
                    onEditar={handleEditar}
                    onEliminar={handleEliminar}
                    onCrear={handleCrear}
                    labelCrear="Nuevo País"
                    exportarNombreArchivo="Países"
                    renderExpansion={(fila) => <DepartamentosPanel pais={fila} />}
                    mostrarAuditoria
                />
            )}
            <Dialog
                open={dialogoAbierto}
                onClose={cerrarDialogo}
                maxWidth="xs"
                fullWidth
                TransitionProps={{ onExited: () => setPaisSeleccionado(null) }}
            >
                <PaisForm
                    key={paisSeleccionado?.paisId ?? 'nuevo'}
                    pais={paisSeleccionado}
                    onCancelar={cerrarDialogo}
                    onGuardar={handleGuardar}
                />
            </Dialog>
        </Box>
    );
}
