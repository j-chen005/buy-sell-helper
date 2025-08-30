import { json } from '@sveltejs/kit';
import { RAPID_API_KEY, RAPID_API_HOST } from '../../lib/env.js';

// TypeScript interfaces
interface SearchOptions {
    country?: string;
    language?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    productCondition?: string;
    returnFilters?: boolean;
}

interface Product {
    product_title: string;
    product_description: string;
    product_photos: string[];
    prices: {
        current_price: number;
        original_price?: number;
        typical_price_range?: string;
        on_sale?: boolean;
        percent_off?: number;
    };
    offer_page_url?: string;
}

interface SearchResponse {
    status: string;
    filtered_products: Product[];
    total_results: number;
    message?: string;
}

/**
 * Search for products using RapidAPI Real-time Product Search
 */
async function searchProducts(query: string, options: SearchOptions = {}): Promise<SearchResponse> {
    const {
        country = "us",
        language = "en",
        page = 1,
        limit = 10,
        sortBy = "BEST_MATCH",
        productCondition = "ANY",
        returnFilters = true
    } = options;

    // Validate required parameters
    if (!query) {
        throw new Error('Search query is required');
    }

    if (!RAPID_API_KEY || !RAPID_API_HOST) {
        throw new Error('RapidAPI credentials are not configured. Please check your environment variables.');
    }

    // Build the URL with query parameters
    const params = new URLSearchParams({
        q: query,
        country,
        language,
        page: page.toString(),
        limit: limit.toString(),
        sort_by: sortBy,
        product_condition: productCondition,
        return_filters: returnFilters.toString()
    });

    const url = `https://real-time-product-search.p.rapidapi.com/search-v2?${params.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': RAPID_API_KEY,
                'x-rapidapi-host': RAPID_API_HOST,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "OK" && data.data && data.data.products) {
            const filteredProducts: Product[] = data.data.products.map((product: any) => {
                return {
                    product_title: product.product_title,
                    product_description: product.product_description,
                    product_photos: product.product_photos,
                    prices: {
                        current_price: product.offer?.price,
                        original_price: product.offer?.original_price,
                        typical_price_range: product.typical_price_range,
                        on_sale: product.offer?.on_sale,
                        percent_off: product.offer?.percent_off
                    },
                    offer_page_url: product.offer?.offer_page_url
                };
            });

            return {
                status: data.status,
                filtered_products: filteredProducts,
                total_results: data.data.total_results || 0
            };
        } else {
            return {
                status: 'NO_RESULTS',
                filtered_products: [],
                total_results: 0,
                message: 'No products found or invalid response format'
            };
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        throw new Error(`Failed to fetch products: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// SvelteKit API endpoint handler
export async function GET({ url }: { url: URL }) {
    try {
        const searchParams = url.searchParams;
        const query = searchParams.get('q');
        
        if (!query) {
            return json({ error: 'Search query (q) is required' }, { status: 400 });
        }

        const options: SearchOptions = {
            country: searchParams.get('country') || undefined,
            language: searchParams.get('language') || undefined,
            page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
            limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
            sortBy: searchParams.get('sortBy') || undefined,
            productCondition: searchParams.get('productCondition') || undefined,
            returnFilters: searchParams.get('returnFilters') !== 'false'
        };

        const result = await searchProducts(query, options);
        return json(result);

    } catch (error) {
        console.error('API Error:', error);
        return json(
            { error: error instanceof Error ? error.message : 'Internal server error' }, 
            { status: 500 }
        );
    }
}