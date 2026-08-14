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
import { useGetDepartamentosQuery } from '../departamento/departamentoApi';
import { useGetPaisesQuery } from '../pais/paisApi';
import type { Municipio, MunicipioRequest } from './types';
import MunicipioForm from './MunicipioForm';

export default function MunicipioList() {
    const { data: municipios, isLoading, isError } = useGetMunicipiosQuery();
    const { data: departamentos } = useGetDepartamentosQuery();
    const { data: paises } = useGetPaisesQuery();
    const [createMunicipio] = useCreateMunicipioMutation();
    const [updateMunicipio] = useUpdateMunicipioMutation();
    const [deleteMunicipio] = useDeleteMunicipioMutation();
    const confirmar = useConfirm();

    const [dialogoAbierto, setDialogoAbierto] = useState(false);
    const [municipioSeleccionado, setMunicipioSeleccionado] = useState<Municipio | null>(null);

    const cerrarDialogo = () => { setDialogoAbierto(false); };
    const handleCrear = () => { setMunicipioSeleccionado(null); setDialogoAbierto(true); };
    const handleEditar = (fila: Municipio) => { setMunicipioSeleccionado(fila); setDialogoAbierto(true); };

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
        cerrarDialogo();
    };

    const deptoNombre = (id: unknown) => departamentos?.find((d) => d.departamentoId === id)?.departamentoNombre ?? String(id ?? '—');
    const paisNombre = (id: unknown) => paises?.find((p) => p.paisId === id)?.paisNombre ?? String(id ?? '—');

    const columnas: { campo: keyof Municipio & string; encabezado: string; anchoFijo?: number; align?: 'left' | 'center' | 'right'; alignEncabezado?: 'left' | 'center' | 'right'; render?: (valor: unknown, fila: unknown) => React.ReactNode }[] = [
        { campo: 'municipioId', encabezado: 'ID', anchoFijo: 80, align: 'center', alignEncabezado: 'center' },
        { campo: 'municipioCodigo', encabezado: 'Código', anchoFijo: 120 },
        { campo: 'municipioNombre', encabezado: 'Nombre' },
        { campo: 'municipioDepartamentoId', encabezado: 'Departamento', anchoFijo: 180, render: (valor: unknown) => deptoNombre(valor), exportarValor: (valor: unknown) => deptoNombre(valor) },
        { campo: 'municipioPaisId', encabezado: 'País', anchoFijo: 140, render: (valor: unknown) => paisNombre(valor), exportarValor: (valor: unknown) => paisNombre(valor) },
    ];

    return (
        <Box sx={{ p: 2 }}>
            {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
            {isError && <Alert severity="error">No se pudieron cargar los municipios.</Alert>}
            {!isLoading && !isError && (
                <RioDataTable
                    titulo="Municipios"
                    mensajeVacio="No hay municipios registrados."
                    columnas={columnas}
                    datos={municipios ?? []}
                    dataKey="municipioId"
                    onEditar={handleEditar}
                    onEliminar={handleEliminar}
                    onCrear={handleCrear}
                    labelCrear="Crear Municipio"
                    exportarNombreArchivo="Municipios"
                />
            )}
            <Dialog
                open={dialogoAbierto}
                onClose={cerrarDialogo}
                maxWidth="sm"
                fullWidth
                TransitionProps={{ onExited: () => setMunicipioSeleccionado(null) }}
            >
                <MunicipioForm
                    key={municipioSeleccionado?.municipioId ?? 'nuevo'}
                    municipio={municipioSeleccionado}
                    onCancelar={cerrarDialogo}
                    onGuardar={handleGuardar}
                />
            </Dialog>
        </Box>
    );
}
