import {
  selectedPackId,
  unitVariants,
  updateUnitVariant,
  scrollToOrderForm,
  currentPack,
} from '../../lib/store';
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
    scrollToOrderForm(pack.id);
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

      {/* Botón CTA principal Hero: Scroll a #pedido */}
      <div class="pt-1">
        <button
          type="button"
          onClick={handleCtaClick}
          class="btn-glow w-full h-14 bg-calabaza hover:bg-calabaza-hover text-noche font-heading text-2xl tracking-wide uppercase rounded-xl flex items-center justify-center gap-3 transition-all min-h-[56px] px-6 text-center shadow-lg cursor-pointer"
        >
          <span>Pedir ahora — pago contraentrega</span>
          <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </button>

        {/* Microcopy reductor de fricción */}
        <p class="text-center text-xs text-ceniza mt-2 flex items-center justify-center gap-2">
          <span>🔒 Pago contra entrega</span>
          <span>·</span>
          <span>🚚 Despacho rápido a todo el país</span>
        </p>
      </div>
    </div>
  );
}
