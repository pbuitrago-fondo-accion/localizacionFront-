import { Box } from '@mui/material';
import RioMenuModulo from '../components/RioMenuModulo';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

function Home() {
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, p: 2 }}>
            <RioMenuModulo
                titulo="Localización"
                icono={<LocationOnOutlinedIcon fontSize="inherit" />}
                ruta="localizacion"
            />
        </Box>
    );
}

export default Home;
