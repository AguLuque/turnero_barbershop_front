// Arma un link de wa.me a partir de un telefono local argentino.
// Asume que telefono viene sin codigo de pais (ej: "3512345678").
export function armarLinkWhatsapp(telefono: string, mensaje?: string): string {
  const soloNumeros = telefono.replace(/\D/g, '');
  const numeroConCodigo = soloNumeros.startsWith('54') ? soloNumeros : `549${soloNumeros}`;
  const texto = mensaje ? `?text=${encodeURIComponent(mensaje)}` : '';
  return `https://wa.me/${numeroConCodigo}${texto}`;
}