import { selectedPackId, selectPack, scrollToOrderForm, currentPack, PACKS_DATA } from '../../lib/store';
import { formatCOP } from '../../lib/pedido-schema';

interface ImagenOptimizada {
  src: string;
  srcset?: string;
  width: number;
  height: number;
}

interface Props {
  // Imagen destacada del Pack 2 (optimizada en build con astro:assets)
  imagenPackDestacado?: ImagenOptimizada;
}

const PACK_DESTACADO = 'pack-2';

export default function PackSelector({ imagenPackDestacado }: Props) {
  const pack = currentPack.value;

  const handleCtaClick = () => {
    scrollToOrderForm(pack.id);
  };

  return (
    <div class="w-full">
      {/* Grid de 3 Packs */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-start" role="radiogroup" aria-label="Elige tu pack de mallas LED">
        {PACKS_DATA.map((p) => {
          const isSelected = selectedPackId.value === p.id;
          const esDestacado = p.id === PACK_DESTACADO;
          return (
            <div
              key={p.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => selectPack(p.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  selectPack(p.id);
                }
              }}
              class={`relative rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col ${
                isSelected
                  ? 'bg-noche/90 border-calabaza ring-2 ring-calabaza/30 shadow-2xl'
                  : 'bg-noche/50 border-white/10 hover:border-neon-morado/50 hover:bg-noche/70'
              }`}
            >
              {/* Badge superior */}
              {p.badge && (
                <div
                  class={`absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow ${
                    esDestacado
                      ? 'bg-gradient-to-r from-neon-morado to-neon-cian text-white'
                      : 'bg-sombra border border-white/20 text-hueso'
                  }`}
                >
                  {p.badge}
                </div>
              )}

              {/* Imagen destacada del pack más vendido */}
              {esDestacado && imagenPackDestacado && (
                <div class="aspect-square overflow-hidden rounded-2xl mb-4 mt-2 border border-white/10">
                  <img
                    src={imagenPackDestacado.src}
                    srcset={imagenPackDestacado.srcset}
                    sizes="(min-width: 1024px) 360px, 92vw"
                    alt="Dos mallas LED RGB instaladas en las ventanas de una fachada"
                    width={imagenPackDestacado.width}
                    height={imagenPackDestacado.height}
                    loading="lazy"
                    decoding="async"
                    class="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              )}

              <div class="flex-1">
                <div class="flex items-center justify-between gap-3 mb-1 mt-1">
                  <div class="flex items-center gap-3">
                    <span
                      class={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-calabaza bg-calabaza' : 'border-ceniza/50'
                      }`}
                    >
                      {isSelected && <span class="w-2 h-2 rounded-full bg-noche"></span>}
                    </span>
                    <h4 class="font-heading text-2xl text-hueso tracking-wide m-0 leading-none">
                      {p.nombre}
                    </h4>
                  </div>
                  <span class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/10 text-ceniza whitespace-nowrap">
                    {p.subtitulo}
                  </span>
                </div>

                <p class="text-xs text-ceniza leading-snug mt-2 mb-3">
                  {p.incluye}
                </p>

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
                    <span class="text-neon-cian font-semibold bg-neon-cian/10 px-2 py-0.5 rounded border border-neon-cian/25">
                      {formatCOP(p.precioPorUnidad)} / malla
                    </span>
                  )}
                  <span class="text-calabaza font-semibold bg-calabaza/10 px-2 py-0.5 rounded border border-calabaza/20">
                    Ahorras {formatCOP(p.ahorro)}
                  </span>
                </div>
              </div>

              {/* Estado de selección */}
              <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold">
                <span class={isSelected ? 'text-calabaza' : 'text-ceniza'}>
                  {isSelected ? '✓ Pack seleccionado' : 'Toca para seleccionar'}
                </span>
                <span class="text-ceniza">Pago contra entrega</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA dinámico para el pack seleccionado: Scroll a #pedido */}
      <div class="max-w-xl mx-auto">
        <button
          type="button"
          onClick={handleCtaClick}
          class="btn-glow w-full h-14 bg-calabaza hover:bg-calabaza-hover active:bg-calabaza-hover text-noche font-heading text-xl sm:text-2xl tracking-wide uppercase rounded-xl flex items-center justify-center gap-3 transition-all min-h-[56px] px-6 text-center shadow-xl cursor-pointer"
        >
          <span>Pedir {pack.nombre} — contraentrega</span>
          <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </button>

        <div class="mt-2.5 text-center text-xs text-ceniza flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span>📦 Despacho inmediato</span>
          <span>·</span>
          <span>🤝 Pago contra entrega</span>
          <span>·</span>
          <span>🔄 Garantía de funcionamiento</span>
        </div>
      </div>
    </div>
  );
}
