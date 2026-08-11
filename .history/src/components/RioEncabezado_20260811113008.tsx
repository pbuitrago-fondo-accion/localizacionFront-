import { AppBar, Toolbar, Typography, Box, Button, IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { Link } from 'react-router-dom';
import logo from '../assets/images/logo.png';

function RioEncabezado() {
    const usuario = 'pbuitrago'; // placeholder, luego vendrá del token decodificado

    const cerrarSesion = () => {
        console.log('cerrando sesión');
    };

    return (
        <AppBar position="static" sx={{ bgcolor: '#065f46' }}>
            <Toolbar sx={{ justifyContent: 'space-between', pb:  }}>
                <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'white' }}>
                    <Box component="img" src={logo} alt="RIO" sx={{ width: 30 }} />
                    <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                        RIO
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button startIcon={<PersonIcon />} sx={{ color: 'white', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
                        {usuario}
                    </Button>
                    <IconButton onClick={cerrarSesion} sx={{ color: 'white' }}>
                        <LogoutIcon />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default RioEncabezado;
