export interface Departamento {
  [key: string]: unknown;
  departamentoId: number;
  departamentoCodigoDane: string;
  departamentoNombre: string;
  paisId: number;
  logDesactivacionFecha: string | null;
  logCreacionUsuarioId: number;
  logCreacionFecha: string;
  logModificacionUsuarioId: number | null;
  logModificacionFecha: string | null;
}

export interface DepartamentoRequest {
  departamentoId: number;
  departamentoCodigoDane: string;
  departamentoNombre: string;
  paisId: number;
  logDesactivacionFecha: string | null;
  usuarioId: number;
}
