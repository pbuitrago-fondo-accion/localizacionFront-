import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
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
            <Dialog open={!!opciones} onClose={handleCancelar}>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>{opciones?.header}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HelpOutlineIcon color="action" />
                        <DialogContentText>{opciones?.message}</DialogContentText>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
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
