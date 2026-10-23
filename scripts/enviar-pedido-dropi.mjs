#!/usr/bin/env node
/**
 * CLI para enviar un pedido a Dropi mediante MCP
 * Uso:
 *   node scripts/enviar-pedido-dropi.mjs --id "PED-20261022-RUFW" --nombre "Juan" --apellido "Garcia" --tel "3116839099" --depto "Quindío" --ciudad "Armenia" --dir "Calle 32 #24-43" --total 29900 --cantidad 1
 */

import { createDropiOrder, getCustomerRiskProfile } from './dropi-mcp.mjs';

function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      params[key] = args[i + 1] || '';
      i++;
    }
  }
  return params;
}

async function main() {
  const args = parseArgs();

  if (!args.id || !args.tel || !args.dir || !args.ciudad) {
    console.error('Uso requerido: --id <orderId> --nombre <nombre> --apellido <apellido> --tel <celular> --depto <depto> --ciudad <ciudad> --dir <direccion> --total <precioTotal> [--cantidad 1] [--productoId 2289560]');
    process.exit(1);
  }

  const orderData = {
    orderId: args.id,
    customer: {
      primerNombre: args.nombre || 'Cliente',
      apellidos: args.apellido || '',
      celular: args.tel,
      departamento: args.depto || 'Cundinamarca',
      ciudad: args.ciudad,
      direccion: args.dir,
      indicaciones: args.notas || '',
    },
    productPrice: Number(args.total) || 29900,
    quantity: Number(args.cantidad) || 1,
    productId: Number(args.productoId) || 2289560,
    notes: args.notas || `Pedido ${args.id}`,
  };

  console.log('--- ENVIANDO ORDEN A DROPI ---');
  console.log(`Pedido ID: ${orderData.orderId}`);
  console.log(`Cliente: ${orderData.customer.primerNombre} ${orderData.customer.apellidos} (${orderData.customer.celular})`);
  console.log(`Destino: ${orderData.customer.ciudad}, ${orderData.customer.departamento} - ${orderData.customer.direccion}`);
  console.log(`Producto ID: ${orderData.productId} x ${orderData.quantity} un. = $${orderData.productPrice} COP (CON RECAUDO)`);

  // 1. Consultar huella digital del comprador
  console.log('\n🔍 Consultando historial del comprador en Dropi...');
  const risk = await getCustomerRiskProfile(orderData.customer.celular);
  if (risk) {
    console.log(`   Confiabilidad: ${risk.risk_label} | Tipo: ${risk.buyer_type} | Entrega: ${risk.delivery_probability}%`);
  }

  // 2. Crear la orden
  console.log('\n🚀 Registrando orden en Dropi...');
  const result = await createDropiOrder(orderData);
  console.log('\n✅ RESULTADO DROPI:');
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error('\n❌ ERROR CREANDO ORDEN EN DROPI:', err.message);
  process.exit(1);
});
