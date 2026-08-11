import { Card, CardContent, CardActions, Badge, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface RioMenuModuloProps {
    titulo: string;
    icono: ReactNode;
    ruta: string;
    pendientes?: number;
    visible?: boolean;
}

function RioMenuModulo({
    titulo,
    icono,
    ruta,
    pendientes = 0,
    visible = true,
}: RioMenuModuloProps) {
    const navigate = useNavigate();

    if (!visible) return null;

    return (
        <Card
            onClick={() => navigate(`/${ruta}`)}
            sx={{
                cursor: 'pointer',
                borderRadius: 4,
                transition: 'box-shadow 0.3s',
                '&:hover': { boxShadow: 6 },
            }}
        >
            <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', height: 128, pt: 3 }}>
                <Badge badgeContent={pendientes} color="error" invisible={pendientes === 0} sx={{ position: 'absolute', top: 8, right: 8 }} />
                <Box sx={{ fontSize: 75, color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icono}
                </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', mt: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {titulo}
                </Typography>
            </CardActions>
        </Card>
    );
}

export default RioMenuModulo;
