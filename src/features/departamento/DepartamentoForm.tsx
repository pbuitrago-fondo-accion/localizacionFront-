import { useState } from 'react';
import {
    DialogTitle, DialogContent, DialogActions,
    TextField, Button, IconButton, Box, Typography, Autocomplete, Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { useGetPaisesQuery } from '../pais/paisApi';
import type { Departamento, DepartamentoRequest } from './types';

interface DepartamentoFormProps {
    departamento: Departamento | null;
    paisFijo?: number;
    onCancelar: () => void;
    onGuardar: (data: DepartamentoRequest, esEditar: boolean) => Promise<void>;
}

const EMPTY: DepartamentoRequest = { departamentoId: 0, departamentoCodigoDane: '', departamentoNombre: '', paisId: 0, logDesactivacionFecha: null, usuarioId: 3 };

function mapToRequest(d: Departamento): DepartamentoRequest {
    return { departamentoId: d.departamentoId, departamentoCodigoDane: d.departamentoCodigoDane, departamentoNombre: d.departamentoNombre, paisId: d.paisId, logDesactivacionFecha: d.logDesactivacionFecha, usuarioId: 3 };
}

export default function DepartamentoForm({ departamento, paisFijo, onCancelar, onGuardar }: DepartamentoFormProps) {
    const esEditar = !!departamento;
    const [form, setForm] = useState<DepartamentoRequest>(
        departamento ? mapToRequest(departamento) : { ...EMPTY, paisId: paisFijo ?? 0 }
    );
    const [errores, setErrores] = useState<Partial<Record<keyof DepartamentoRequest, string>>>({});
    const [guardando, setGuardando] = useState(false);
    const [errorServidor, setErrorServidor] = useState<string | null>(null);
    const { data: paises } = useGetPaisesQuery();

    const set = (field: keyof DepartamentoRequest, value: string | number | null) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errores[field]) setErrores((prev) => ({ ...prev, [field]: undefined }));
    };

    const validar = () => {
        const next: Partial<Record<keyof DepartamentoRequest, string>> = {};
        const codigo = form.departamentoCodigoDane.trim();
        if (!codigo) next.departamentoCodigoDane = 'Obligatorio';
        else if (codigo.length !== 2) next.departamentoCodigoDane = 'Debe tener exactamente 2 caracteres';
        if (!form.departamentoNombre.trim()) next.departamentoNombre = 'Obligatorio';
        if (!form.paisId) next.paisId = 'Obligatorio';
        setErrores(next);
        return Object.keys(next).length === 0;
    };

    const handleGuardar = async () => {
        if (!validar()) return;
        setGuardando(true);
        setErrorServidor(null);
        try {
            await onGuardar(form, esEditar);
        } catch (err) {
            const e = err as { status?: number; data?: unknown };
            const data = e?.data;
            const serverMsg =
                typeof data === 'string' ? data
                : typeof data === 'object' && data !== null
                    ? (String((data as Record<string, unknown>)['message'] ?? (data as Record<string, unknown>)['title'] ?? JSON.stringify(data)))
                    : null;
            if (e?.status === 409) {
                setErrorServidor('Ya existe un departamento con ese código DANE o ese nombre en este país.');
            } else {
                setErrorServidor(serverMsg ?? 'Error al guardar. Intente de nuevo.');
            }
        } finally {
            setGuardando(false);
        }
    };

    const paisSeleccionado = paises?.find((p) => p.paisId === form.paisId) ?? null;

    return (
        <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {esEditar ? 'Editar Departamento' : 'Nuevo Departamento'}
                </Typography>
                <IconButton onClick={onCancelar} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '50%' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <TextField
                        label="Código DANE"
                        required
                        size="small"
                        fullWidth
                        placeholder="Ej: 05"
                        value={form.departamentoCodigoDane}
                        onChange={(e) => set('departamentoCodigoDane', e.target.value)}
                        error={!!errores.departamentoCodigoDane}
                        helperText={errores.departamentoCodigoDane}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="Nombre"
                        required
                        size="small"
                        fullWidth
                        placeholder="Nombre del departamento"
                        value={form.departamentoNombre}
                        onChange={(e) => set('departamentoNombre', e.target.value)}
                        error={!!errores.departamentoNombre}
                        helperText={errores.departamentoNombre}
                        InputLabelProps={{ shrink: true }}
                    />
                    {!paisFijo && (
                        <Autocomplete
                            options={paises ?? []}
                            getOptionLabel={(o) => o.paisNombre}
                            value={paisSeleccionado}
                            onChange={(_, val) => set('paisId', val?.paisId ?? 0)}
                            size="small"
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="País"
                                    required
                                    error={!!errores.paisId}
                                    helperText={errores.paisId}
                                    InputLabelProps={{ shrink: true }}
                                />
                            )}
                            noOptionsText="Sin opciones"
                        />
                    )}
                    {errorServidor && <Alert severity="error">{errorServidor}</Alert>}
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleGuardar} disabled={guardando}>
                    {guardando ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button variant="outlined" color="inherit" onClick={onCancelar} disabled={guardando}>
                    Cancelar
                </Button>
            </DialogActions>
        </>
    );
}
