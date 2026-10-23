import { callDropiTool, resolveDropiCity, getCustomerRiskProfile } from './dropi-mcp.mjs';

async function testAll() {
  console.log('--- 1. PROBANDO HUELLA ---');
  const risk = await getCustomerRiskProfile('3116839099');
  console.log('Huella:', risk);

  console.log('\n--- 2. PROBANDO COTIZAR FLETES ---');
  const cityRes = await callDropiTool('search_cities', { name: 'Medellin' });
  const cityText = cityRes?.content?.[0]?.text || '';
  const lines = cityText.split('\n').filter((l) => l.trim().match(/^\d+,/));
  const [cityId, deptId, cityName, codDane, zipCode] = lines[0].split(',').map((s) => s.replace(/"/g, '').trim());

  console.log('Ciudad resuelta:', { cityId, cityName, codDane, zipCode });

  const quoteRes = await callDropiTool('quote_shipping', {
    cash_on_delivery: true,
    destination_city: {
      id: Number(cityId),
      dane_code: codDane,
      zip_code: zipCode || '050001',
    },
    products: [{ id: 2289560, type: 'SIMPLE', quantity: 1, price: 29900 }],
  });

  const quoteText = quoteRes?.content?.[0]?.text || '';
  console.log('Quote output snippet:\n', quoteText.slice(0, 400));

  console.log('\n--- 3. PROBANDO LISTAR ÓRDENES ---');
  const listRes = await callDropiTool('list_orders', { start: 0, result_number: 5 });
  console.log('List orders snippet:\n', listRes?.content?.[0]?.text || listRes);
}

testAll().catch(console.error);
