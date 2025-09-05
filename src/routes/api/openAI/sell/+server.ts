import { json } from '@sveltejs/kit';
import OpenAI from 'openai';
import type { RequestEvent } from '@sveltejs/kit';
import { OPENAI_API_KEY } from '$lib/env';

const VISION_PROMPT = `Analyze the product dataset to determine the market value and recommend the best selling platforms for this type of product. Based on the product data, suggest realistic selling platforms where users can actually sell their items (NOT retail stores).

Recommend platforms like:
- Facebook Marketplace (good for local sales)
- eBay (good for auctions and wide reach)
- Mercari (good for quick sales)
- Poshmark (good for fashion items)
- Depop (good for trendy/vintage items)
- OfferUp (good for local sales)
- Vinted (good for clothing)

Provide a suggested selling price based on the market data, typically 10-30% below retail prices depending on condition.

Format your response exactly like this:

**Best Platform:** [Platform Name] - $[Suggested Price]
**Other Platforms:**
- [Platform2]: $[Price2]
- [Platform3]: $[Price3]

Make sure all three platforms are DIFFERENT from each other.

Dataset: {product_list}`;

const PROD_DESCRIPTION_PROMPT = `Given a list of attributes of a product, write a compelling product description to help the user sell the product. The product description should be similar to product descriptions in the "product_description" fields in the product listings provided here: {product_list}.
Here is the list of attributes for the product to aid your product description: {attribute_list}
Do not mention price comparisons from other websites or stores. Focus on features, benefits, and selling points.`;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function POST({ request }: RequestEvent) {
  try {
    const { productList, attributeList, type } = await request.json();

    if (!productList || !type) {
      return json({ error: 'Missing required parameters' }, { status: 400 });
    }

    let prompt: string;
    let messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

    if (type === 'vision') {
      // For selling recommendations only
      prompt = VISION_PROMPT.replace('{product_list}', JSON.stringify(productList, null, 2));
      
      messages = [
        {
          role: 'system' as const,
          content: 'You are an expert in online selling platforms and resale markets. Recommend only legitimate platforms where individuals can sell their own items (NOT retail stores like Nike, Amazon, etc.). Provide ONLY the requested format - no explanations, no analysis steps, just the recommendations.'
        },
        {
          role: 'user' as const,
          content: prompt
        }
      ];
    } else if (type === 'description') {
      // For product description generation
      if (!attributeList) {
        return json({ error: 'Attribute list is required for description generation' }, { status: 400 });
      }
      
      prompt = PROD_DESCRIPTION_PROMPT
        .replace('{product_list}', JSON.stringify(productList, null, 2))
        .replace('{attribute_list}', JSON.stringify(attributeList, null, 2));
      
      messages = [
        {
          role: 'system' as const,
          content: 'You are an expert copywriter specializing in product descriptions for e-commerce platforms.'
        },
        {
          role: 'user' as const,
          content: prompt
        }
      ];
    } else {
      return json({ error: 'Invalid type parameter. Must be "vision" or "description"' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: messages,
      temperature: 0.7,
      max_tokens: 200,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return json({ error: 'No response from OpenAI' }, { status: 500 });
    }

    return json({ 
      success: true, 
      response: response,
      type: type
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    return json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
