import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box, IconButton, Typography } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { ConfirmContext, type ConfirmOptions } from '../context/ConfirmContext';

export function RioDialogoConfirmacion({ children }: { children: ReactNode }) {
    const [opciones, setOpciones] = useState<ConfirmOptions | null>(null);
    const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

    const confirmar = useCallback((options: ConfirmOptions): Promise<boolean> => {
        setOpciones(options);
        return new Promise((resolve) => {
            setResolver(() => resolve);
        });
    }, []);

    const handleAceptar = () => {
        resolver?.(true);
        setOpciones(null);
    };

    const handleCancelar = () => {
        resolver?.(false);
        setOpciones(null);
    };

    const colorBoton = opciones?.severity === 'primary' ? 'primary' : (opciones?.severity ?? 'error');

    return (
        <ConfirmContext.Provider value={{ confirmar }}>
            {children}
            <Dialog open={!!opciones} onClose={handleCancelar} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'success.main', color: 'white', py: 2, px: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{opciones?.header}</Typography>
                    <IconButton onClick={handleCancelar} size="small" sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '50%' }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 1 }}>
                        <HelpOutlineIcon color="action" />
                        <DialogContentText>{opciones?.message}</DialogContentText>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button variant="contained" color={colorBoton as 'error' | 'primary' | 'success' | 'warning'} onClick={handleAceptar}>
                        {opciones?.acceptLabel ?? 'Sí, eliminar'}
                    </Button>
                    <Button variant="outlined" color="inherit" onClick={handleCancelar}>
                        {opciones?.rejectLabel ?? 'Cancelar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </ConfirmContext.Provider>
    );
}
