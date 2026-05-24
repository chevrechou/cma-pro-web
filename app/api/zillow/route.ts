import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const RAPIDAPI_HOST = 'zillow-com1.p.rapidapi.com';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apiKey = user.user_metadata?.rapidapi_key;
  if (!apiKey) {
    return NextResponse.json({ error: 'No RapidAPI key configured. Add it in Settings.' }, { status: 422 });
  }

  const body = await request.json();
  const { zip, beds, baths, sqft, maxResults = 10 } = body;

  const url = new URL(`https://${RAPIDAPI_HOST}/propertyExtendedSearch`);
  url.searchParams.set('location', zip);
  url.searchParams.set('status_type', 'RecentlySold');
  url.searchParams.set('home_type', 'Houses');
  url.searchParams.set('bedsMin', String(Math.max(1, beds - 1)));
  url.searchParams.set('bedsMax', String(beds + 1));
  url.searchParams.set('bathsMin', String(Math.max(1, baths - 1)));
  url.searchParams.set('sqftMin', String(Math.round(sqft * 0.8)));
  url.searchParams.set('sqftMax', String(Math.round(sqft * 1.2)));

  try {
    const res = await fetch(url.toString(), {
      headers: { 'x-rapidapi-host': RAPIDAPI_HOST, 'x-rapidapi-key': apiKey },
    });
    if (!res.ok) throw new Error(`Zillow API error: ${res.status}`);
    const data = await res.json();
    const props = (data.props ?? []).slice(0, maxResults);

    const comps = props.map((p: any) => {
      const salePrice = p.price ?? p.soldPrice ?? 0;
      const sqftVal = p.livingArea ?? 1;
      return {
        id: p.zpid ?? `${(p.address ?? '').replace(/\s+/g, '-').toLowerCase()}-${p.zipcode ?? zip}`,
        address: p.address ?? '',
        city: p.city ?? '',
        state: p.state ?? '',
        zip: p.zipcode ?? zip,
        beds: p.bedrooms ?? beds,
        baths: p.bathrooms ?? baths,
        sqft: sqftVal,
        lot_sqft: p.lotAreaValue ? Math.round(p.lotAreaValue * 43560) : undefined,
        year_built: p.yearBuilt,
        sale_price: salePrice,
        list_price: p.listingPrice,
        sale_date: p.soldDate ?? new Date().toISOString().split('T')[0],
        days_on_market: p.daysOnMarket ?? 0,
        status: 'sold',
        price_per_sqft: sqftVal > 0 ? Math.round(salePrice / sqftVal) : 0,
        distance_miles: p.distance,
        included: true,
        source: 'zillow',
        zpid: p.zpid,
      };
    });

    return NextResponse.json({ comps });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
