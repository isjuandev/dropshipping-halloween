import { useEffect, useState } from 'preact/hooks';
import { tiendaConfig, getTemporadaActiva } from '../../config/tienda';

interface CountdownState {
  dias: number;
  horas: number;
  minutos: number;
  finalizado: boolean;
}

export default function HalloweenCountdown() {
  const [timeLeft, setTimeLeft] = useState<CountdownState>({
    dias: 0,
    horas: 0,
    minutos: 0,
    finalizado: false,
  });
  const [temporada, setTemporada] = useState<'preventa' | 'ultimos-dias' | 'liquidacion'>('preventa');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const activeTemporada = getTemporadaActiva(tiendaConfig);
    setTemporada(activeTemporada);

    const targetDate = new Date(`${tiendaConfig.fechaHalloween}T23:59:59-05:00`).getTime();

    const calculate = () => {
      // Obtener hora actual en Bogotá
      const nowBogota = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' })).getTime();
      const diff = targetDate - nowBogota;

      if (diff <= 0) {
        setTimeLeft({ dias: 0, horas: 0, minutos: 0, finalizado: true });
        setTemporada('liquidacion');
        return;
      }

      const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
      const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ dias, horas, minutos, finalizado: false });
    };

    calculate();
    const interval = setInterval(calculate, 60000); // Se actualiza cada minuto para no distraer
    return () => clearInterval(interval);
  }, []);

  // Formato de fecha límite legible (ej. 27 de octubre)
  const fechaLimiteObj = new Date(tiendaConfig.fechaLimitePedido);
  const meses = ['octubre', 'noviembre'];
  const diaLimite = fechaLimiteObj.getDate();
  const mesLimite = meses[fechaLimiteObj.getMonth() - 9] || 'octubre';
  const textoFechaLimite = `${diaLimite} de ${mesLimite}`;

  // Si está en liquidación
  if (temporada === 'liquidacion' || timeLeft.finalizado) {
    return (
      <aside aria-label="Liquidación de temporada" class="w-full bg-sangre text-hueso py-2.5 px-4 text-center text-sm md:text-base font-semibold tracking-wide shadow-md">
        <div class="max-w-6xl mx-auto flex items-center justify-center gap-2">
          <span class="inline-block animate-pulse">🎃</span>
          <span>Liquidación de temporada Halloween · <strong>-60 % hasta agotar existencias</strong></span>
        </div>
      </aside>
    );
  }

  // Si está en últimos días
  if (temporada === 'ultimos-dias') {
    return (
      <aside aria-label="Aviso de urgencia" class="w-full bg-sangre text-hueso py-2.5 px-4 text-center text-sm md:text-base font-semibold shadow-md">
        <div class="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span class="inline-block">⚡</span>
          <span><strong>Últimos días:</strong> Despacho express garantizado por WhatsApp para recibir antes del 31</span>
        </div>
      </aside>
    );
  }

  // Modo normal / preventa
  return (
    <aside aria-label="Cuenta regresiva de Halloween" class="w-full bg-calabaza text-noche py-2 px-3 sm:px-4 text-center font-medium shadow-md">
      <div class="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs sm:text-sm md:text-base leading-tight">
        <span class="font-bold flex items-center gap-1.5">
          <svg class="w-4 h-4 text-noche" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Faltan
        </span>

        <span class="font-heading tracking-wide text-base sm:text-lg tabular-nums font-bold px-1.5 py-0.5 bg-noche/10 rounded" aria-live="off">
          {mounted ? (
            `${timeLeft.dias}d ${timeLeft.horas}h ${timeLeft.minutos}m`
          ) : (
            `9d 14h 20m`
          )}
        </span>

        <span class="hidden sm:inline text-noche/70">·</span>

        <span>
          Pide antes del <strong class="underline decoration-noche/40">{textoFechaLimite}</strong> y llega a tiempo para Halloween
        </span>
      </div>
    </aside>
  );
}
