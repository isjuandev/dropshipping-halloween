import { useEffect, useState } from 'preact/hooks';
import { tiendaConfig, getTemporadaActiva } from '../../config/tienda';

/**
 * Barra de anuncio superior. Antes del 31 de octubre empuja la compra para
 * Halloween + Navidad; después de Halloween el mensaje pasa a temporada navideña.
 */
export default function HalloweenCountdown() {
  const [temporada, setTemporada] = useState<'preventa' | 'ultimos-dias' | 'liquidacion'>('preventa');

  useEffect(() => {
    setTemporada(getTemporadaActiva(tiendaConfig));
  }, []);

  const mensaje =
    temporada === 'liquidacion' ? (
      <>🎄 Temporada de Navidad · <strong>Pide hoy con Pago Contraentrega</strong> y decora tu casa para diciembre y Fin de Año</>
    ) : (
      <>⏳ Recta final de Octubre · <strong>Pide hoy con Pago Contraentrega</strong> y úsala en Halloween, Navidad y Fin de Año</>
    );

  return (
    <aside
      aria-label="Anuncio de temporada"
      class="w-full bg-gradient-to-r from-neon-morado via-[#6d4fd8] to-neon-cian text-white py-2 px-3 sm:px-4 text-center font-medium shadow-md"
    >
      <p class="max-w-6xl mx-auto m-0 text-xs sm:text-sm md:text-base leading-tight">
        {mensaje}
      </p>
    </aside>
  );
}
