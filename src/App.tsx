import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import theme from './theme';
import RioEncabezado from './components/RioEncabezado';
import { RioDialogoConfirmacion } from './components/RioDialogoConfirmacion';
import LocalizacionView from './features/localizacion/LocalizacionView';
import Home from './pages/Home';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <RioDialogoConfirmacion>
                <BrowserRouter>
                    <RioEncabezado />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/localizacion" element={<LocalizacionView />} />
                    </Routes>
                </BrowserRouter>
            </RioDialogoConfirmacion>
        </ThemeProvider>
    );
}

export default App;
