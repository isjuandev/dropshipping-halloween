import {
  selectedPackId,
  unitVariants,
  selectPack,
  updateUnitVariant,
  getActiveWhatsAppUrl,
  currentPack,
  PACKS_DATA,
} from '../../lib/store';
import { formatCOP } from '../../lib/whatsapp';
import { trackWhatsAppClick } from '../../lib/tracking';

const MODELOS = ['Clásica blanca', 'Con sangre'];
const TALLAS = ['Adulto', 'Niño'];

export default function PackSelector() {
  const pack = currentPack.value;
  const currentUnits = unitVariants.value;

  const handleSelectPack = (packId: string) => {
    selectPack(packId);
  };

  const handleCtaClick = () => {
    trackWhatsAppClick({
      pack: pack.nombre,
      valor: pack.precio,
      ciudad: '',
      origen: 'packs_selector',
    });
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

      {/* CTA dinámico para el pack seleccionado */}
      <div class="max-w-xl mx-auto">
        <a
          href={getActiveWhatsAppUrl('packs_section')}
          target="_blank"
          rel="noopener"
          onClick={handleCtaClick}
          class="btn-glow w-full h-14 bg-calabaza hover:bg-calabaza-hover text-noche font-heading text-2xl tracking-wide uppercase rounded-xl flex items-center justify-center gap-3 transition-all min-h-[56px] px-6 text-center shadow-xl"
        >
          <svg class="w-6 h-6 fill-current flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm0 18.06c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.03 8.03 0 01-1.23-4.29c0-4.47 3.64-8.11 8.12-8.11 2.17 0 4.21.85 5.74 2.38a8.07 8.07 0 012.38 5.73c-.01 4.47-3.65 8.11-8.12 8.11zm4.45-6.08c-.24-.12-1.45-.72-1.68-.8-.23-.08-.39-.12-.56.12-.17.24-.64.8-.78.96-.15.16-.29.18-.54.06-.24-.12-1.03-.38-1.96-1.21-.73-.65-1.22-1.45-1.36-1.7-.14-.24-.02-.37.1-.49.11-.11.24-.29.37-.43.12-.15.16-.25.24-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.24-.87.85-.87 2.07s.89 2.4 1.02 2.57c.12.17 1.76 2.68 4.26 3.76.6.26 1.06.41 1.42.53.6.19 1.15.16 1.58.1.48-.07 1.45-.59 1.66-1.16.2-.58.2-1.07.14-1.16-.06-.1-.23-.16-.47-.28z"/>
          </svg>
          <span>Pedir pack {pack.nombre} por {formatCOP(pack.precio)}</span>
        </a>

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
