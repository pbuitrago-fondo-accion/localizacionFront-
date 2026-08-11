import { useState } from 'react';
import { Box, CircularProgress, Alert, Dialog } from '@mui/material';
import RioDataTable from '../../components/RioDataTable';
import { useConfirm } from '../../hooks/useConfirm';
import {
    useGetMunicipiosQuery,
    useCreateMunicipioMutation,
    useUpdateMunicipioMutation,
    useDeleteMunicipioMutation,
} from './municipioApi';
import type { Departamento } from '../departamento/types';
import type { Municipio, MunicipioRequest } from './types';
import MunicipioForm from './MunicipioForm';

interface Props {
    departamento: Departamento;
}

const columnas: {
    campo: string;
    encabezado: string;
    anchoFijo?: number;
}[] = [
    { campo: 'municipioCodigoDane', encabezado: 'Código DANE', anchoFijo: 150 },
    { campo: 'municipioNombre', encabezado: 'Nombre' },
];

export default function MunicipiosPanel({ departamento }: Props) {
    const { data: todos, isLoading, isError } = useGetMunicipiosQuery();
    const [createMunicipio] = useCreateMunicipioMutation();
    const [updateMunicipio] = useUpdateMunicipioMutation();
    const [deleteMunicipio] = useDeleteMunicipioMutation();
    const confirmar = useConfirm();
    const [dialogoAbierto, setDialogoAbierto] = useState(false);
    const [editando, setEditando] = useState<Municipio | null>(null);

    const municipios = todos?.filter((m) => Number(m['departamentoId']) === Number(departamento.departamentoId)) ?? [];

    const handleEliminar = async (fila: Municipio) => {
        const confirmado = await confirmar({
            header: 'Confirmar eliminación',
            message: `¿Deseas eliminar el municipio "${fila.municipioNombre}"?`,
        });
        if (confirmado) await deleteMunicipio(fila.municipioId);
    };

    const handleGuardar = async (data: MunicipioRequest, esEditar: boolean) => {
        if (esEditar) await updateMunicipio(data);
        else await createMunicipio(data);
        setDialogoAbierto(false);
    };

    const abrirCrear = () => { setEditando(null); setDialogoAbierto(true); };
    const abrirEditar = (fila: Municipio) => { setEditando(fila); setDialogoAbierto(true); };
    const cerrarDialogo = () => setDialogoAbierto(false);

    return (
        <Box>
            {isLoading && <CircularProgress size={24} />}
            {isError && <Alert severity="error">Error al cargar municipios.</Alert>}
            {!isLoading && !isError && (
                <RioDataTable
                    titulo={`Municipios de ${departamento.departamentoNombre}`}
                    columnas={columnas}
                    datos={municipios}
                    dataKey="municipioId"
                    onEditar={abrirEditar}
                    onEliminar={handleEliminar}
                    onCrear={abrirCrear}
                    labelCrear="Nuevo Municipio"
                    mensajeVacio="No hay municipios registrados."
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
                <MunicipioForm
                    key={editando?.municipioId ?? 'nuevo'}
                    municipio={editando}
                    departamentoFijo={{ departamentoId: departamento.departamentoId, paisId: departamento.departamentoPaisId }}
                    onCancelar={cerrarDialogo}
                    onGuardar={handleGuardar}
                />
            </Dialog>
        </Box>
    );
}
