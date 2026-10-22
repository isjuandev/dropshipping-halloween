import { useState, useEffect } from 'preact/hooks';
import { trackGenerateLead } from '../../lib/tracking';
import { formatCOP } from '../../lib/pedido-schema';

interface ResumenData {
  pedidoId: string;
  fecha?: string;
  nombreCliente: string;
  total: number;
  productoNombre: string;
  paquete: string;
  ciudad: string;
  direccion: string;
  cliente?: {
    nombreCompleto: string;
    celular: string;
    departamento: string;
    ciudad: string;
    direccion: string;
    indicaciones?: string;
  };
  producto?: {
    nombre: string;
    variante?: string;
    paquete: string;
    cantidad: number;
    extras?: string[];
    total: number;
  };
  items?: Array<{
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
}

function formatPhone(phone?: string) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('57')) {
    const nat = digits.slice(2);
    return `+57 ${nat.slice(0, 3)} ${nat.slice(3, 6)} ${nat.slice(6)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return phone;
}

export default function ThankYouDetails() {
  const [data, setData] = useState<ResumenData | null>(null);
  const [copied, setCopied] = useState(false);
  const [pedidoId, setPedidoId] = useState('');

  useEffect(() => {
    // Leer ID de la URL
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('id') || '';
    setPedidoId(idFromUrl);

    try {
      const stored =
        sessionStorage.getItem('ultimo_pedido_resumen') ||
        localStorage.getItem('ultimo_pedido_resumen_backup');

      if (stored) {
        const parsed: ResumenData = JSON.parse(stored);
        setData(parsed);

        // Tracking solo una vez por pedidoId
        const trackingKey = `lead_tracked_${parsed.pedidoId}`;
        if (!sessionStorage.getItem(trackingKey)) {
          sessionStorage.setItem(trackingKey, 'true');
          trackGenerateLead({
            pedidoId: parsed.pedidoId,
            valor: parsed.total,
            pack: parsed.paquete,
          });
        }
      }
    } catch (e) {
      console.warn('No se pudo leer resumen de almacenamiento');
    }
  }, []);

  const handleCopyId = () => {
    const idToCopy = data?.pedidoId || pedidoId;
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const finalId = data?.pedidoId || pedidoId || 'PED-CONFIRMADO';
  const cliente = data?.cliente;
  const producto = data?.producto;
  const nombreCompleto = cliente?.nombreCompleto || data?.nombreCliente || '';
  const primerNombre = nombreCompleto ? nombreCompleto.split(' ')[0] : '';
  const cantidad = producto?.cantidad ?? 1;

  return (
    <div class="space-y-6">
      {/* Saludo dinámico */}
      <div class="text-center">
        <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center text-3xl sm:text-4xl shadow-xl shadow-emerald-500/10 mb-4 animate-in zoom-in duration-300">
          ✓
        </div>
        <h1 class="font-heading text-4xl sm:text-5xl md:text-6xl text-hueso tracking-wide m-0">
          ¡PEDIDO RECIBIDO{primerNombre ? `, ${primerNombre.toUpperCase()}` : ''}!
        </h1>
        <p class="text-ceniza text-sm sm:text-base mt-2 m-0 max-w-lg mx-auto">
          Hemos registrado tu solicitud de despacho contraentrega con éxito.
        </p>
      </div>

      {/* Tarjeta de Número de Pedido Copiable */}
      <div class="bg-sombra border border-calabaza/40 rounded-2xl p-5 sm:p-6 text-center shadow-2xl relative overflow-hidden">
        <div class="text-xs uppercase tracking-widest text-ceniza font-semibold mb-1">
          NÚMERO DE PEDIDO
        </div>
        <div class="font-heading text-3xl sm:text-4xl md:text-5xl text-calabaza font-bold tracking-wider my-2 font-mono">
          {finalId}
        </div>
        <button
          type="button"
          onClick={handleCopyId}
          class="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-hueso text-xs font-semibold transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <span class="text-emerald-400">✓</span>
              <span>¡Copiado al portapapeles!</span>
            </>
          ) : (
            <>
              <span>📋</span>
              <span>Copiar número de pedido</span>
            </>
          )}
        </button>
      </div>

      {/* Resumen Completo del Pedido */}
      {data && (
        <div class="bg-sombra/95 border border-white/10 rounded-2xl p-5 sm:p-7 space-y-6 shadow-xl">
          <div class="border-b border-white/10 pb-3 flex items-center justify-between">
            <h3 class="font-heading text-2xl text-hueso tracking-wide m-0">
              Resumen Completo del Pedido
            </h3>
            <span class="text-xs uppercase tracking-wider font-semibold px-2.5 py-1 rounded-md bg-calabaza/15 text-calabaza border border-calabaza/30">
              Contraentrega
            </span>
          </div>

          {/* Bloque 1: Producto y Paquete */}
          <div class="space-y-3">
            <div class="text-xs uppercase tracking-wider text-calabaza font-bold flex items-center gap-1.5">
              <span>📦</span>
              <span>Detalle del Producto</span>
            </div>
            <div class="bg-noche/60 rounded-xl p-4 border border-white/5 space-y-2.5 text-sm">
              <div class="flex justify-between items-baseline gap-2">
                <span class="text-ceniza">Producto:</span>
                <span class="text-hueso font-medium text-right">
                  {producto?.nombre || data.productoNombre || 'Máscara Fantasma del Grito'}
                </span>
              </div>

              <div class="flex justify-between items-baseline gap-2">
                <span class="text-ceniza">Paquete seleccionado:</span>
                <span class="text-calabaza font-semibold text-right">
                  {producto?.paquete || data.paquete} ({cantidad} {cantidad === 1 ? 'unidad' : 'unidades'})
                </span>
              </div>

              {producto?.variante && (
                <div class="flex justify-between items-baseline gap-2 pt-1 border-t border-white/5">
                  <span class="text-ceniza">Variantes:</span>
                  <span class="text-hueso font-medium text-right max-w-[260px] sm:max-w-xs">
                    {producto.variante}
                  </span>
                </div>
              )}

              {producto?.extras && producto.extras.length > 0 && (
                <div class="flex justify-between items-baseline gap-2 pt-1 border-t border-white/5">
                  <span class="text-ceniza">Extras incluidos:</span>
                  <span class="text-emerald-400 font-medium text-right">
                    {producto.extras.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bloque 2: Datos de Envío y Contacto */}
          <div class="space-y-3">
            <div class="text-xs uppercase tracking-wider text-calabaza font-bold flex items-center gap-1.5">
              <span>📍</span>
              <span>Datos de Entrega y Contacto</span>
            </div>
            <div class="bg-noche/60 rounded-xl p-4 border border-white/5 space-y-2.5 text-sm">
              <div class="flex justify-between items-baseline gap-2">
                <span class="text-ceniza">Destinatario:</span>
                <span class="text-hueso font-medium text-right">
                  {cliente?.nombreCompleto || data.nombreCliente}
                </span>
              </div>

              {(cliente?.celular) && (
                <div class="flex justify-between items-baseline gap-2">
                  <span class="text-ceniza">Celular / WhatsApp:</span>
                  <span class="text-hueso font-mono font-medium text-right">
                    {formatPhone(cliente.celular)}
                  </span>
                </div>
              )}

              <div class="flex justify-between items-baseline gap-2">
                <span class="text-ceniza">Departamento y Ciudad:</span>
                <span class="text-hueso font-medium text-right">
                  {cliente?.departamento ? `${cliente.departamento}, ` : ''}{cliente?.ciudad || data.ciudad}
                </span>
              </div>

              <div class="flex justify-between items-baseline gap-2">
                <span class="text-ceniza">Dirección de entrega:</span>
                <span class="text-hueso font-medium text-right max-w-[240px] sm:max-w-sm">
                  {cliente?.direccion || data.direccion}
                </span>
              </div>

              {cliente?.indicaciones && (
                <div class="flex justify-between items-baseline gap-2 pt-1 border-t border-white/5">
                  <span class="text-ceniza">Indicaciones:</span>
                  <span class="text-ceniza italic text-right max-w-[240px] sm:max-w-sm">
                    "{cliente.indicaciones}"
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bloque 3: Totales y Pago */}
          <div class="pt-2 border-t border-white/10 space-y-2">
            <div class="flex justify-between text-sm text-ceniza">
              <span>Costo de envío:</span>
              <span class="text-emerald-400 font-semibold uppercase tracking-wider text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ¡Envío Gratis!
              </span>
            </div>
            <div class="flex justify-between text-sm text-ceniza">
              <span>Método de pago:</span>
              <span class="text-hueso font-medium">Efectivo o Transferencia al recibir</span>
            </div>
            <div class="flex justify-between items-baseline pt-3 border-t border-white/10">
              <span class="text-hueso font-bold text-base sm:text-lg">
                Total a pagar al recibir:
              </span>
              <span class="text-calabaza font-heading text-3xl sm:text-4xl tabular-nums font-bold">
                {formatCOP(data.total)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
