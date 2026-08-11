import { Box, Typography, Chip } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import EventNoteIcon from "@mui/icons-material/EventNote";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import BlockIcon from "@mui/icons-material/Block";

interface AuditoriaData {
  logCreacionUsuarioId?: number | null;
  logCreacionFecha?: string | null;
  logModificacionUsuarioId?: number | null;
  logModificacionFecha?: string | null;
  logDesactivacionFecha?: string | null;
}

interface RioRegistroAuditoriaProps {
  datos: AuditoriaData;
}

function formatFecha(fecha: string | null | undefined): string {
  if (!fecha) return "—";
  const d = new Date(fecha);
  return d.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Campo({ icono, label, valor }: { icono: React.ReactNode; label: string; valor: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 200 }}>
      <Box sx={{ color: "text.secondary", display: "flex" }}>{icono}</Box>
      <Box>
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {valor}
        </Typography>
      </Box>
    </Box>
  );
}

function RioRegistroAuditoria({ datos }: RioRegistroAuditoriaProps) {
  const activo = datos.logDesactivacionFecha == null;

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 3,
        px: 1,
        py: 0.5,
        alignItems: "center",
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.05em", mr: 1 }}>
        Auditoría
      </Typography>

      <Campo
        icono={<PersonOutlineIcon fontSize="small" />}
        label="Creado por"
        valor={datos.logCreacionUsuarioId != null ? `Usuario #${datos.logCreacionUsuarioId}` : "—"}
      />
      <Campo
        icono={<EventNoteIcon fontSize="small" />}
        label="Fecha creación"
        valor={formatFecha(datos.logCreacionFecha)}
      />
      <Campo
        icono={<PersonOutlineIcon fontSize="small" />}
        label="Modificado por"
        valor={datos.logModificacionUsuarioId != null ? `Usuario #${datos.logModificacionUsuarioId}` : "—"}
      />
      <Campo
        icono={<EditCalendarIcon fontSize="small" />}
        label="Fecha modificación"
        valor={formatFecha(datos.logModificacionFecha)}
      />
      <Campo
        icono={<BlockIcon fontSize="small" />}
        label="Estado"
        valor={
          activo ? (
            <Chip label="ACTIVO" color="success" size="small" sx={{ fontWeight: 700, fontSize: "0.7rem" }} />
          ) : (
            <Box>
              <Chip label="INACTIVO" color="default" size="small" sx={{ fontWeight: 700, fontSize: "0.7rem", mr: 0.5 }} />
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {formatFecha(datos.logDesactivacionFecha)}
              </Typography>
            </Box>
          )
        }
      />
    </Box>
  );
}

export default RioRegistroAuditoria;
