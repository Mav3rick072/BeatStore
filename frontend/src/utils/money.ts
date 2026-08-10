export function formatCentsToMXN(cents: number): string {
  return (cents / 100).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });
}

export function pesosToCents(pesos: number): number {
  return Math.round(pesos * 100);
}
