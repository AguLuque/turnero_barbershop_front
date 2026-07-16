// Traduce los mensajes de error tal cual los devuelve Supabase Auth (en ingles)
// a mensajes claros y accionables en español para el usuario final.
export function traducirErrorAuth(mensajeOriginal: string): string {
  const mensaje = mensajeOriginal.toLowerCase();

  if (mensaje.includes('invalid login credentials')) {
    return 'Email o contraseña incorrectos. Si todavía no tenés cuenta, registrate más abajo.';
  }

  if (mensaje.includes('email not confirmed')) {
    return 'Todavía no confirmaste tu email. Revisá tu casilla de correo y tocá el link de confirmación.';
  }

  if (mensaje.includes('user already registered') || mensaje.includes('already registered')) {
    return 'Ese email ya está registrado. Iniciá sesión en vez de crear una cuenta nueva.';
  }

  if (mensaje.includes('password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }

  if (mensaje.includes('unable to validate email address') || mensaje.includes('invalid email')) {
    return 'El email ingresado no es válido.';
  }

  if (mensaje.includes('email rate limit exceeded') || mensaje.includes('rate limit')) {
    return 'Hiciste demasiados intentos seguidos. Esperá unos minutos y volvé a intentar.';
  }

  if (mensaje.includes('failed to fetch') || mensaje.includes('network')) {
    return 'No pudimos conectarnos. Revisá tu conexión a internet e intentá de nuevo.';
  }

  // Si no reconocemos el error puntual, devolvemos el original para no ocultar informacion util.
  return mensajeOriginal;
}