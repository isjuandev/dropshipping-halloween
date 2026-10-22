import {
  selectedPackId,
  unitVariants,
  selectPack,
  updateUnitVariant,
  scrollToOrderForm,
  currentPack,
  PACKS_DATA,
} from '../../lib/store';
import { formatCOP } from '../../lib/pedido-schema';

const MODELOS = ['Clásica blanca', 'Con sangre'];
const TALLAS = ['Adulto', 'Niño'];

export default function PackSelector() {
  const pack = currentPack.value;
  const currentUnits = unitVariants.value;

  const handleSelectPack = (packId: string) => {
    selectPack(packId);
  };

  const handleCtaClick = () => {
    scrollToOrderForm(pack.id);
  };

  return (
    <div class="w-full">
      {/* Grid de 4 Packs */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {PACKS_DATA.map((p) => {
          const isSelected = selectedPackId.value === p.id;
          return (
            <div
              key={p.id}
              onClick={() => handleSelectPack(p.id)}
              class={`relative rounded-[14px] p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-noche/90 border-calabaza ring-2 ring-calabaza/30 shadow-2xl'
                  : 'bg-noche/50 border-white/10 hover:border-white/30 hover:bg-noche/70'
              }`}
            >
              {/* Badge superior */}
              {p.badge && (
                <div class="absolute -top-3.5 right-4 px-3 py-0.5 rounded-full bg-sangre text-hueso text-[11px] font-bold uppercase tracking-wider shadow">
                  {p.badge}
                </div>
              )}

              <div>
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-3">
                    <span
                      class={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-calabaza bg-calabaza' : 'border-ceniza/50'
                      }`}
                    >
                      {isSelected && <span class="w-2 h-2 rounded-full bg-noche"></span>}
                    </span>
                    <h4 class="font-heading text-2xl text-hueso tracking-wide m-0">
                      Pack {p.nombre}
                    </h4>
                  </div>
                  <span class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/10 text-ceniza">
                    {p.unidades} {p.unidades === 1 ? 'máscara' : 'máscaras'}
                  </span>
                </div>

                {p.descripcionExtras && (
                  <p class="text-xs text-calabaza font-semibold mb-2">
                    ✨ {p.descripcionExtras}
                  </p>
                )}

                <div class="flex items-baseline gap-2 mb-2">
                  <span class="font-heading text-3xl sm:text-4xl text-hueso tabular-nums font-bold">
                    {formatCOP(p.precio)}
                  </span>
                  <span class="text-sm text-ceniza line-through tabular-nums">
                    {formatCOP(p.precioAntes)}
                  </span>
                </div>

                <div class="flex flex-wrap items-center gap-2 text-xs">
                  {p.unidades > 1 && (
                    <span class="text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                      {formatCOP(p.precioPorMascara)} / c.u.
                    </span>
                  )}
                  <span class="text-calabaza font-semibold bg-calabaza/10 px-2 py-0.5 rounded border border-calabaza/20">
                    Ahorras {formatCOP(p.ahorro)}
                  </span>
                </div>
              </div>

              {/* Botón selector radio accesible */}
              <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold">
                <span class={isSelected ? 'text-calabaza' : 'text-ceniza'}>
                  {isSelected ? '✓ Pack seleccionado' : 'Toca para seleccionar este pack'}
                </span>
                <span class="text-ceniza">Envío gratis contra entrega</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuración de variantes por cada unidad si el pack tiene más de 1 unidad */}
      {pack.unidades > 1 && (
        <div class="bg-noche/80 border border-calabaza/30 rounded-[14px] p-5 sm:p-6 mb-6">
          <div class="flex items-center gap-2 mb-4">
            <span class="text-lg">🎭</span>
            <h4 class="font-heading text-xl sm:text-2xl text-hueso tracking-wide m-0">
              Personaliza cada una de las {pack.unidades} máscaras de tu Pack:
            </h4>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentUnits.map((unit, idx) => (
              <div
                key={idx}
                class="bg-sombra border border-white/10 rounded-xl p-3.5 space-y-2.5"
              >
                <div class="text-xs font-bold uppercase tracking-wider text-calabaza flex items-center justify-between">
                  <span>Máscara #{idx + 1}</span>
                  <span class="text-[11px] text-ceniza font-normal">
                    {unit.modelo} · {unit.talla}
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label class="sr-only">Modelo para máscara {idx + 1}</label>
                    <select
                      value={unit.modelo}
                      onChange={(e) =>
                        updateUnitVariant(idx, (e.target as HTMLSelectElement).value, unit.talla)
                      }
                      class="w-full bg-noche text-hueso border border-white/20 rounded-lg px-2.5 py-2 text-xs focus:border-calabaza outline-none"
                    >
                      {MODELOS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label class="sr-only">Talla para máscara {idx + 1}</label>
                    <select
                      value={unit.talla}
                      onChange={(e) =>
                        updateUnitVariant(idx, unit.modelo, (e.target as HTMLSelectElement).value)
                      }
                      class="w-full bg-noche text-hueso border border-white/20 rounded-lg px-2.5 py-2 text-xs focus:border-calabaza outline-none"
                    >
                      {TALLAS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA dinámico para el pack seleccionado: Scroll a #pedido */}
      <div class="max-w-xl mx-auto">
        <button
          type="button"
          onClick={handleCtaClick}
          class="btn-glow w-full h-14 bg-calabaza hover:bg-calabaza-hover active:bg-[#e05800] text-noche font-heading text-2xl tracking-wide uppercase rounded-xl flex items-center justify-center gap-3 transition-all min-h-[56px] px-6 text-center shadow-xl cursor-pointer"
        >
          <span>Pedir ahora — pago contraentrega</span>
          <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </button>

        <div class="mt-2.5 text-center text-xs text-ceniza flex items-center justify-center gap-3">
          <span>📦 Despacho inmediato</span>
          <span>·</span>
          <span>🤝 Pago contra entrega</span>
          <span>·</span>
          <span>🔄 Garantía por daño</span>
        </div>
      </div>
    </div>
  );
}
