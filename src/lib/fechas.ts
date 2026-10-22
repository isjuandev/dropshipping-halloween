import { tiendaConfig } from '../config/tienda';

/**
 * Obtiene la fecha actual formateada en zona horaria America/Bogota
 */
export function getBogotaNow(): Date {
  const now = new Date();
  const bogotaStr = now.toLocaleString('en-US', { timeZone: 'America/Bogota' });
  return new Date(bogotaStr);
}

/**
 * Verifica si una fecha cae en domingo
 */
export function esDomingo(date: Date): boolean {
  return date.getDay() === 0;
}

/**
 * Verifica si una fecha está en la lista de festivos de Colombia
 */
export function esFestivo(date: Date, festivos = tiendaConfig.festivos): boolean {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;
  return festivos.includes(dateStr);
}

/**
 * Verifica si es día hábil (lunes a sábado, sin domingos ni festivos)
 */
export function esDiaHabil(date: Date, festivos = tiendaConfig.festivos): boolean {
  if (esDomingo(date)) return false;
  if (esFestivo(date, festivos)) return false;
  return true;
}

/**
 * Calcula la fecha estimada de entrega sumando días hábiles
 * Si la hora actual en Bogotá es después de las 14:00 (2 PM), el despacho cuenta a partir de mañana.
 */
export function calcularFechaEntrega(diasEnvio: number, fechaBase?: Date): {
  fechaEntrega: Date;
  diasHabilesReales: number;
  esATiempo: boolean;
  esEntregaJusta: boolean;
  estado: 'a-tiempo' | 'justa' | 'tarde';
} {
  const base = fechaBase ? new Date(fechaBase) : getBogotaNow();
  
  // Si pasa de las 2:00 PM, cuenta desde el día siguiente hábil
  const hora = base.getHours();
  let cursor = new Date(base);
  if (hora >= 14) {
    cursor.setDate(cursor.getDate() + 1);
  }

  let diasContados = 0;
  while (diasContados < diasEnvio) {
    // Si cursor es hábil, lo contamos
    if (esDiaHabil(cursor)) {
      diasContados++;
    }
    if (diasContados < diasEnvio) {
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  // Comparamos con Halloween (31 de octubre)
  const halloween = new Date(tiendaConfig.fechaHalloween + 'T23:59:59');
  const esATiempo = cursor <= halloween;
  
  // Entrega justa si llega el 30 o el 31 de octubre
  const esEntregaJusta = cursor.getDate() >= 30 && cursor.getMonth() === 9 && cursor.getFullYear() === halloween.getFullYear();

  let estado: 'a-tiempo' | 'justa' | 'tarde' = 'a-tiempo';
  if (!esATiempo) {
    estado = 'tarde';
  } else if (esEntregaJusta) {
    estado = 'justa';
  }

  return {
    fechaEntrega: cursor,
    diasHabilesReales: diasEnvio,
    esATiempo,
    esEntregaJusta,
    estado,
  };
}

/**
 * Formatea una fecha en español (ej: "Jueves 24 de octubre")
 */
export function formatFechaEntrega(date: Date): string {
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  return `${diasSemana[date.getDay()]} ${date.getDate()} de ${meses[date.getMonth()]}`;
}
