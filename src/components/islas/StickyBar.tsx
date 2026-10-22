import { useState, useEffect } from 'preact/hooks';
import { currentPack, getActiveWhatsAppUrl } from '../../lib/store';
import { formatCOP } from '../../lib/whatsapp';
import { trackWhatsAppClick } from '../../lib/tracking';
import { tiendaConfig, getTemporadaActiva } from '../../config/tienda';

export default function StickyBar() {
  const [visible, setVisible] = useState(false);
  const [nearBottom, setNearBottom] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ dias: 0, horas: 0, minutos: 0 });
  const [temporada, setTemporada] = useState<'preventa' | 'ultimos-dias' | 'liquidacion'>('preventa');

  const pack = currentPack.value;

  useEffect(() => {
    setTemporada(getTemporadaActiva(tiendaConfig));

    const handleScroll = () => {
      // Mostrar después de pasar el hero (aprox 500px)
      const scrolledPastHero = window.scrollY > 450;
      
      // Ocultar si estamos en el CTA final
      const ctaFinal = document.getElementById('cta-final');
      let isAtCtaFinal = false;
      if (ctaFinal) {
        const rect = ctaFinal.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          isAtCtaFinal = true;
        }
      }

      setVisible(scrolledPastHero);
      setNearBottom(isAtCtaFinal);
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

  const handleCtaClick = (origen: string) => {
    trackWhatsAppClick({
      pack: pack.nombre,
      valor: pack.precio,
      ciudad: '',
      origen,
    });
  };

  const whatsappUrl = getActiveWhatsAppUrl('sticky_bar');

  return (
    <>
      {/* Botón flotante verde WhatsApp en Desktop */}
      <aside aria-label="Contacto directo por WhatsApp" class="hidden md:block fixed bottom-6 right-6 z-50">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener"
          onClick={() => handleCtaClick('desktop_floating_whatsapp')}
          class="flex items-center gap-3 px-5 py-3.5 bg-whatsapp hover:bg-[#20ba59] text-white font-bold rounded-full shadow-[0_4px_25px_rgba(37,211,102,0.45)] transition-all transform hover:scale-105 active:scale-95 group focus-visible:outline-calabaza"
          aria-label="Pedir o consultar por WhatsApp"
        >
          <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm0 18.06c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.03 8.03 0 01-1.23-4.29c0-4.47 3.64-8.11 8.12-8.11 2.17 0 4.21.85 5.74 2.38a8.07 8.07 0 012.38 5.73c-.01 4.47-3.65 8.11-8.12 8.11zm4.45-6.08c-.24-.12-1.45-.72-1.68-.8-.23-.08-.39-.12-.56.12-.17.24-.64.8-.78.96-.15.16-.29.18-.54.06-.24-.12-1.03-.38-1.96-1.21-.73-.65-1.22-1.45-1.36-1.7-.14-.24-.02-.37.1-.49.11-.11.24-.29.37-.43.12-.15.16-.25.24-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.24-.87.85-.87 2.07s.89 2.4 1.02 2.57c.12.17 1.76 2.68 4.26 3.76.6.26 1.06.41 1.42.53.6.19 1.15.16 1.58.1.48-.07 1.45-.59 1.66-1.16.2-.58.2-1.07.14-1.16-.06-.1-.23-.16-.47-.28z"/>
          </svg>
          <span class="text-sm font-sans tracking-wide">Pide por WhatsApp</span>
        </a>
      </aside>

      {/* Barra fija inferior en Móvil */}
      {visible && !nearBottom && (
        <aside
          aria-label="Acción rápida de pedido"
          class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-noche/95 border-t border-white/15 px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur-md shadow-[0_-8px_20px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom duration-200"
        >
          <div class="flex items-center justify-between gap-3">
            {/* Miniatura y Precio */}
            <div class="flex items-center gap-2.5 min-w-0">
              <img
                src="/images/hero-frente.jpg"
                alt="Miniatura máscara del grito"
                width="44"
                height="44"
                class="w-11 h-11 object-cover rounded-lg border border-white/20 bg-sombra flex-shrink-0"
              />
              <div class="min-w-0">
                <div class="text-[11px] text-ceniza uppercase tracking-wider truncate font-semibold">
                  Pack {pack.nombre}
                </div>
                <div class="font-heading text-xl text-hueso tabular-nums leading-none font-bold">
                  {formatCOP(pack.precio)}
                </div>
                {temporada !== 'liquidacion' && (
                  <div class="text-[10px] text-calabaza font-semibold flex items-center gap-1 mt-0.5">
                    <span>⏳</span>
                    <span class="tabular-nums font-heading tracking-wide">
                      {timeLeft.dias}d {timeLeft.horas}h
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Botón Pedir */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener"
              onClick={() => handleCtaClick('mobile_sticky_pedir')}
              class="btn-glow h-12 bg-calabaza active:bg-calabaza-hover text-noche font-heading text-xl tracking-wide uppercase px-5 rounded-xl flex items-center justify-center gap-2 flex-shrink-0 min-w-[130px]"
            >
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm0 18.06c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.03 8.03 0 01-1.23-4.29c0-4.47 3.64-8.11 8.12-8.11 2.17 0 4.21.85 5.74 2.38a8.07 8.07 0 012.38 5.73c-.01 4.47-3.65 8.11-8.12 8.11zm4.45-6.08c-.24-.12-1.45-.72-1.68-.8-.23-.08-.39-.12-.56.12-.17.24-.64.8-.78.96-.15.16-.29.18-.54.06-.24-.12-1.03-.38-1.96-1.21-.73-.65-1.22-1.45-1.36-1.7-.14-.24-.02-.37.1-.49.11-.11.24-.29.37-.43.12-.15.16-.25.24-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.24-.87.85-.87 2.07s.89 2.4 1.02 2.57c.12.17 1.76 2.68 4.26 3.76.6.26 1.06.41 1.42.53.6.19 1.15.16 1.58.1.48-.07 1.45-.59 1.66-1.16.2-.58.2-1.07.14-1.16-.06-.1-.23-.16-.47-.28z"/>
              </svg>
              <span>Pedir</span>
            </a>
          </div>
        </aside>
      )}
    </>
  );
}
