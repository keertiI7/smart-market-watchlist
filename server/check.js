const { NseIndia } = require('stock-nse-india');
const nseIndia = new NseIndia();

nseIndia.getEquityDetails('RELIANCE').then(d => {
  console.log('--- securityWiseDP ---');
  console.log(d.securityWiseDP);
  console.log('--- preOpenMarket ---');
  console.log(d.preOpenMarket);
});