import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import theme from './theme';
import RioEncabezado from './components/RioEncabezado';
import RioSubMenuModulo from './components/RioSubMenuModulo';
import { RioDialogoConfirmacion } from './components/RioDialogoConfirmacion';
import LocalizacionView from './features/localizacion/LocalizacionView';
import Home from './pages/Home';

const subMenusPorRuta: Record<string, { label: string; path: string }[]> = {
    '/localizacion': [{ label: 'Localización', path: '/localizacion' }],
};

function AppLayout() {
    const { pathname } = useLocation();
    const itemsSubmenu = subMenusPorRuta[pathname] ?? [];

    return (
        <>
            <RioEncabezado />
            <RioSubMenuModulo items={itemsSubmenu} />
            <Box sx={{ mt: 4 }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/localizacion" element={<LocalizacionView />} />
                </Routes>
            </Box>
        </>
    );
}

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <RioDialogoConfirmacion>
                <BrowserRouter>
                    <AppLayout />
                </BrowserRouter>
            </RioDialogoConfirmacion>
        </ThemeProvider>
    );
}

export default App;
