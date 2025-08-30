import { json } from '@sveltejs/kit';
import OpenAI from 'openai';
import type { RequestEvent } from '@sveltejs/kit';
import { OPENAI_API_KEY } from '$lib/env.js';

const BUY_PROMPT = `Given the dataset below, containing detailed product listings from various online stores, your task is to analyze the information to recommend the cheapest website I can buy the product at. The dataset includes information on product titles, descriptions, photos, attributes (like surface, material, size), product and offer URLs, store names, prices, and typical price ranges. Consider these details to:

Calculate the average buying price of similar products across all the listed stores.
Identify the store that offers the lowest buying price for the product, considering both the prices and product attributes. 
Provide a link to each of these product suggestions. EACH URL SHOULD BE A DIFFERENT LINK FOR THAT SPECIFIC PRODUCT, which is in the "offer_url" for that product in the list of products. The URL should have the store or website name in it. DO NOT PROVIDE A GOOGLE SHOPPING LINK.

Do not provid a rationale for your suggestions. Do not provide suggestions from the same website. Only choose websites that have prices in a realistic price range for that product. For example, do not choose a website that is selling a car for 20 dollars.
Present your analysis in the following format:

-- Suggested Website for Buying: Website Name - <a href="OFFER_PAGE_URL_lowest_price">Suggested Buying Price</a>
-- Average Buying Prices at Other Stores: store1 - <a href="OFFER_PAGE_URL_for_store1">average_price1</a>, store2 - <a href="OFFER_PAGE_URL_for_store2">average_price2</a>

Here's the dataset for analysis: {product_list}`;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function POST({ request }: RequestEvent) {
  try {
    const { productList } = await request.json();

    if (!productList) {
      return json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const prompt = BUY_PROMPT.replace('{product_list}', JSON.stringify(productList, null, 2));
    
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system' as const,
        content: 'You are an expert e-commerce analyst specializing in finding the best deals and lowest prices for products across different online stores.'
      },
      {
        role: 'user' as const,
        content: prompt
      }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return json({ error: 'No response from OpenAI' }, { status: 500 });
    }

    return json({ 
      success: true, 
      response: response,
      type: 'buy'
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    return json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
