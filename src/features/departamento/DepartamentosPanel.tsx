import { useState } from 'react';
import { Box, CircularProgress, Alert, Dialog } from '@mui/material';
import RioDataTable from '../../components/RioDataTable';
import { useConfirm } from '../../hooks/useConfirm';
import {
    useGetDepartamentosQuery,
    useCreateDepartamentoMutation,
    useUpdateDepartamentoMutation,
    useDeleteDepartamentoMutation,
} from './departamentoApi';
import type { Pais } from '../pais/types';
import type { Departamento, DepartamentoRequest } from './types';
import DepartamentoForm from './DepartamentoForm';
import MunicipiosPanel from '../municipio/MunicipiosPanel';

interface Props {
    pais: Pais;
}

const columnas: {
    campo: string;
    encabezado: string;
    anchoFijo?: number;
}[] = [
    { campo: 'departamentoCodigoDane', encabezado: 'Código DANE', anchoFijo: 150 },
    { campo: 'departamentoNombre', encabezado: 'Nombre' },
];

export default function DepartamentosPanel({ pais }: Props) {
    const { data: todos, isLoading, isError } = useGetDepartamentosQuery();
    const [createDepartamento] = useCreateDepartamentoMutation();
    const [updateDepartamento] = useUpdateDepartamentoMutation();
    const [deleteDepartamento] = useDeleteDepartamentoMutation();
    const confirmar = useConfirm();
    const [dialogoAbierto, setDialogoAbierto] = useState(false);
    const [editando, setEditando] = useState<Departamento | null>(null);

    const departamentos = todos?.filter((d) => Number(d['paisId']) === Number(pais.paisId)) ?? [];

    const handleEliminar = async (fila: Departamento) => {
        const confirmado = await confirmar({
            header: 'Confirmar eliminación',
            message: `¿Deseas eliminar el departamento "${fila.departamentoNombre}"?`,
        });
        if (confirmado) await deleteDepartamento(fila.departamentoId);
    };

    const handleGuardar = async (data: DepartamentoRequest, esEditar: boolean) => {
        const result = esEditar ? await updateDepartamento(data) : await createDepartamento(data);
        if ('error' in result) throw result.error;
        setDialogoAbierto(false);
    };

    const abrirCrear = () => { setEditando(null); setDialogoAbierto(true); };
    const abrirEditar = (fila: Departamento) => { setEditando(fila); setDialogoAbierto(true); };
    const cerrarDialogo = () => setDialogoAbierto(false);

    return (
        <Box>
            {isLoading && <CircularProgress size={24} />}
            {isError && <Alert severity="error">Error al cargar departamentos.</Alert>}
            {!isLoading && !isError && (
                <RioDataTable
                    titulo={`Departamentos de ${pais.paisNombre}`}
                    columnas={columnas}
                    datos={departamentos}
                    dataKey="departamentoId"
                    onEditar={abrirEditar}
                    onEliminar={handleEliminar}
                    onCrear={abrirCrear}
                    labelCrear="Nuevo Departamento"
                    mensajeVacio="No hay departamentos registrados."
                    renderExpansion={(fila) => <MunicipiosPanel departamento={fila} />}
                    mostrarAuditoria
                />
            )}
            <Dialog
                open={dialogoAbierto}
                onClose={cerrarDialogo}
                maxWidth="xs"
                fullWidth
                TransitionProps={{ onExited: () => setEditando(null) }}
            >
                <DepartamentoForm
                    key={`${pais.paisId}-${editando?.departamentoId ?? 'nuevo'}`}
                    departamento={editando}
                    paisFijo={pais.paisId}
                    onCancelar={cerrarDialogo}
                    onGuardar={handleGuardar}
                />
            </Dialog>
        </Box>
    );
}
