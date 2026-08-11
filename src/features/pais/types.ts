export interface Pais {
  [key: string]: unknown;
  paisId: number;
  paisCodigoIso: string;
  paisNombre: string;
  logDesactivacionFecha: string | null;
  logCreacionUsuarioId: number;
  logCreacionFecha: string;
  logModificacionUsuarioId: number | null;
  logModificacionFecha: string | null;
}

export interface PaisRequest {
  paisId: number;
  paisCodigoIso: string;
  paisNombre: string;
  logDesactivacionFecha: string | null;
  usuarioId: number;
}
