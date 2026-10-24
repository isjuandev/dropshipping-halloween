import { useState, useEffect } from 'preact/hooks';

/**
 * Botón flotante inferior "Pedir ahora — pago contraentrega".
 * Solo aparece cuando ningún otro llamado a la acción (elementos con [data-cta])
 * está visible en pantalla, para no duplicar botones.
 */
export default function StickyBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;

    const evaluar = () => {
      frame = 0;
      const alto = window.innerHeight;
      const hayOtroCta = Array.from(document.querySelectorAll<HTMLElement>('[data-cta]')).some((el) => {
        const rect = el.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < alto && rect.height > 0;
      });
      setVisible(!hayOtroCta);
    };

    const programar = () => {
      if (!frame) frame = requestAnimationFrame(evaluar);
    };

    window.addEventListener('scroll', programar, { passive: true });
    window.addEventListener('resize', programar);
    evaluar();

    return () => {
      window.removeEventListener('scroll', programar);
      window.removeEventListener('resize', programar);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const handleCtaClick = () => {
    const packs = document.getElementById('seccion-packs');
    if (packs) {
      packs.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.href = '/#seccion-packs';
    }
  };

  return (
    <aside
      aria-label="Acción rápida de pedido"
      aria-hidden={!visible}
      class={`fixed bottom-0 left-0 right-0 z-50 px-3 sm:px-6 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-noche via-noche/90 to-transparent transition-all duration-200 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <button
        type="button"
        onClick={handleCtaClick}
        tabIndex={visible ? 0 : -1}
        class="btn-glow w-full max-w-xl mx-auto h-14 bg-calabaza hover:bg-calabaza-hover active:bg-calabaza-hover text-noche font-heading text-xl sm:text-2xl tracking-wide uppercase rounded-xl flex items-center justify-center gap-3 px-6 text-center shadow-xl cursor-pointer"
      >
        <span>Pedir ahora — pago contraentrega</span>
        <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <path d="M12 5v14M19 12l-7 7-7-7"/>
        </svg>
      </button>
    </aside>
  );
}
