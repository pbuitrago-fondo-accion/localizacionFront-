export interface Municipio {
  [key: string]: unknown;
  municipioId: number;
  municipioCodigoDane: string;
  municipioNombre: string;
  departamentoId: number;
  logDesactivacionFecha: string | null;
  logCreacionUsuarioId: number;
  logCreacionFecha: string;
  logModificacionUsuarioId: number | null;
  logModificacionFecha: string | null;
}

export interface MunicipioRequest {
  municipioId: number;
  municipioCodigoDane: string;
  municipioNombre: string;
  departamentoId: number;
  logDesactivacionFecha: string | null;
  usuarioId: number;
}
