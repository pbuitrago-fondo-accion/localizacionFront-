import { Box, Button } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

interface SubMenuItem {
    label: string;
    path: string;
}

interface Props {
    items: SubMenuItem[];
}

function RioSubMenuModulo({ items }: Props) {
    const { pathname } = useLocation();

    if (items.length === 0) return null;

    return (
        <Box
            sx={{
                bgcolor: '#065f46',
                mt: 0.5,
                px: 2,
                py: 0.75,
                display: 'flex',
                gap: 1,
            }}
        >
            {items.map((item) => {
                const activo = pathname === item.path;
                return (
                    <Button
                        key={item.path}
                        component={Link}
                        to={item.path}
                        size="small"
                        variant={activo ? 'contained' : 'text'}
                        sx={{
                            bgcolor: activo ? 'primary.main' : 'transparent',
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: activo ? 600 : 400,
                            borderRadius: 1,
                            px: 1.5,
                            py: 0.4,
                            minHeight: 0,
                            '&:hover': {
                                bgcolor: activo ? 'primary.dark' : 'rgba(255,255,255,0.1)',
                            },
                        }}
                    >
                        {item.label}
                    </Button>
                );
            })}
        </Box>
    );
}

export default RioSubMenuModulo;
