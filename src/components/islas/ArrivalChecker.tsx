import { useState, useEffect } from 'preact/hooks';
import { tiendaConfig, getTemporadaActiva } from '../../config/tienda';
import { calcularFechaEntrega, formatFechaEntrega } from '../../lib/fechas';
import { selectedCity, scrollToOrderForm } from '../../lib/store';
import { trackArrivalCheck } from '../../lib/tracking';

export default function ArrivalChecker() {
  const [ciudad, setCiudad] = useState(selectedCity.value || 'Bogotá D.C.');
  const [resultado, setResultado] = useState(() => calcularFechaEntrega(1));
  const [temporada, setTemporada] = useState<'preventa' | 'ultimos-dias' | 'liquidacion'>('preventa');

  useEffect(() => {
    setTemporada(getTemporadaActiva(tiendaConfig));
  }, []);

  const handleChangeCiudad = (nuevaCiudad: string) => {
    setCiudad(nuevaCiudad);
    selectedCity.value = nuevaCiudad;

    const ciudadObj = tiendaConfig.ciudades.find((c) => c.nombre === nuevaCiudad);
    const dias = ciudadObj ? ciudadObj.diasEnvio : tiendaConfig.diasEnvioOtras;

    const res = calcularFechaEntrega(dias);
    setResultado(res);

    trackArrivalCheck({
      ciudad: nuevaCiudad,
      aTiempo: res.esATiempo,
    });
  };

  if (temporada === 'liquidacion') {
    return null; // Oculto en liquidación
  }

  const handlePedirExpress = () => {
    scrollToOrderForm();
  };

  return (
    <div class="w-full bg-sombra border border-white/10 rounded-[14px] p-5 sm:p-7 my-6 shadow-xl relative overflow-hidden">
      {/* Fondo sutil */}
      <div class="absolute -right-12 -top-12 w-48 h-48 bg-calabaza/5 rounded-full blur-3xl pointer-events-none" />

      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-calabaza/20 text-calabaza font-bold text-sm">
              🚚
            </span>
            <h3 class="font-heading text-2xl sm:text-3xl text-hueso tracking-wide m-0">
              ¿LLEGA ANTES DE HALLOWEEN?
            </h3>
          </div>
          <p class="text-ceniza text-sm m-0">
            Calcula la entrega en días hábiles directo a tu dirección.
          </p>
        </div>

        {/* Selector de ciudad */}
        <div class="w-full md:w-auto min-w-[260px]">
          <label for="arrival-city-select" class="sr-only">Selecciona tu ciudad</label>
          <div class="relative">
            <select
              id="arrival-city-select"
              value={ciudad}
              onChange={(e) => handleChangeCiudad((e.target as HTMLSelectElement).value)}
              class="w-full bg-noche text-hueso border border-white/20 rounded-xl px-4 py-3 text-sm font-medium focus:border-calabaza focus:outline-none appearance-none cursor-pointer pr-10 shadow-inner"
            >
              {tiendaConfig.ciudades.map((c) => (
                <option key={c.nombre} value={c.nombre}>
                  {c.nombre} ({c.diasEnvio} {c.diasEnvio === 1 ? 'día' : 'días'})
                </option>
              ))}
              <option value="Otra ciudad">Otra ciudad de Colombia ({tiendaConfig.diasEnvioOtras} días)</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-ceniza">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados dinámicos */}
      <div class="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="text-xs text-ceniza uppercase tracking-wider font-semibold">
            Fecha estimada de entrega en {ciudad}:
          </div>
          <div class="text-lg sm:text-xl font-bold text-hueso flex items-center gap-2">
            <span>📅</span>
            <span>{formatFechaEntrega(resultado.fechaEntrega)}</span>
          </div>
        </div>

        {/* Mensaje de estado */}
        <div>
          {resultado.estado === 'a-tiempo' && (
            <div class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-semibold text-sm">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Llega a tiempo si pides hoy</span>
            </div>
          )}

          {resultado.estado === 'justa' && (
            <div class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-calabaza/20 border border-calabaza/40 text-calabaza font-semibold text-sm">
              <span class="w-2.5 h-2.5 rounded-full bg-calabaza animate-ping"></span>
              <span>Pide hoy: entrega justa</span>
            </div>
          )}

          {resultado.estado === 'tarde' && (
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sangre/20 border border-sangre/40 text-rose-300 font-semibold text-sm">
                <span>⚠️</span>
                <span>Puede no llegar antes del 31</span>
              </div>
              <button
                type="button"
                onClick={handlePedirExpress}
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-calabaza text-noche font-bold text-xs uppercase tracking-wide hover:bg-calabaza-hover transition-colors cursor-pointer"
              >
                <span>Pedir con envío express</span>
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 5v14M19 12l-7 7-7-7"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
