export type Objetivo = 'hipertrofia' | 'potencia' | 'ambos';
export interface LogRow { id?: string; id_ejercicio: string; fecha: string; peso_levantado: number; reps_logradas: number }