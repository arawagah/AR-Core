/**
 * Future: Connect to Loom App marketplace API
 *
 * Integration point for the Loom App marketplace:
 * - Fetch real outfit catalog from Loom API
 * - Outfit assets will be hosted on Loom CDN
 * - User sessions will be authenticated via Loom OAuth
 * - "Buy Now" button on AR view will deep-link to Loom App product page
 *
 * To implement:
 * 1. Replace GET /api/outfits with Loom catalog API calls
 * 2. Map Loom product fields to the Outfit type
 * 3. Implement OAuth flow with Loom (PKCE recommended for mobile)
 * 4. Add "Buy Now" button in OutfitRenderer that triggers deep link:
 *    loom://product/{productId}
 * 5. Handle CDN-hosted assets (update asset loading in useOutfitOverlay.ts)
 */

export interface LoomProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  imageUrl: string;
  arAssetUrl: string;
  deepLinkUrl: string;
  category: string;
}

// Stub: replace with actual Loom API call
export async function fetchLoomCatalog(): Promise<LoomProduct[]> {
  // const response = await fetch('https://api.loom.app/v1/catalog', {
  //   headers: {
  //     Authorization: `Bearer ${process.env.LOOM_API_TOKEN}`,
  //   },
  // });
  // return response.json();
  return [];
}

// Stub: navigate to product in Loom App
export function openInLoomApp(productId: string): void {
  // window.location.href = `loom://product/${productId}`;
  console.log('Loom integration not yet configured. Product ID:', productId);
}
