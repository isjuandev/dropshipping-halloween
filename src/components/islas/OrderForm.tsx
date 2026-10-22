import { useState, useEffect, useRef } from 'preact/hooks';
import { currentPack, selectedPackId, unitVariants, selectPack } from '../../lib/store';
import {
  clienteFormSchema,
  formatCelularInput,
  cleanCelularDigits,
  toInternationalPhone,
  generatePedidoId,
  formatCOP,
  type PedidoPayload,
  type PedidoResponse,
} from '../../lib/pedido-schema';
import { trackBeginCheckout } from '../../lib/tracking';
import { tiendaConfig } from '../../config/tienda';

interface DepartamentoItem {
  departamento: string;
  municipios: Array<{ nombre: string; codigoDane: string }>;
}

const DEPARTAMENTOS_LIST = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá D.C.', 'Bolívar',
  'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó',
  'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira',
  'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío',
  'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima',
  'Valle del Cauca', 'Vaupés', 'Vichada'
];

export default function OrderForm() {
  const pack = currentPack.value;
  const units = unitVariants.value;

  // Estados de los campos
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [celular, setCelular] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [codigoDane, setCodigoDane] = useState('');
  const [direccion, setDireccion] = useState('');
  const [indicaciones, setIndicaciones] = useState('');
  const [consentimiento, setConsentimiento] = useState(false);
  const [empresaHoneypot, setEmpresaHoneypot] = useState('');

  // Estados de interfaz y validación
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Combobox de ciudad
  const [colombiaData, setColombiaData] = useState<DepartamentoItem[] | null>(null);
  const [ciudadSearch, setCiudadSearch] = useState('');
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);

  // Tiempos e Id de pedido
  const loadTimeRef = useRef<number>(Date.now());
  const pedidoIdRef = useRef<string>('');
  const hasTriggeredCheckoutRef = useRef<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Cargar borrador de localStorage y generar pedidoId
  useEffect(() => {
    loadTimeRef.current = Date.now();
    pedidoIdRef.current = generatePedidoId();

    try {
      const draft = localStorage.getItem('draft_pedido_contraentrega');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.nombreCompleto) setNombreCompleto(parsed.nombreCompleto);
        if (parsed.celular) setCelular(parsed.celular);
        if (parsed.departamento) setDepartamento(parsed.departamento);
        if (parsed.ciudad) {
          setCiudad(parsed.ciudad);
          setCiudadSearch(parsed.ciudad);
        }
        if (parsed.codigoDane) setCodigoDane(parsed.codigoDane);
        if (parsed.direccion) setDireccion(parsed.direccion);
        if (parsed.indicaciones) setIndicaciones(parsed.indicaciones);
      }
    } catch (e) {
      // Ignorar fallos de localStorage en modo incógnito estricto
    }
  }, []);

  // Cargar datos de Colombia dinámicamente bajo demanda
  const loadColombiaData = async () => {
    if (colombiaData) return colombiaData;
    try {
      const mod = await import('../../data/colombia.json');
      const data = mod.default as DepartamentoItem[];
      setColombiaData(data);
      return data;
    } catch (err) {
      console.error('Error cargando municipios:', err);
      return null;
    }
  };

  // Guardar borrador en localStorage
  useEffect(() => {
    try {
      const draft = {
        nombreCompleto,
        celular,
        departamento,
        ciudad,
        codigoDane,
        direccion,
        indicaciones,
      };
      localStorage.setItem('draft_pedido_contraentrega', JSON.stringify(draft));
    } catch (e) {}
  }, [nombreCompleto, celular, departamento, ciudad, codigoDane, direccion, indicaciones]);

  // Si cambia el departamento, reiniciar ciudad o cargar sus municipios
  const handleDepartamentoChange = async (newDept: string) => {
    setDepartamento(newDept);
    setCiudad('');
    setCiudadSearch('');
    setCodigoDane('');
    validateField('departamento', newDept);

    const data = await loadColombiaData();
    if (data && newDept === 'Bogotá D.C.') {
      setCiudad('Bogotá D.C.');
      setCiudadSearch('Bogotá D.C.');
      setCodigoDane('11001');
      validateField('ciudad', 'Bogotá D.C.');
    }
  };

  // Obtener municipios del departamento seleccionado
  const currentMunicipios =
    colombiaData?.find((d) => d.departamento === departamento)?.municipios || [];

  const filteredMunicipios = currentMunicipios.filter((m) =>
    m.nombre.toLowerCase().includes(ciudadSearch.toLowerCase().trim())
  );

  // Validación de campo individual
  const validateField = (field: string, value: any) => {
    const dataToValidate = {
      nombreCompleto,
      celular,
      departamento,
      ciudad,
      codigoDane: codigoDane || '00000',
      direccion,
      indicaciones,
      consentimiento,
      [field]: value,
    };

    const result = clienteFormSchema.safeParse(dataToValidate);
    if (result.success) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    } else {
      const issue = result.error.issues.find((i) => i.path[0] === field);
      if (issue) {
        setErrors((prev) => ({ ...prev, [field]: issue.message }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    }
  };

  const handleBlur = (field: string, value: any) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const handleFocusField = () => {
    if (!hasTriggeredCheckoutRef.current) {
      hasTriggeredCheckoutRef.current = true;
      trackBeginCheckout({
        pack: pack.nombre,
        valor: pack.precio,
      });
    }
  };

  // Manejo del envío
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setSubmitError(null);

    const formData = {
      nombreCompleto,
      celular,
      departamento,
      ciudad,
      codigoDane: codigoDane || '00000',
      direccion,
      indicaciones,
      consentimiento,
    };

    const validation = clienteFormSchema.safeParse(formData);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      let firstErrorField = '';

      for (const issue of validation.error.issues) {
        const fieldName = String(issue.path[0]);
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
        if (!firstErrorField) {
          firstErrorField = fieldName;
        }
      }

      setErrors(fieldErrors);
      setTouched({
        nombreCompleto: true,
        celular: true,
        departamento: true,
        ciudad: true,
        direccion: true,
        consentimiento: true,
      });

      // Foco en el primer campo inválido
      if (firstErrorField && formRef.current) {
        const el = formRef.current.querySelector<HTMLElement>(`[name="${firstErrorField}"]`);
        if (el) {
          el.focus();
        }
      }
      return;
    }

    // Calcular segundos de llenado (mínimo 5 para evitar falsos positivos de spam con autofill)
    const segundos = Math.max(5, Math.round((Date.now() - loadTimeRef.current) / 1000));

    // Obtener UTMs de sessionStorage si existen
    let utms: Record<string, string> = {};
    try {
      const savedUtms = sessionStorage.getItem('tienda_utm_data');
      if (savedUtms) utms = JSON.parse(savedUtms);
    } catch (_) {}

    // Resumen de variantes para el payload
    const varianteDesc = units.map((u, i) => `${i + 1}) ${u.modelo} (${u.talla})`).join(', ');

    const payload: PedidoPayload = {
      pedidoId: pedidoIdRef.current,
      fecha: new Date().toISOString(),
      tienda: tiendaConfig.nombreTienda,
      landing: {
        url: window.location.href,
        plantilla: 'grito',
      },
      producto: {
        nombre: 'Máscara Fantasma del Grito',
        sku: 'GRITO-HALLOWEEN-2026',
        variante: varianteDesc,
        paquete: pack.nombre,
        cantidad: pack.unidades,
        extras: pack.incluyeExtras ? ['Túnica negra larga', 'Guantes negros'] : [],
        precioUnitario: pack.precioPorMascara,
        total: pack.precio,
      },
      cliente: {
        nombreCompleto: nombreCompleto.trim(),
        celular: toInternationalPhone(celular),
        departamento: departamento.trim(),
        ciudad: ciudad.trim(),
        codigoDane: codigoDane || '00000',
        direccion: direccion.trim(),
        indicaciones: indicaciones.trim(),
      },
      consentimiento: true,
      origen: {
        utm_source: utms.utm_source || '',
        utm_medium: utms.utm_medium || '',
        utm_campaign: utms.utm_campaign || '',
        utm_content: utms.utm_content || '',
        fbclid: utms.fbclid || '',
        referrer: document.referrer || '',
      },
      antispam: {
        empresa: empresaHoneypot,
        segundos,
      },
    };

    setIsSubmitting(true);

    try {
      const targetEndpoint =
        tiendaConfig.pedido.modo === 'directo'
          ? tiendaConfig.pedido.endpoint
          : '/api/pedido';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(targetEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data: PedidoResponse = await res.json().catch(() => ({ ok: false }));

      if (res.ok && data.ok) {
        // Limpiar borrador de localStorage y guardar resumen completo para la página /gracias
        try {
          localStorage.removeItem('draft_pedido_contraentrega');
          sessionStorage.setItem(
            'ultimo_pedido_resumen',
            JSON.stringify({
              pedidoId: payload.pedidoId,
              fecha: payload.fecha,
              nombreCliente: payload.cliente.nombreCompleto,
              total: payload.producto.total,
              productoNombre: payload.producto.nombre,
              paquete: payload.producto.paquete,
              ciudad: payload.cliente.ciudad,
              direccion: payload.cliente.direccion,
              cliente: {
                nombreCompleto: payload.cliente.nombreCompleto,
                celular: payload.cliente.celular,
                departamento: payload.cliente.departamento,
                ciudad: payload.cliente.ciudad,
                direccion: payload.cliente.direccion,
                indicaciones: payload.cliente.indicaciones,
              },
              producto: {
                nombre: payload.producto.nombre,
                variante: payload.producto.variante,
                paquete: payload.producto.paquete,
                cantidad: payload.producto.cantidad,
                extras: payload.producto.extras,
                total: payload.producto.total,
              },
              items: [
                {
                  nombre: `${payload.producto.nombre} - ${payload.producto.paquete}`,
                  cantidad: payload.producto.cantidad,
                  precio: payload.producto.total,
                },
              ],
            })
          );
        } catch (_) {}

        // Redirección limpia a /gracias
        window.location.href = `/gracias?id=${encodeURIComponent(payload.pedidoId)}`;
      } else {
        throw new Error(data.error || 'error_servidor');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(
        'No pudimos enviar tu pedido. Revisa tu conexión e inténtalo de nuevo.'
      );
    }
  };

  return (
    <section id="pedido" class="py-14 md:py-24 bg-noche relative overflow-hidden">
      {/* Fondo sutil */}
      <div class="absolute inset-0 bg-radial from-calabaza/10 via-transparent to-transparent opacity-40 pointer-events-none" />

      <div class="max-w-3xl mx-auto px-4 relative z-10">
        
        {/* Cabecera de la sección */}
        <div class="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <span class="text-xs uppercase tracking-widest text-calabaza font-bold px-3 py-1 rounded-full bg-calabaza/15 border border-calabaza/30 inline-block mb-3">
            PEDIDO CONTRAENTREGA
          </span>
          <h2 class="font-heading text-4xl sm:text-5xl md:text-6xl text-hueso tracking-wide m-0">
            DÉJANOS TUS DATOS Y TE CONTACTAMOS
          </h2>
          <p class="text-ceniza text-sm sm:text-base mt-3 m-0 leading-relaxed">
            Confirmamos el pedido contigo por WhatsApp antes de despachar. Pagas en efectivo cuando el transportador te entregue.
          </p>
        </div>

        {/* Tarjeta de Formulario: fondo hueso, texto noche */}
        <div class="bg-hueso text-noche rounded-[14px] p-6 sm:p-9 shadow-2xl border border-white/20">
          
          {/* Resumen del pedido en vivo */}
          <div class="mb-8 rounded-xl border-2 border-calabaza/40 bg-white p-4 sm:p-5 shadow-sm">
            <div class="flex items-start justify-between gap-4 pb-3 border-b border-black/10">
              <div>
                <span class="text-[11px] font-bold uppercase tracking-wider text-calabaza block">
                  Resumen de tu pedido
                </span>
                <h4 class="font-heading text-2xl text-noche m-0 leading-tight">
                  Máscara Fantasma del Grito · Pack {pack.nombre}
                </h4>
                <div class="text-xs text-noche/70 mt-1">
                  <strong>Variante(s):</strong>{' '}
                  {units.map((u, i) => `${i + 1}) ${u.modelo} (${u.talla})`).join(' · ')}
                </div>
              </div>
              <a
                href="#seccion-packs"
                class="text-xs font-bold text-calabaza hover:underline flex-shrink-0 pt-1"
              >
                Cambiar paquete
              </a>
            </div>

            <div class="flex items-center justify-between pt-3 text-sm">
              <span class="text-noche/80">
                Cantidad: <strong>{pack.unidades} {pack.unidades === 1 ? 'unidad' : 'unidades'}</strong>
              </span>
              <div class="text-right">
                <span class="text-xs text-noche/60 block leading-none">Pagas al recibir:</span>
                <span class="font-heading text-3xl text-noche font-bold tabular-nums">
                  {formatCOP(pack.precio)}
                </span>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form ref={formRef} onSubmit={handleSubmit} noValidate class="space-y-5">
            
            {/* Campo Honeypot Oculto */}
            <div style={{ display: 'none' }} aria-hidden="true">
              <label for="campo-empresa">Empresa</label>
              <input
                id="campo-empresa"
                type="text"
                name="empresa"
                tabIndex={-1}
                autoComplete="off"
                value={empresaHoneypot}
                onInput={(e) => setEmpresaHoneypot((e.target as HTMLInputElement).value)}
              />
            </div>

            <fieldset class="space-y-4 border-none p-0 m-0">
              <legend class="sr-only">Datos del destinatario y entrega</legend>

              {/* 1. NOMBRE Y APELLIDO */}
              <div>
                <label
                  for="form-nombre"
                  class="block text-[11px] font-bold uppercase tracking-wider text-noche/80 mb-1.5"
                >
                  NOMBRE Y APELLIDO <span class="text-rose-600">*</span>
                </label>
                <input
                  id="form-nombre"
                  name="nombreCompleto"
                  type="text"
                  autoComplete="name"
                  placeholder="Ej. Ana Restrepo"
                  required
                  value={nombreCompleto}
                  onFocus={handleFocusField}
                  onInput={(e) => {
                    const val = (e.target as HTMLInputElement).value;
                    setNombreCompleto(val);
                    if (touched.nombreCompleto) validateField('nombreCompleto', val);
                  }}
                  onBlur={(e) => handleBlur('nombreCompleto', (e.target as HTMLInputElement).value)}
                  aria-invalid={!!errors.nombreCompleto}
                  aria-describedby={errors.nombreCompleto ? 'error-nombre' : undefined}
                  class={`w-full h-12 px-4 rounded-xl border bg-white text-noche text-base font-medium placeholder:text-noche/40 focus:outline-none focus:ring-2 transition-all ${
                    errors.nombreCompleto && touched.nombreCompleto
                      ? 'border-rose-500 focus:ring-rose-400'
                      : 'border-black/20 focus:border-calabaza focus:ring-calabaza/30'
                  }`}
                />
                {errors.nombreCompleto && touched.nombreCompleto && (
                  <p id="error-nombre" class="text-xs text-rose-600 font-semibold mt-1">
                    {errors.nombreCompleto}
                  </p>
                )}
              </div>

              {/* Fila: 2. CELULAR + 3. DEPARTAMENTO */}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 2. CELULAR (WHATSAPP) */}
                <div>
                  <label
                    for="form-celular"
                    class="block text-[11px] font-bold uppercase tracking-wider text-noche/80 mb-1.5"
                  >
                    CELULAR (WHATSAPP) <span class="text-rose-600">*</span>
                  </label>
                  <input
                    id="form-celular"
                    name="celular"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="300 000 0000"
                    required
                    value={celular}
                    onFocus={handleFocusField}
                    onInput={(e) => {
                      const formatted = formatCelularInput((e.target as HTMLInputElement).value);
                      setCelular(formatted);
                      if (touched.celular) validateField('celular', formatted);
                    }}
                    onBlur={(e) => handleBlur('celular', (e.target as HTMLInputElement).value)}
                    aria-invalid={!!errors.celular}
                    aria-describedby={errors.celular ? 'error-celular' : undefined}
                    class={`w-full h-12 px-4 rounded-xl border bg-white text-noche text-base font-medium placeholder:text-noche/40 focus:outline-none focus:ring-2 transition-all ${
                      errors.celular && touched.celular
                        ? 'border-rose-500 focus:ring-rose-400'
                        : 'border-black/20 focus:border-calabaza focus:ring-calabaza/30'
                    }`}
                  />
                  {errors.celular && touched.celular && (
                    <p id="error-celular" class="text-xs text-rose-600 font-semibold mt-1">
                      {errors.celular}
                    </p>
                  )}
                </div>

                {/* 3. DEPARTAMENTO */}
                <div>
                  <label
                    for="form-departamento"
                    class="block text-[11px] font-bold uppercase tracking-wider text-noche/80 mb-1.5"
                  >
                    DEPARTAMENTO <span class="text-rose-600">*</span>
                  </label>
                  <select
                    id="form-departamento"
                    name="departamento"
                    required
                    value={departamento}
                    onFocus={() => {
                      handleFocusField();
                      loadColombiaData();
                    }}
                    onChange={(e) => handleDepartamentoChange((e.target as HTMLSelectElement).value)}
                    onBlur={(e) => handleBlur('departamento', (e.target as HTMLSelectElement).value)}
                    aria-invalid={!!errors.departamento}
                    aria-describedby={errors.departamento ? 'error-departamento' : undefined}
                    class={`w-full h-12 px-4 rounded-xl border bg-white text-noche text-base font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 transition-all ${
                      errors.departamento && touched.departamento
                        ? 'border-rose-500 focus:ring-rose-400'
                        : 'border-black/20 focus:border-calabaza focus:ring-calabaza/30'
                    }`}
                  >
                    <option value="">Selecciona tu departamento</option>
                    {DEPARTAMENTOS_LIST.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {errors.departamento && touched.departamento && (
                    <p id="error-departamento" class="text-xs text-rose-600 font-semibold mt-1">
                      {errors.departamento}
                    </p>
                  )}
                </div>

              </div>

              {/* 4. CIUDAD O MUNICIPIO (Combobox con búsqueda) */}
              <div class="relative">
                <label
                  for="form-ciudad"
                  class="block text-[11px] font-bold uppercase tracking-wider text-noche/80 mb-1.5"
                >
                  CIUDAD O MUNICIPIO <span class="text-rose-600">*</span>
                </label>

                {!departamento ? (
                  <input
                    id="form-ciudad"
                    name="ciudad"
                    type="text"
                    disabled
                    placeholder="Selecciona un departamento primero"
                    class="w-full h-12 px-4 rounded-xl border border-black/15 bg-black/5 text-noche/50 text-base font-medium cursor-not-allowed"
                  />
                ) : (
                  <div>
                    <input
                      id="form-ciudad"
                      name="ciudad"
                      type="text"
                      autoComplete="off"
                      placeholder="Escribe para buscar (ej. Envigado)"
                      required
                      value={ciudadSearch}
                      onFocus={() => {
                        handleFocusField();
                        setIsComboboxOpen(true);
                      }}
                      onInput={(e) => {
                        const val = (e.target as HTMLInputElement).value;
                        setCiudadSearch(val);
                        setIsComboboxOpen(true);
                        // Si borra, limpiar ciudad seleccionada
                        if (!val) {
                          setCiudad('');
                          setCodigoDane('');
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          setIsComboboxOpen(false);
                          handleBlur('ciudad', ciudad);
                        }, 200);
                      }}
                      aria-invalid={!!errors.ciudad}
                      aria-describedby={errors.ciudad ? 'error-ciudad' : undefined}
                      class={`w-full h-12 px-4 rounded-xl border bg-white text-noche text-base font-medium placeholder:text-noche/40 focus:outline-none focus:ring-2 transition-all ${
                        errors.ciudad && touched.ciudad
                          ? 'border-rose-500 focus:ring-rose-400'
                          : 'border-black/20 focus:border-calabaza focus:ring-calabaza/30'
                      }`}
                    />

                    {/* Menú desplegable combobox */}
                    {isComboboxOpen && (
                      <div class="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto bg-white border border-black/20 rounded-xl shadow-2xl divide-y divide-black/5">
                        {filteredMunicipios.length === 0 ? (
                          <div class="p-3 text-xs text-noche/60 text-center">
                            No encontramos municipios con "{ciudadSearch}".
                          </div>
                        ) : (
                          filteredMunicipios.map((m) => (
                            <button
                              type="button"
                              key={m.codigoDane}
                              onMouseDown={() => {
                                setCiudad(m.nombre);
                                setCiudadSearch(m.nombre);
                                setCodigoDane(m.codigoDane);
                                validateField('ciudad', m.nombre);
                                setIsComboboxOpen(false);
                              }}
                              class="w-full text-left px-4 py-2.5 text-sm text-noche hover:bg-calabaza/15 transition-colors flex items-center justify-between"
                            >
                              <span class="font-medium">{m.nombre}</span>
                              <span class="text-[11px] text-noche/40 font-mono">DANE {m.codigoDane}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}

                {errors.ciudad && touched.ciudad && (
                  <p id="error-ciudad" class="text-xs text-rose-600 font-semibold mt-1">
                    {errors.ciudad}
                  </p>
                )}
              </div>

              {/* 5. DIRECCIÓN DE ENTREGA */}
              <div>
                <label
                  for="form-direccion"
                  class="block text-[11px] font-bold uppercase tracking-wider text-noche/80 mb-1.5"
                >
                  DIRECCIÓN DE ENTREGA <span class="text-rose-600">*</span>
                </label>
                <input
                  id="form-direccion"
                  name="direccion"
                  type="text"
                  autoComplete="street-address"
                  placeholder="Calle 45 #12-30, apto 302, barrio Laureles"
                  required
                  value={direccion}
                  onFocus={handleFocusField}
                  onInput={(e) => {
                    const val = (e.target as HTMLInputElement).value;
                    setDireccion(val);
                    if (touched.direccion) validateField('direccion', val);
                  }}
                  onBlur={(e) => handleBlur('direccion', (e.target as HTMLInputElement).value)}
                  aria-invalid={!!errors.direccion}
                  aria-describedby={errors.direccion ? 'error-direccion' : undefined}
                  class={`w-full h-12 px-4 rounded-xl border bg-white text-noche text-base font-medium placeholder:text-noche/40 focus:outline-none focus:ring-2 transition-all ${
                    errors.direccion && touched.direccion
                      ? 'border-rose-500 focus:ring-rose-400'
                      : 'border-black/20 focus:border-calabaza focus:ring-calabaza/30'
                  }`}
                />
                {errors.direccion && touched.direccion && (
                  <p id="error-direccion" class="text-xs text-rose-600 font-semibold mt-1">
                    {errors.direccion}
                  </p>
                )}
              </div>

              {/* 6. INDICACIONES ADICIONALES (OPCIONAL) */}
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label
                    for="form-indicaciones"
                    class="block text-[11px] font-bold uppercase tracking-wider text-noche/80"
                  >
                    INDICACIONES ADICIONALES (OPCIONAL)
                  </label>
                  <span class="text-[11px] text-noche/50">
                    {indicaciones.length} / 300
                  </span>
                </div>
                <textarea
                  id="form-indicaciones"
                  name="indicaciones"
                  rows={3}
                  maxLength={300}
                  placeholder="Horario preferido, punto de referencia, torre/conjunto, entrega en oficina..."
                  value={indicaciones}
                  onFocus={handleFocusField}
                  onInput={(e) => setIndicaciones((e.target as HTMLTextAreaElement).value.slice(0, 300))}
                  class="w-full p-3.5 rounded-xl border border-black/20 bg-white text-noche text-base font-medium placeholder:text-noche/40 focus:outline-none focus:border-calabaza focus:ring-2 focus:ring-calabaza/30 transition-all resize-none"
                />
              </div>

            </fieldset>

            {/* Casilla obligatoria de Consentimiento */}
            <div class="pt-2">
              <label class="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="consentimiento"
                  required
                  checked={consentimiento}
                  onChange={(e) => {
                    const checked = (e.target as HTMLInputElement).checked;
                    setConsentimiento(checked);
                    validateField('consentimiento', checked);
                  }}
                  class="mt-1 w-5 h-5 rounded border-black/30 text-calabaza focus:ring-calabaza cursor-pointer"
                />
                <span class="text-xs sm:text-sm text-noche/80 leading-snug">
                  Autorizo el tratamiento de mis datos para gestionar mi pedido, según la{' '}
                  <a
                    href="/privacidad"
                    target="_blank"
                    class="font-bold underline text-calabaza hover:text-calabaza-hover"
                  >
                    política de privacidad
                  </a>{' '}
                  (Ley 1581 de 2012).
                </span>
              </label>
              {errors.consentimiento && touched.consentimiento && (
                <p class="text-xs text-rose-600 font-semibold mt-1">
                  {errors.consentimiento}
                </p>
              )}
            </div>

            {/* Error de red / envío */}
            {submitError && (
              <div
                role="alert"
                aria-live="polite"
                class="p-4 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-sm flex flex-col sm:flex-row items-center justify-between gap-3"
              >
                <span>{submitError}</span>
                <button
                  type="submit"
                  class="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider flex-shrink-0"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Botón Principal de Envío */}
            <div class="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                class="btn-glow w-full h-14 bg-calabaza hover:bg-calabaza-hover active:bg-[#e05800] text-noche font-heading text-2xl tracking-wide uppercase rounded-xl flex items-center justify-center gap-3 transition-all min-h-[56px] px-6 text-center shadow-xl disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <div class="flex items-center gap-3">
                    <svg
                      class="animate-spin h-6 w-6 text-noche"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Enviando tu pedido…</span>
                  </div>
                ) : (
                  <span>Confirmar mi pedido contraentrega</span>
                )}
              </button>
            </div>

            {/* Texto legal debajo del botón */}
            <p class="text-center text-xs text-noche/60 leading-relaxed mt-2 m-0">
              Al enviar tus datos aceptas que te escribamos por WhatsApp o te llamemos para confirmar el pedido. No hacemos cobros automáticos ni guardamos datos de pago.
            </p>

            {/* Reductores de riesgo */}
            <div class="pt-4 border-t border-black/10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-noche/80 font-semibold">
              <div class="flex items-center gap-1.5">
                <span class="text-calabaza text-base">🤝</span>
                <span>Pago contraentrega</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="text-calabaza text-base">🚚</span>
                <span>Envío a toda Colombia</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="text-calabaza text-base">🛡️</span>
                <span>Garantía de cambio</span>
              </div>
            </div>

          </form>

        </div>

      </div>
    </section>
  );
}
