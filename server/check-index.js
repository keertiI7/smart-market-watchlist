const { NseIndia } = require('stock-nse-india');
const nseIndia = new NseIndia();

nseIndia.getEquityStockIndices('NIFTY 50').then(d => {
  console.log('--- metadata ---');
  console.log(d.metadata);
});