import { json } from "@sveltejs/kit";
import OpenAI from "openai";
import { O as OPENAI_API_KEY } from "../../../../../chunks/env.js";
const VISION_PROMPT = `Given the dataset below, containing detailed product listings from various online stores, your task is to analyze the information to recommend the most profitable website for me to sell a similar product. The dataset includes information on product titles, descriptions, photos, attributes (like surface, material, size), product and offer URLs, store names, prices, and typical price ranges. Consider these details to:

Calculate the average selling price of similar products across all the listed stores.
Identify the store that offers the highest potential selling price for a product similar to mine, considering both the prices and product attributes. These websites should be retail websites for indivudal users to sell their items, such as Ebay, Etsy, Amazon, Rakuten, Alibaba, Walmart Marketplace, Craigslist, Wayfair. Big stores such as Target, Nordstrom, or Saks Fifth Avenue, where individuals can't sell their own products, should not be included.
DO NOT PROVIDE A RATIONALE FOR YOUR RECOMMENDATION
The "Suggested Website for Selling" should be the highest selling price out of all the suggestions.
Present your analysis in the following format:

-- Suggested Website for Selling: Website Name - <a href="Highest_selling_price">Suggested Selling Price</a>
-- Average Selling Prices at Other Stores: store1 - <a href="URL_for_store1">average_price1</a>, store2 - <a href="URL_for_store2">average_price2</a>, ..., storeN - average_priceN

Here's the dataset for analysis: {product_list}
Please analyze the dataset to determine the best selling platform for a similar product and outline the average selling prices across different stores. Assume that the product I plan to sell has similar attributes and falls within the same category as those listed in the dataset.`;
const PROD_DESCRIPTION_PROMPT = `Given a list of attributes of a product, write a product description to help the user sell the product. The product description should be similar to product descriptions in the "product_description" fields in the product listings provided here: {product_list}.
Here is the list of attributes for the product to aid your product description: {attribute_list}
Do not mention price comparisons from other webistes or stores.`;
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});
async function POST({ request }) {
  try {
    const { productList, attributeList, type } = await request.json();
    if (!productList || !type) {
      return json({ error: "Missing required parameters" }, { status: 400 });
    }
    let prompt;
    let messages = [];
    if (type === "vision") {
      prompt = VISION_PROMPT.replace("{product_list}", JSON.stringify(productList, null, 2));
      messages = [
        {
          role: "system",
          content: "You are an expert e-commerce analyst specializing in product pricing and marketplace recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ];
    } else if (type === "description") {
      if (!attributeList) {
        return json({ error: "Attribute list is required for description generation" }, { status: 400 });
      }
      prompt = PROD_DESCRIPTION_PROMPT.replace("{product_list}", JSON.stringify(productList, null, 2)).replace("{attribute_list}", JSON.stringify(attributeList, null, 2));
      messages = [
        {
          role: "system",
          content: "You are an expert copywriter specializing in product descriptions for e-commerce platforms."
        },
        {
          role: "user",
          content: prompt
        }
      ];
    } else {
      return json({ error: 'Invalid type parameter. Must be "vision" or "description"' }, { status: 400 });
    }
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.7,
      max_tokens: 1e3
    });
    const response = completion.choices[0]?.message?.content;
    if (!response) {
      return json({ error: "No response from OpenAI" }, { status: 500 });
    }
    return json({
      success: true,
      response,
      type
    });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return json({
      error: "Failed to process request",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
export {
  POST
};
