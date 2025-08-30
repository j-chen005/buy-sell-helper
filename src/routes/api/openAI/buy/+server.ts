import { json } from '@sveltejs/kit';
import OpenAI from 'openai';
import type { RequestEvent } from '@sveltejs/kit';
import { OPENAI_API_KEY } from '$lib/env.js';

const BUY_PROMPT = `Given the dataset below, containing detailed product listings from various online stores, your task is to analyze the information and recommend the BEST product to buy based on value, price, and quality.

Analyze the products and select ONE product that offers the best overall value. Focus mostly on the price. The cheaper option is usually better, as long as the price is realistic for that product. Consider:
- Price competitiveness
- Product quality and features
- Store reliability
- Overall value proposition

Return your response in the following JSON format ONLY (no other text):
{
  "recommendedProductIndex": <index_of_the_recommended_product_in_the_array>,
  "rationale": "<detailed_explanation_of_why_this_product_was_chosen_as_the_best_option>"
}

The rationale should explain why this specific product is the best choice, considering price, quality, features, and overall value.

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
        content: 'You are an expert e-commerce analyst specializing in finding the best deals and highest value products. Always respond with valid JSON format only.'
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

    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', response);
      return json({ error: 'Invalid AI response format' }, { status: 500 });
    }

    // Validate the response structure
    if (!parsedResponse.recommendedProductIndex || !parsedResponse.rationale) {
      return json({ error: 'Invalid AI response structure' }, { status: 500 });
    }

    // Get the recommended product
    const recommendedProduct = productList[parsedResponse.recommendedProductIndex];
    if (!recommendedProduct) {
      return json({ error: 'Recommended product index out of range' }, { status: 500 });
    }

    return json({ 
      success: true, 
      recommendedProduct: recommendedProduct,
      rationale: parsedResponse.rationale,
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
