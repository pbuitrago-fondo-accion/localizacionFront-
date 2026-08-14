import { useState } from 'react';
import {
    DialogTitle, DialogContent, DialogActions,
    TextField, Button, IconButton, Box, Typography, Autocomplete,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { useGetPaisesQuery } from '../pais/paisApi';
import { useGetDepartamentosQuery } from '../departamento/departamentoApi';
import type { Municipio, MunicipioRequest } from './types';

interface MunicipioFormProps {
    municipio: Municipio | null;
    departamentoFijo?: { departamentoId: number; paisId: number };
    onCancelar: () => void;
    onGuardar: (data: MunicipioRequest, esEditar: boolean) => Promise<void>;
}

const EMPTY_FORM: MunicipioRequest = {
    municipioId: 0,
    municipioCodigoDane: '',
    municipioNombre: '',
    departamentoId: 0,
    logDesactivacionFecha: null,
    usuarioId: 3,
};

function mapToRequest(m: Municipio): MunicipioRequest {
    return {
        municipioId: m.municipioId,
        municipioCodigoDane: m.municipioCodigoDane,
        municipioNombre: m.municipioNombre,
        departamentoId: m.departamentoId,
        logDesactivacionFecha: m.logDesactivacionFecha,
        usuarioId: 3,
    };
}

type FieldErrors = Partial<Record<keyof MunicipioRequest, string>>;

export default function MunicipioForm({ municipio, departamentoFijo, onCancelar, onGuardar }: MunicipioFormProps) {
    const esEditar = !!municipio;
    const [form, setForm] = useState<MunicipioRequest>(
        municipio ? mapToRequest(municipio) : { ...EMPTY_FORM, departamentoId: departamentoFijo?.departamentoId ?? 0 }
    );
    const [errores, setErrores] = useState<FieldErrors>({});
    const [guardando, setGuardando] = useState(false);
    const [selectedPaisId, setSelectedPaisId] = useState<number>(departamentoFijo?.paisId ?? 0);

    const { data: paises } = useGetPaisesQuery();
    const { data: departamentos } = useGetDepartamentosQuery();

    const set = (field: keyof MunicipioRequest, value: string | number | null) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errores[field]) setErrores((prev) => ({ ...prev, [field]: undefined }));
    };

    const handlePaisChange = (paisId: number) => {
        setSelectedPaisId(paisId);
        set('departamentoId', 0);
    };

    const departamentosFiltrados = departamentos?.filter((d) => !selectedPaisId || Number(d['paisId']) === selectedPaisId) ?? [];
    const paisSeleccionado = paises?.find((p) => p.paisId === selectedPaisId) ?? null;
    const deptoSeleccionado = departamentos?.find((d) => d.departamentoId === form.departamentoId) ?? null;

    const validar = () => {
        const next: FieldErrors = {};
        if (!form.municipioCodigoDane.trim()) next.municipioCodigoDane = 'Obligatorio';
        if (!form.municipioNombre.trim()) next.municipioNombre = 'Obligatorio';
        if (!form.departamentoId) next.departamentoId = 'Obligatorio';
        setErrores(next);
        return Object.keys(next).length === 0;
    };

    const handleGuardar = async () => {
        if (!validar()) return;
        setGuardando(true);
        try { await onGuardar(form, esEditar); } finally { setGuardando(false); }
    };

    return (
        <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'success.main', color: 'white', py: 2, px: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {esEditar ? 'Editar Municipio' : 'Nuevo Municipio'}
                </Typography>
                <IconButton onClick={onCancelar} size="small" sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '50%' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 3 }}>
                    <TextField
                        label="Código DANE"
                        required
                        size="small"
                        fullWidth
                        placeholder="Ej: 05001"
                        value={form.municipioCodigoDane}
                        onChange={(e) => set('municipioCodigoDane', e.target.value)}
                        error={!!errores.municipioCodigoDane}
                        helperText={errores.municipioCodigoDane}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                        label="Nombre"
                        required
                        size="small"
                        fullWidth
                        placeholder="Nombre del municipio"
                        value={form.municipioNombre}
                        onChange={(e) => set('municipioNombre', e.target.value)}
                        error={!!errores.municipioNombre}
                        helperText={errores.municipioNombre}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    {!departamentoFijo && (
                        <>
                            <Autocomplete
                                options={paises ?? []}
                                getOptionLabel={(o) => o.paisNombre}
                                value={paisSeleccionado}
                                onChange={(_, val) => handlePaisChange(val?.paisId ?? 0)}
                                size="small"
                                renderInput={(params) => (
                                    <TextField {...params} label="País" slotProps={{ inputLabel: { shrink: true } }} />
                                )}
                                noOptionsText="Sin opciones"
                            />
                            <Autocomplete
                                options={departamentosFiltrados}
                                getOptionLabel={(o) => o.departamentoNombre}
                                value={deptoSeleccionado}
                                onChange={(_, val) => set('departamentoId', val?.departamentoId ?? 0)}
                                size="small"
                                disabled={!selectedPaisId}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Departamento"
                                        required
                                        error={!!errores.departamentoId}
                                        helperText={errores.departamentoId ?? (!selectedPaisId ? 'Seleccione primero un país' : '')}
                                        slotProps={{ inputLabel: { shrink: true } }}
                                    />
                                )}
                                noOptionsText="Sin opciones"
                            />
                        </>
                    )}
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
