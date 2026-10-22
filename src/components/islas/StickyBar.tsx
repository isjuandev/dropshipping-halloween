import { useState, useEffect } from 'preact/hooks';
import { currentPack, scrollToOrderForm } from '../../lib/store';
import { formatCOP } from '../../lib/pedido-schema';
import { tiendaConfig, getTemporadaActiva } from '../../config/tienda';

export default function StickyBar() {
  const [visible, setVisible] = useState(false);
  const [inOrderSection, setInOrderSection] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ dias: 0, horas: 0, minutos: 0 });
  const [temporada, setTemporada] = useState<'preventa' | 'ultimos-dias' | 'liquidacion'>('preventa');

  const pack = currentPack.value;

  useEffect(() => {
    setTemporada(getTemporadaActiva(tiendaConfig));

    const handleScroll = () => {
      // Mostrar después de pasar el hero (aprox 450px)
      const scrolledPastHero = window.scrollY > 450;

      // Ocultar cuando la sección #pedido esté visible en pantalla o en el CTA final
      const orderSection = document.getElementById('pedido');
      const ctaFinal = document.getElementById('cta-final');

      let isInsideOrderOrFinal = false;

      if (orderSection) {
        const rect = orderSection.getBoundingClientRect();
        // Visible si la sección #pedido está en el viewport
        if (rect.top < window.innerHeight && rect.bottom > 80) {
          isInsideOrderOrFinal = true;
        }
      }

      if (ctaFinal && !isInsideOrderOrFinal) {
        const rect = ctaFinal.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 80) {
          isInsideOrderOrFinal = true;
        }
      }

      setVisible(scrolledPastHero);
      setInOrderSection(isInsideOrderOrFinal);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Contador mini
    const targetDate = new Date(`${tiendaConfig.fechaHalloween}T23:59:59-05:00`).getTime();
    const updateCountdown = () => {
      const nowBogota = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' })).getTime();
      const diff = targetDate - nowBogota;
      if (diff > 0) {
        const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft({ dias, horas, minutos });
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const handleCtaClick = () => {
    scrollToOrderForm(pack.id);
  };

  if (!visible || inOrderSection) {
    return null;
  }

  return (
    <aside
      aria-label="Acción rápida de pedido"
      class="fixed bottom-0 left-0 right-0 z-50 bg-noche/95 border-t border-white/15 px-3 sm:px-6 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur-md shadow-[0_-8px_20px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom duration-200"
    >
      <div class="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Miniatura y Precio */}
        <div class="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <img
            src="/images/hero-frente.jpg"
            alt="Miniatura máscara del grito"
            width="44"
            height="44"
            class="w-11 h-11 sm:w-12 sm:h-12 object-cover rounded-lg border border-white/20 bg-sombra flex-shrink-0"
          />
          <div class="min-w-0">
            <div class="text-[11px] sm:text-xs text-ceniza uppercase tracking-wider truncate font-semibold">
              Pack {pack.nombre} ({pack.unidades} {pack.unidades === 1 ? 'unidad' : 'unidades'})
            </div>
            <div class="flex items-baseline gap-2">
              <span class="font-heading text-xl sm:text-2xl text-hueso tabular-nums leading-none font-bold">
                {formatCOP(pack.precio)}
              </span>
              <span class="text-[11px] text-calabaza font-semibold hidden sm:inline">
                Ahorras {formatCOP(pack.ahorro)}
              </span>
            </div>
            {temporada !== 'liquidacion' && (
              <div class="text-[10px] text-calabaza font-semibold flex items-center gap-1 mt-0.5">
                <span>⏳</span>
                <span class="tabular-nums font-heading tracking-wide">
                  Faltan {timeLeft.dias}d {timeLeft.horas}h
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Botón Pedir ahora */}
        <button
          type="button"
          onClick={handleCtaClick}
          class="btn-glow h-12 bg-calabaza active:bg-calabaza-hover text-noche font-heading text-xl sm:text-2xl tracking-wide uppercase px-5 sm:px-8 rounded-xl flex items-center justify-center gap-2 flex-shrink-0 min-w-[130px] cursor-pointer shadow-lg"
        >
          <span>Pedir ahora</span>
          <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </button>
      </div>
    </aside>
  );
}
