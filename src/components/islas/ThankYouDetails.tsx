import { useState, useEffect } from 'preact/hooks';
import { trackGenerateLead } from '../../lib/tracking';
import { formatCOP } from '../../lib/pedido-schema';

interface ResumenData {
  pedidoId: string;
  nombreCliente: string;
  total: number;
  productoNombre: string;
  paquete: string;
  ciudad: string;
  direccion: string;
  items: Array<{
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
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
      const stored = sessionStorage.getItem('ultimo_pedido_resumen');
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
      console.warn('No se pudo leer resumen de sessionStorage');
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
  const nombre = data?.nombreCliente ? data.nombreCliente.split(' ')[0] : '';

  return (
    <div class="space-y-6">
      {/* Saludo dinámico */}
      <div class="text-center">
        <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center text-3xl sm:text-4xl shadow-xl shadow-emerald-500/10 mb-4 animate-in zoom-in duration-300">
          ✓
        </div>
        <h1 class="font-heading text-4xl sm:text-5xl md:text-6xl text-hueso tracking-wide m-0">
          ¡PEDIDO RECIBIDO{nombre ? `, ${nombre.toUpperCase()}` : ''}!
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

      {/* Resumen del pedido si está disponible */}
      {data && (
        <div class="bg-sombra/90 border border-white/10 rounded-2xl p-5 sm:p-7 space-y-4">
          <h3 class="font-heading text-xl text-hueso tracking-wide m-0 border-b border-white/10 pb-3">
            Detalles de tu Solicitud
          </h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between text-ceniza">
              <span>Producto:</span>
              <span class="text-hueso font-medium">{data.productoNombre}</span>
            </div>
            <div class="flex justify-between text-ceniza">
              <span>Paquete:</span>
              <span class="text-calabaza font-semibold">{data.paquete}</span>
            </div>
            <div class="flex justify-between text-ceniza">
              <span>Destino:</span>
              <span class="text-hueso font-medium">{data.ciudad}</span>
            </div>
            <div class="flex justify-between text-ceniza">
              <span>Dirección:</span>
              <span class="text-hueso font-medium text-right max-w-[220px] sm:max-w-xs truncate">
                {data.direccion}
              </span>
            </div>
            <div class="flex justify-between text-base pt-3 border-t border-white/10 font-bold">
              <span class="text-hueso">Total a pagar al recibir:</span>
              <span class="text-calabaza font-heading text-2xl tabular-nums">
                {formatCOP(data.total)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
