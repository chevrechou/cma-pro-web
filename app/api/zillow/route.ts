import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const HOST = 'us-real-estate.p.rapidapi.com';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apiKey = user.user_metadata?.rapidapi_key;
  if (!apiKey) {
    return NextResponse.json({ error: 'No RapidAPI key configured. Add it in Settings.' }, { status: 422 });
  }

  const body = await request.json();
  const { zip, beds, baths, sqft, maxResults = 15 } = body;

  const url = new URL(`https://${HOST}/v2/sold-homes-by-zipcode`);
  url.searchParams.set('zipcode', zip);
  url.searchParams.set('offset', '0');
  url.searchParams.set('sort', 'sold_date');

  try {
    const res = await fetch(url.toString(), {
      headers: { 'x-rapidapi-host': HOST, 'x-rapidapi-key': apiKey },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    const results: any[] = (data?.data?.results ?? []).slice(0, maxResults * 3);

    const comps = results
      .filter((p: any) => {
        const d = p.description ?? {};
        if (!d.sold_price || d.sold_price < 10000) return false;
        const b = d.beds ?? 0;
        const s = d.sqft ?? 0;
        if (b && Math.abs(b - beds) > 2) return false;
        if (s && (s < sqft * 0.6 || s > sqft * 1.6)) return false;
        return true;
      })
      .slice(0, maxResults)
      .map((p: any) => {
        const d = p.description ?? {};
        const loc = p.location?.address ?? {};
        const salePrice = d.sold_price ?? 0;
        const sqftVal = d.sqft ?? 1;
        return {
          id: p.permalink ?? `${(loc.line ?? '').replace(/\s+/g, '-').toLowerCase()}-${zip}`,
          address: loc.line ?? '',
          city: loc.city ?? '',
          state: loc.state_code ?? '',
          zip: zip,
          beds: d.beds ?? beds,
          baths: d.baths ?? baths,
          sqft: sqftVal,
          lot_sqft: d.lot_sqft,
          year_built: d.year_built,
          sale_price: salePrice,
          list_price: d.list_price ?? salePrice,
          sale_date: d.sold_date ?? new Date().toISOString().split('T')[0],
          days_on_market: d.days_on_market ?? 0,
          status: 'sold',
          price_per_sqft: sqftVal > 0 ? Math.round(salePrice / sqftVal) : 0,
          distance_miles: undefined,
          included: true,
          source: 'us-real-estate',
        };
      });

    return NextResponse.json({ comps });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
