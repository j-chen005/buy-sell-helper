import { json } from '@sveltejs/kit';
import OpenAI from 'openai';
import type { RequestEvent } from '@sveltejs/kit';
import { OPENAI_API_KEY } from '$lib/env';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function POST({ request }: RequestEvent) {
  try {
    const { imageData } = await request.json();

    if (!imageData) {
      return json({ error: 'Image data is required' }, { status: 400 });
    }

    // Ensure the image data has the proper data URL format
    if (!imageData.startsWith('data:image/')) {
      return json({ error: 'Invalid image format. Please provide a base64 data URL.' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe this image in exactly 10 words or less. Focus on the main product or item visible. Use simple, searchable keywords that would help find similar products online. Do not use articles (a, an, the) unless absolutely necessary.'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageData,
                detail: 'low'
              }
            }
          ]
        }
      ],
      max_tokens: 20,
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return json({ error: 'No response from OpenAI' }, { status: 500 });
    }

    // Clean up the response to ensure it's 5 words or less
    const words = response.trim().split(/\s+/).slice(0, 5);
    const description = words.join(' ');

    return json({ 
      success: true, 
      description: description
    });

  } catch (error) {
    console.error('OpenAI Vision API Error:', error);
    return json({ 
      error: 'Failed to analyze image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
