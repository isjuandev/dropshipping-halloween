import { useSignal } from '@preact/signals';
import {
  selectedPackId,
  unitVariants,
  updateUnitVariant,
  getActiveWhatsAppUrl,
  currentPack,
} from '../../lib/store';
import { trackWhatsAppClick } from '../../lib/tracking';
import { tiendaConfig } from '../../config/tienda';

const MODELOS = ['Clásica blanca', 'Con sangre'];
const TALLAS = ['Adulto', 'Niño'];

export default function VariantSelector() {
  const currentUnit = unitVariants.value[0] || { modelo: 'Clásica blanca', talla: 'Adulto' };
  const pack = currentPack.value;

  const handleModelChange = (modelo: string) => {
    updateUnitVariant(0, modelo, currentUnit.talla);
  };

  const handleTallaChange = (talla: string) => {
    updateUnitVariant(0, currentUnit.modelo, talla);
  };

  const handleCtaClick = () => {
    trackWhatsAppClick({
      pack: pack.nombre,
      valor: pack.precio,
      ciudad: '',
      origen: 'hero_variant_selector',
    });
  };

  // Stock restante de temporada
  const stockUnidades = tiendaConfig.stock.unidades;
  const stockPorcentaje = Math.min(100, Math.round((stockUnidades / tiendaConfig.stock.totalInicial) * 100));

  return (
    <div class="w-full space-y-4 pt-1">
      {/* Selector de Modelo */}
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-ceniza">
            1. Elige el acabado: <span class="text-hueso">{currentUnit.modelo}</span>
          </label>
        </div>
        <div class="grid grid-cols-2 gap-2.5">
          {MODELOS.map((m) => {
            const isSelected = currentUnit.modelo === m;
            return (
              <button
                type="button"
                key={m}
                onClick={() => handleModelChange(m)}
                class={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer min-h-[48px] ${
                  isSelected
                    ? 'border-calabaza bg-calabaza/15 text-hueso ring-1 ring-calabaza'
                    : 'border-white/10 bg-noche/60 text-ceniza hover:border-white/30 hover:text-hueso'
                }`}
              >
                <div class="flex items-center gap-2">
                  <span
                    class={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-calabaza bg-calabaza' : 'border-ceniza/50'
                    }`}
                  >
                    {isSelected && <span class="w-1.5 h-1.5 rounded-full bg-noche"></span>}
                  </span>
                  <span>{m}</span>
                </div>
                {m === 'Con sangre' && (
                  <span class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sangre/80 text-hueso">
                    Terror
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selector de Talla */}
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-ceniza">
            2. Selecciona la talla: <span class="text-hueso">{currentUnit.talla}</span>
          </label>
          <span class="text-[11px] text-ceniza">
            {currentUnit.talla === 'Adulto' ? 'Ajuste elástico universal' : 'Ideal 6 a 12 años'}
          </span>
        </div>
        <div class="grid grid-cols-2 gap-2.5">
          {TALLAS.map((t) => {
            const isSelected = currentUnit.talla === t;
            return (
              <button
                type="button"
                key={t}
                onClick={() => handleTallaChange(t)}
                class={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer min-h-[48px] ${
                  isSelected
                    ? 'border-calabaza bg-calabaza/15 text-hueso ring-1 ring-calabaza'
                    : 'border-white/10 bg-noche/60 text-ceniza hover:border-white/30 hover:text-hueso'
                }`}
              >
                <div class="flex items-center gap-2">
                  <span
                    class={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-calabaza bg-calabaza' : 'border-ceniza/50'
                    }`}
                  >
                    {isSelected && <span class="w-1.5 h-1.5 rounded-full bg-noche"></span>}
                  </span>
                  <span>{t}</span>
                </div>
                <span class="text-[11px] text-ceniza">
                  {t === 'Adulto' ? 'Única' : '6-12 años'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Barra de stock de temporada */}
      {tiendaConfig.stock.activo && (
        <div class="bg-sombra/80 border border-white/10 rounded-xl p-3 text-xs">
          <div class="flex items-center justify-between font-semibold mb-1.5">
            <span class="text-rose-400 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              ¡Últimas {stockUnidades} unidades de temporada!
            </span>
            <span class="text-ceniza">Alta demanda hoy</span>
          </div>
          <div class="w-full h-2 bg-noche rounded-full overflow-hidden border border-white/5">
            <div
              class="h-full bg-gradient-to-r from-calabaza to-sangre rounded-full"
              style={{ width: `${stockPorcentaje}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Botón CTA principal Hero */}
      <div class="pt-1">
        <a
          href={getActiveWhatsAppUrl('hero_cta')}
          target="_blank"
          rel="noopener"
          onClick={handleCtaClick}
          class="btn-glow w-full h-14 bg-calabaza hover:bg-calabaza-hover text-noche font-heading text-2xl tracking-wide uppercase rounded-xl flex items-center justify-center gap-3 transition-all min-h-[56px] px-6 text-center shadow-lg"
        >
          <svg class="w-6 h-6 fill-current flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm0 18.06c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.03 8.03 0 01-1.23-4.29c0-4.47 3.64-8.11 8.12-8.11 2.17 0 4.21.85 5.74 2.38a8.07 8.07 0 012.38 5.73c-.01 4.47-3.65 8.11-8.12 8.11zm4.45-6.08c-.24-.12-1.45-.72-1.68-.8-.23-.08-.39-.12-.56.12-.17.24-.64.8-.78.96-.15.16-.29.18-.54.06-.24-.12-1.03-.38-1.96-1.21-.73-.65-1.22-1.45-1.36-1.7-.14-.24-.02-.37.1-.49.11-.11.24-.29.37-.43.12-.15.16-.25.24-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.24-.87.85-.87 2.07s.89 2.4 1.02 2.57c.12.17 1.76 2.68 4.26 3.76.6.26 1.06.41 1.42.53.6.19 1.15.16 1.58.1.48-.07 1.45-.59 1.66-1.16.2-.58.2-1.07.14-1.16-.06-.1-.23-.16-.47-.28z"/>
          </svg>
          <span>La quiero — pedir por WhatsApp</span>
        </a>

        {/* Microcopy reductor de fricción */}
        <p class="text-center text-xs text-ceniza mt-2 flex items-center justify-center gap-2">
          <span>🔒 Pago contra entrega</span>
          <span>·</span>
          <span>⚡ Respondemos en minutos</span>
        </p>
      </div>
    </div>
  );
}
