export function extractErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  const err = error as { response?: { data?: { message?: string | string[] } } };
  const message = err?.response?.data?.message;
  if (Array.isArray(message)) return message.join(', ');
  if (typeof message === 'string') return message;
  return fallback;
}
