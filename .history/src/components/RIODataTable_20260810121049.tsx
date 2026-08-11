import { useState, useMemo, useRef, useCallback, useEffect, Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  TablePagination,
  Collapse,
  LinearProgress,
  Popover,
  Checkbox,
  FormControlLabel,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import InboxIcon from "@mui/icons-material/Inbox";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import type { ReactNode } from "react";
import * as XLSX from "xlsx";

interface Columna<T> {
  campo: keyof T & string;
  encabezado: string;
  render?: (valor: T[keyof T], fila: T) => ReactNode;
  exportarValor?: (valor: T[keyof T], fila: T) => string | number;
  visiblePorDefecto?: boolean;
  grupo?: string;
  anchoFijo?: number;
  anchoPorDefecto?: number;
  align?: "left" | "center" | "right";
  alignEncabezado?: "left" | "center" | "right";
}

interface RioDataTableProps<T> {
  columnas: Columna<T>[];
  datos: T[];
  titulo?: string;
  loading?: boolean;
  onEditar?: (fila: T) => void;
  onEliminar?: (fila: T) => void;
  onExportar?: () => void;
  exportarNombreArchivo?: string;
  onCrear?: () => void;
  labelCrear?: string;
  tituloExtra?: ReactNode;
  headerActions?: ReactNode;
  dataKey?: keyof T & string;
  renderExpansion?: (fila: T) => ReactNode;
  mensajeVacio?: string;
  mostrarAuditoria?: boolean;
}

function formatFecha(valor: unknown): string {
  if (!valor) return "—";
  const d = new Date(valor as string);
  return d.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function RioDataTable<T extends Record<string, unknown>>({
  columnas,
  datos,
  titulo,
  loading = false,
  onEditar,
  onEliminar,
  onExportar,
  exportarNombreArchivo,
  onCrear,
  labelCrear = "Crear",
  tituloExtra,
  headerActions,
  dataKey,
  renderExpansion,
  mensajeVacio,
  mostrarAuditoria = false,
}: RioDataTableProps<T>) {
  const columnasConAuditoria = useMemo<Columna<T>[]>(() => {
    if (!mostrarAuditoria) return columnas;
    const auditCol: Columna<T> = {
      campo: "logCreacionFecha" as keyof T & string,
      encabezado: "Auditoría",
      anchoPorDefecto: 220,
      render: (_, fila) => {
        const f = fila as Record<string, unknown>;
        const nombreCreacion =
          (f["logCreacionUsuarioNombre"] as string | undefined) ??
          (f["logCreacionUsuarioId"] != null ? `Usuario #${f["logCreacionUsuarioId"]}` : "—");
        const nombreModificacion =
          (f["logModificacionUsuarioNombre"] as string | undefined) ??
          (f["logModificacionUsuarioId"] != null ? `Usuario #${f["logModificacionUsuarioId"]}` : null);
        const fechaModificacion = f["logModificacionFecha"] as string | null;
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <PersonOutlineIcon sx={{ fontSize: 14, color: "success.main", flexShrink: 0 }} />
              <Typography variant="caption" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {nombreCreacion} {formatFecha(f["logCreacionFecha"] as string | null)}
              </Typography>
            </Box>
            {fechaModificacion != null && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <EditCalendarIcon sx={{ fontSize: 14, color: "success.main", flexShrink: 0 }} />
                <Typography variant="caption" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {nombreModificacion} {formatFecha(fechaModificacion)}
                </Typography>
              </Box>
            )}
          </Box>
        );
      },
      exportarValor: (_, fila) => {
        const f = fila as Record<string, unknown>;
        const nombreCreacion =
          (f["logCreacionUsuarioNombre"] as string | undefined) ??
          (f["logCreacionUsuarioId"] != null ? `Usuario #${f["logCreacionUsuarioId"]}` : "—");
        const nombreModificacion =
          (f["logModificacionUsuarioNombre"] as string | undefined) ??
          (f["logModificacionUsuarioId"] != null ? `Usuario #${f["logModificacionUsuarioId"]}` : "—");
        return `Creado: ${nombreCreacion} ${formatFecha(f["logCreacionFecha"] as string | null)} | Modificado: ${nombreModificacion} ${formatFecha(f["logModificacionFecha"] as string | null)}`;
      },
    };
    return [...columnas, auditCol];
  }, [columnas, mostrarAuditoria]);

  const mostrarAcciones = onEditar || onEliminar || onCrear;
  const mostrarExpansion = !!renderExpansion && !!dataKey;

  const [busquedaGlobal, setBusquedaGlobal] = useState("");
  const [filtrosColumna, setFiltrosColumna] = useState<Record<string, string>>({});
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(15);
  const [filasExpandidas, setFilasExpandidas] = useState<Set<unknown>>(new Set());

  const [anchorColumnas, setAnchorColumnas] = useState<HTMLElement | null>(null);
  const [columnasSeleccionadas, setColumnasSeleccionadas] = useState<Set<string>>(
    () => new Set(columnasConAuditoria.filter((col) => col.visiblePorDefecto !== false).map((col) => col.campo)),
  );

  const todosLosCampos = useMemo(() => columnasConAuditoria.map((col) => col.campo), [columnasConAuditoria]);

  const todoSeleccionado =
    todosLosCampos.length > 0 && todosLosCampos.every((campo) => columnasSeleccionadas.has(campo));

  const toggleColumna = (campo: string) => {
    setColumnasSeleccionadas((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(campo)) nuevo.delete(campo);
      else nuevo.add(campo);
      return nuevo;
    });
  };

  const toggleTodasLasColumnas = () => {
    setColumnasSeleccionadas(todoSeleccionado ? new Set() : new Set(todosLosCampos));
  };

  const gruposParaSelector = useMemo(() => {
    const sinGrupo = columnasConAuditoria.filter((col) => !col.grupo);
    const nombresDeGrupo = [...new Set(columnasConAuditoria.filter((col) => col.grupo).map((col) => col.grupo!))];
    const grupos = nombresDeGrupo.map((nombre) => ({
      label: nombre,
      items: columnasConAuditoria.filter((col) => col.grupo === nombre),
    }));
    return { sinGrupo, grupos };
  }, [columnasConAuditoria]);

  const columnasVisibles = useMemo(
    () => columnasConAuditoria.filter((col) => columnasSeleccionadas.has(col.campo)),
    [columnasConAuditoria, columnasSeleccionadas],
  );

  const [anchos, setAnchos] = useState<Record<string, number>>({});
  const [modoManual, setModoManual] = useState(false);
  const headerRefs = useRef<Record<string, HTMLTableCellElement | null>>({});

  const scrollRef = useRef<HTMLDivElement>(null);
  const [anchoDisponible, setAnchoDisponible] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setAnchoDisponible(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleFiltroColumna = (campo: string, valor: string) => {
    setFiltrosColumna((prev) => ({ ...prev, [campo]: valor }));
    setPagina(0);
  };

  const toggleExpansion = (clave: unknown) => {
    setFilasExpandidas((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(clave)) nuevo.delete(clave);
      else nuevo.add(clave);
      return nuevo;
    });
  };

  const handleResizeStart = useCallback(
    (campo: string) => (e: React.MouseEvent) => {
      let base = anchos;
      if (!modoManual) {
        const congelados: Record<string, number> = {};
        columnasVisibles.forEach((col) => {
          const el = headerRefs.current[col.campo];
          congelados[col.campo] = el ? el.getBoundingClientRect().width : (col.anchoFijo ?? col.anchoPorDefecto ?? 150);
        });
        setAnchos(congelados);
        setModoManual(true);
        base = congelados;
      }
      const anchoInicial = base[campo] ?? 150;
      const inicioX = e.clientX;
      const handleMouseMove = (moveEvent: MouseEvent) => {
        const diferencia = moveEvent.clientX - inicioX;
        const nuevoAncho = Math.max(60, anchoInicial + diferencia);
        setAnchos((prev) => ({ ...prev, [campo]: nuevoAncho }));
      };
      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [modoManual, anchos, columnasVisibles],
  );

  const datosFiltrados = useMemo(() => {
    let resultado = datos;
    if (busquedaGlobal) {
      const termino = busquedaGlobal.toLowerCase();
      resultado = resultado.filter((fila) =>
        columnasVisibles.some((col) => String(fila[col.campo] ?? "").toLowerCase().includes(termino)),
      );
    }
    resultado = resultado.filter((fila) =>
      Object.entries(filtrosColumna).every(([campo, valor]) => {
        if (!valor) return true;
        return String(fila[campo as keyof T] ?? "").toLowerCase().includes(valor.toLowerCase());
      }),
    );
    return resultado;
  }, [datos, columnasVisibles, busquedaGlobal, filtrosColumna]);

  const datosPaginados = useMemo(() => {
    const inicio = pagina * filasPorPagina;
    return datosFiltrados.slice(inicio, inicio + filasPorPagina);
  }, [datosFiltrados, pagina, filasPorPagina]);

  const totalColumnas = columnasVisibles.length + (mostrarAcciones ? 1 : 0) + (mostrarExpansion ? 1 : 0);
  const sinResultados = !loading && datosFiltrados.length === 0;

  const anchoColumna = (col: Columna<T>): number | undefined => {
    if (modoManual) return anchos[col.campo] ?? col.anchoFijo ?? col.anchoPorDefecto ?? 150;
    return col.anchoFijo ?? col.anchoPorDefecto;
  };

  const anchoAcciones = useMemo(() => {
    if (!mostrarAcciones) return 170;
    if (!modoManual) return 170;
    const anchoExpansionCol = mostrarExpansion ? 36 : 0;
    const sumaColumnasVisibles = columnasVisibles.reduce((acc, col) => {
      const ancho = anchos[col.campo] ?? col.anchoFijo ?? col.anchoPorDefecto ?? 150;
      return acc + ancho;
    }, 0);
    const bordesExtra = columnasVisibles.length + (mostrarExpansion ? 1 : 0) + 1;
    const disponible = anchoDisponible - anchoExpansionCol - sumaColumnasVisibles - bordesExtra;
    return Math.max(170, disponible);
  }, [mostrarAcciones, modoManual, mostrarExpansion, columnasVisibles, anchoDisponible, anchos]);

  const exportarExcelInterno = useCallback(() => {
    const encabezados = columnasVisibles.map((col) => col.encabezado);
    const filas = datosFiltrados.map((fila) =>
      columnasVisibles.map((col) => {
        const valor = fila[col.campo];
        if (col.exportarValor) return col.exportarValor(valor as T[keyof T], fila);
        if (valor == null) return "";
        return valor as string | number;
      }),
    );
    const ws = XLSX.utils.aoa_to_sheet([encabezados, ...filas]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Datos");
    XLSX.writeFile(wb, `${exportarNombreArchivo ?? titulo ?? "exportar"}.xlsx`);
  }, [columnasVisibles, datosFiltrados, exportarNombreArchivo, titulo]);

  return (
    <TableContainer component={Paper} sx={{ border: "1px solid", borderColor: "divider" }}>
      <Box sx={{ height: 4 }}>{loading && <LinearProgress />}</Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 1.5, py: 1, flexWrap: "wrap", gap: 0.75 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {titulo && <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>{titulo}</Typography>}
          {tituloExtra}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          {headerActions}
          <Button size="small" variant="outlined" startIcon={<ViewColumnIcon />} onClick={(e) => setAnchorColumnas(e.currentTarget)}>
            Columnas
          </Button>
          <Popover
            open={!!anchorColumnas}
            anchorEl={anchorColumnas}
            onClose={() => setAnchorColumnas(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, p: 2, minWidth: 260, maxHeight: 400, overflowY: "auto" }}>
              <FormControlLabel
                control={<Checkbox checked={todoSeleccionado} onChange={toggleTodasLasColumnas} />}
                label={<Typography sx={{ fontWeight: "bold" }}>Seleccionar todo</Typography>}
              />
              <Divider />
              {gruposParaSelector.sinGrupo.map((col) => (
                <FormControlLabel
                  key={col.campo}
                  control={<Checkbox checked={columnasSeleccionadas.has(col.campo)} onChange={() => toggleColumna(col.campo)} />}
                  label={col.encabezado}
                />
              ))}
              {gruposParaSelector.grupos.map((grupo) => (
                <Box key={grupo.label} sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary", mt: 0.5 }}>
                    {grupo.label}
                  </Typography>
                  {grupo.items.map((col) => (
                    <FormControlLabel
                      key={col.campo}
                      sx={{ pl: 1 }}
                      control={<Checkbox checked={columnasSeleccionadas.has(col.campo)} onChange={() => toggleColumna(col.campo)} />}
                      label={col.encabezado}
                    />
                  ))}
                </Box>
              ))}
            </Box>
          </Popover>
          {(onExportar || exportarNombreArchivo) && (
            <Button size="small" variant="outlined" startIcon={<FileDownloadIcon />} onClick={onExportar ?? exportarExcelInterno} disabled={loading || datosFiltrados.length === 0}>
              Exportar Excel
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ px: 1.5, pb: 1, borderBottom: "1px solid", borderColor: "divider" }}>
        <TextField
          fullWidth size="small" placeholder="Buscar en todos los campos..."
          value={busquedaGlobal}
          onChange={(e) => { setBusquedaGlobal(e.target.value); setPagina(0); }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>, style: { fontSize: "0.8rem" } } }}
        />
      </Box>

      <Box ref={scrollRef} sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ tableLayout: "fixed", width: modoManual ? "max-content" : "100%", minWidth: modoManual ? undefined : "100%", "& .MuiTableCell-root": { boxShadow: "inset -1px 0 0 0 var(--mui-palette-divider, rgba(224,224,224,1))", fontSize: "0.8rem" } }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              {mostrarExpansion && <TableCell sx={{ width: 36 }} />}
              {columnasVisibles.map((col) => (
                <TableCell
                  key={col.campo}
                  align={col.alignEncabezado ?? "left"}
                  ref={(el: HTMLTableCellElement | null) => { headerRefs.current[col.campo] = el; }}
                  sx={{ fontWeight: "bold", position: "relative", width: anchoColumna(col), overflow: "hidden" }}
                >
                  <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", pr: col.anchoFijo ? 0 : 1 }}>
                    {col.encabezado}
                  </Box>
                  <Box onMouseDown={handleResizeStart(col.campo)} sx={{ position: "absolute", right: 0, top: 0, height: "100%", width: "6px", cursor: "col-resize", "&:hover": { bgcolor: "primary.main" } }} />
                </TableCell>
              ))}
              {mostrarAcciones && <TableCell align="center" sx={{ fontWeight: "bold", width: anchoAcciones }}>Acciones</TableCell>}
            </TableRow>
            <TableRow>
              {mostrarExpansion && <TableCell sx={{ py: 0.5 }} />}
              {columnasVisibles.map((col) => (
                <TableCell key={col.campo} sx={{ py: 0.5 }}>
                  <TextField fullWidth size="small" placeholder={col.encabezado} value={filtrosColumna[col.campo] ?? ""} onChange={(e) => handleFiltroColumna(col.campo, e.target.value)}
                    slotProps={{ input: { style: { fontSize: "0.75rem", height: 28 } } }} />
                </TableCell>
              ))}
              {mostrarAcciones && (
                <TableCell align="center" sx={{ width: anchoAcciones, py: 0.5 }}>
                  {onCrear && (
                    <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={onCrear} sx={{ whiteSpace: "nowrap", fontSize: "0.75rem" }}>
                      {labelCrear}
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {sinResultados && (
              <TableRow>
                <TableCell colSpan={totalColumnas} sx={{ border: 0 }}>
                  <Box sx={{ textAlign: "center", py: 5 }}>
                    <InboxIcon sx={{ fontSize: 48, color: "grey.300" }} />
                    <Typography sx={{ mt: 1, color: "grey.500", fontSize: "1.1rem" }}>
                      {mensajeVacio ?? (titulo ? `No se encontraron ${titulo}.` : "No se encontraron registros.")}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
            {datosPaginados.map((fila, index) => {
              const clave = dataKey ? fila[dataKey] : index;
              const expandida = filasExpandidas.has(clave);
              return (
                <Fragment key={String(clave)}>
                  <TableRow hover>
                    {mostrarExpansion && (
                      <TableCell sx={{ width: 36, px: 0.5 }}>
                        <IconButton size="small" onClick={() => toggleExpansion(clave)}>
                          {expandida ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                        </IconButton>
                      </TableCell>
                    )}
                    {columnasVisibles.map((col) => (
                      <TableCell key={col.campo} align={col.align} sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {col.render ? col.render(fila[col.campo], fila) : String(fila[col.campo] ?? "")}
                      </TableCell>
                    ))}
                    {mostrarAcciones && (
                      <TableCell align="center" sx={{ width: anchoAcciones }}>
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                          {onEditar && (
                            <IconButton size="small" onClick={() => onEditar(fila)} sx={{ bgcolor: "success.main", color: "white", "&:hover": { bgcolor: "success.dark" } }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                          {onEliminar && (
                            <IconButton size="small" onClick={() => onEliminar(fila)} sx={{ bgcolor: "error.main", color: "white", "&:hover": { bgcolor: "error.dark" } }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                  {mostrarExpansion && (
                    <TableRow>
                      <TableCell colSpan={totalColumnas} sx={{ p: 0, borderBottom: expandida ? undefined : 0 }}>
                        <Collapse in={expandida} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 1.5, bgcolor: "grey.50" }}>{renderExpansion!(fila)}</Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </Box>

      <TablePagination
        component="div"
        count={datosFiltrados.length}
        page={pagina}
        onPageChange={(_, nuevaPagina) => setPagina(nuevaPagina)}
        rowsPerPage={filasPorPagina}
        onRowsPerPageChange={(e) => { setFilasPorPagina(parseInt(e.target.value, 10)); setPagina(0); }}
        rowsPerPageOptions={[10, 15, 25, 50]}
        labelRowsPerPage="Filas por página"
      />
    </TableContainer>
  );
}

export default RioDataTable;
