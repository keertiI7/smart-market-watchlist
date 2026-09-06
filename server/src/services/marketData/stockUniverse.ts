export interface SeedStock {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  basePrice: number;
  baseVolume: number;
}

// A small, realistic universe of NSE-listed names. This is the "database" the
// mock provider simulates against - swap MARKET_DATA_PROVIDER=real and a real
// vendor's symbol list takes over instead.
export const STOCK_UNIVERSE: SeedStock[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', exchange: 'NSE', sector: 'Energy', basePrice: 1245.5, baseVolume: 4_200_000 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE', sector: 'IT', basePrice: 3842.5, baseVolume: 1_400_000 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', exchange: 'NSE', sector: 'Banking', basePrice: 1762.0, baseVolume: 3_100_000 },
  { symbol: 'INFY', name: 'Infosys', exchange: 'NSE', sector: 'IT', basePrice: 1810.2, baseVolume: 2_600_000 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', exchange: 'NSE', sector: 'Banking', basePrice: 1204.8, baseVolume: 2_900_000 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', exchange: 'NSE', sector: 'FMCG', basePrice: 2456.3, baseVolume: 800_000 },
  { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', sector: 'Banking', basePrice: 832.4, baseVolume: 5_400_000 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', exchange: 'NSE', sector: 'Telecom', basePrice: 1598.9, baseVolume: 2_100_000 },
  { symbol: 'ITC', name: 'ITC Limited', exchange: 'NSE', sector: 'FMCG', basePrice: 468.7, baseVolume: 6_700_000 },
  { symbol: 'LT', name: 'Larsen & Toubro', exchange: 'NSE', sector: 'Infrastructure', basePrice: 3567.1, baseVolume: 1_100_000 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India', exchange: 'NSE', sector: 'Automobile', basePrice: 12480.0, baseVolume: 380_000 },
  { symbol: 'WIPRO', name: 'Wipro', exchange: 'NSE', sector: 'IT', basePrice: 524.6, baseVolume: 3_300_000 },
];
