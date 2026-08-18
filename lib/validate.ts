export function vInt(v: unknown, min: number, max: number, nombre: string): number {
  if (typeof v !== 'number' || !Number.isInteger(v) || v < min || v > max) {
    throw new Error(`${nombre} debe ser un número entero entre ${min} y ${max}.`);
  }
  return v;
}

export function vNumeroPositivo(v: unknown, nombre: string): number {
  if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0) {
    throw new Error(`${nombre} debe ser un número mayor que 0.`);
  }
  return v;
}

export function vEnum(v: unknown, valores: readonly string[], nombre: string): string {
  if (typeof v !== 'string' || !valores.includes(v)) {
    throw new Error(`${nombre} debe ser uno de: ${valores.join(', ')}.`);
  }
  return v;
}

export function vTextoNoVacio(v: unknown, nombre: string): string {
  if (typeof v !== 'string' || v.trim() === '') {
    throw new Error(`${nombre} no puede estar vacío.`);
  }
  return v;
}