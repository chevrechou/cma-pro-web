import { Comparable, MarketStats, SubjectProperty } from '../types';

export function calcPricePerSqft(comps: Comparable[]): number {
  const included = comps.filter((c) => c.included && c.sqft > 0);
  if (included.length === 0) return 0;
  const total = included.reduce((sum, c) => sum + c.price_per_sqft, 0);
  return Math.round(total / included.length);
}

export function calcAdjustedPrice(comp: Comparable): number {
  return comp.sale_price + (comp.adjustment ?? 0);
}

export function calcMarketStats(comps: Comparable[]): MarketStats {
  const included = comps.filter((c) => c.included);
  if (included.length === 0) {
    return {
      avg_sale_price: 0,
      median_sale_price: 0,
      avg_price_per_sqft: 0,
      avg_days_on_market: 0,
      avg_list_to_sale_ratio: 0,
    };
  }

  const prices = included.map((c) => calcAdjustedPrice(c)).sort((a, b) => a - b);
  const avg = prices.reduce((s, p) => s + p, 0) / prices.length;
  const mid = Math.floor(prices.length / 2);
  const median =
    prices.length % 2 === 0 ? (prices[mid - 1] + prices[mid]) / 2 : prices[mid];

  const ppsqs = included.map((c) => c.price_per_sqft).filter((v) => v > 0);
  const avgPpsq = ppsqs.length > 0 ? ppsqs.reduce((s, v) => s + v, 0) / ppsqs.length : 0;

  const doms = included.map((c) => c.days_on_market).filter((v) => v >= 0);
  const avgDom = doms.length > 0 ? doms.reduce((s, v) => s + v, 0) / doms.length : 0;

  const ratios = included
    .filter((c) => c.list_price && c.list_price > 0)
    .map((c) => calcAdjustedPrice(c) / c.list_price!);
  const avgRatio = ratios.length > 0 ? ratios.reduce((s, v) => s + v, 0) / ratios.length : 1;

  return {
    avg_sale_price: Math.round(avg),
    median_sale_price: Math.round(median),
    avg_price_per_sqft: Math.round(avgPpsq),
    avg_days_on_market: Math.round(avgDom),
    avg_list_to_sale_ratio: Math.round(avgRatio * 100) / 100,
  };
}

export function calcSuggestedRange(
  subject: SubjectProperty,
  comps: Comparable[]
): { low: number; high: number; suggested: number } {
  const included = comps.filter((c) => c.included);
  if (included.length === 0) return { low: 0, high: 0, suggested: 0 };

  const stats = calcMarketStats(included);
  const basePpSqft = stats.avg_price_per_sqft;
  const basePrice = basePpSqft * subject.sqft;

  const conditionMultiplier: Record<string, number> = {
    excellent: 1.05,
    good: 1.02,
    average: 1.0,
    fair: 0.96,
    poor: 0.9,
  };
  const mult = conditionMultiplier[subject.condition] ?? 1;
  const suggested = Math.round((basePrice * mult) / 1000) * 1000;

  return {
    low: Math.round((suggested * 0.97) / 1000) * 1000,
    high: Math.round((suggested * 1.03) / 1000) * 1000,
    suggested,
  };
}

const _currencyFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
export function formatCurrency(n: number): string {
  return _currencyFmt.format(n);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
