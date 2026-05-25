import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apiKey = user.user_metadata?.rentcast_key;
  if (!apiKey) {
    return NextResponse.json({ error: 'No Rentcast API key configured. Add it in Settings.' }, { status: 422 });
  }

  const body = await request.json();
  const { zip, beds, baths, sqft, maxResults = 15 } = body;

  const url = new URL('https://api.rentcast.io/v1/listings/sale');
  url.searchParams.set('zipCode', zip);
  url.searchParams.set('bedrooms', String(beds));
  url.searchParams.set('squareFootage', `${Math.round(sqft * 0.75)}-${Math.round(sqft * 1.25)}`);
  url.searchParams.set('status', 'Inactive');
  url.searchParams.set('limit', String(maxResults));

  try {
    const res = await fetch(url.toString(), {
      headers: { 'X-Api-Key': apiKey, 'accept': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? `Rentcast API error: ${res.status}`);
    }
    const props: any[] = await res.json();

    const comps = props.map((p: any) => {
      const salePrice = p.price ?? 0;
      const sqftVal = p.squareFootage ?? 1;
      return {
        id: p.id ?? `${(p.addressLine1 ?? '').replace(/\s+/g, '-').toLowerCase()}-${p.zipCode ?? zip}`,
        address: p.addressLine1 ?? p.formattedAddress ?? '',
        city: p.city ?? '',
        state: p.state ?? '',
        zip: p.zipCode ?? zip,
        beds: p.bedrooms ?? beds,
        baths: p.bathrooms ?? baths,
        sqft: sqftVal,
        lot_sqft: p.lotSize,
        year_built: p.yearBuilt,
        sale_price: salePrice,
        list_price: salePrice,
        sale_date: p.removedDate ?? p.lastSeenDate ?? new Date().toISOString().split('T')[0],
        days_on_market: p.daysOnMarket ?? 0,
        status: 'sold',
        price_per_sqft: sqftVal > 0 ? Math.round(salePrice / sqftVal) : 0,
        distance_miles: undefined,
        included: true,
        source: 'rentcast',
      };
    });

    return NextResponse.json({ comps });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
