import { useState } from 'react';
import {
    DialogTitle, DialogContent, DialogActions,
    TextField, Button, IconButton, Box, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import type { Pais, PaisRequest } from './types';

interface PaisFormProps {
    pais: Pais | null;
    onCancelar: () => void;
    onGuardar: (data: PaisRequest, esEditar: boolean) => Promise<void>;
}

const EMPTY: PaisRequest = { paisId: 0, paisCodigoIso: '', paisNombre: '', logDesactivacionFecha: null, usuarioId: 3 };

function mapToRequest(p: Pais): PaisRequest {
    return { paisId: p.paisId, paisCodigoIso: p.paisCodigoIso, paisNombre: p.paisNombre, logDesactivacionFecha: p.logDesactivacionFecha, usuarioId: 3 };
}

export default function PaisForm({ pais, onCancelar, onGuardar }: PaisFormProps) {
    const esEditar = !!pais;
    const [form, setForm] = useState<PaisRequest>(pais ? mapToRequest(pais) : EMPTY);
    const [errores, setErrores] = useState<Partial<Record<keyof PaisRequest, string>>>({});
    const [guardando, setGuardando] = useState(false);

    const set = (field: keyof PaisRequest, value: string | number | null) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errores[field]) setErrores((prev) => ({ ...prev, [field]: undefined }));
    };

    const validar = () => {
        const next: Partial<Record<keyof PaisRequest, string>> = {};
        if (!form.paisCodigoIso.trim()) next.paisCodigoIso = 'Obligatorio';
        if (!form.paisNombre.trim()) next.paisNombre = 'Obligatorio';
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
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {esEditar ? 'Editar País' : 'Nuevo País'}
                </Typography>
                <IconButton onClick={onCancelar} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '50%' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <TextField
                        label="Código ISO"
                        size="small"
                        fullWidth
                        placeholder="Ej: CO"
                        value={form.paisCodigoIso}
                        onChange={(e) => set('paisCodigoIso', e.target.value)}
                        error={!!errores.paisCodigoIso}
                        helperText={errores.paisCodigoIso}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="Nombre"
                        required
                        size="small"
                        fullWidth
                        placeholder="Nombre del país"
                        value={form.paisNombre}
                        onChange={(e) => set('paisNombre', e.target.value)}
                        error={!!errores.paisNombre}
                        helperText={errores.paisNombre}
                        InputLabelProps={{ shrink: true }}
                    />
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
