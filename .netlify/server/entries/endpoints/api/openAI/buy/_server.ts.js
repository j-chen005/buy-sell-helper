import { json } from "@sveltejs/kit";
import OpenAI from "openai";
import { O as OPENAI_API_KEY } from "../../../../../chunks/env.js";
const BUY_PROMPT = `Given the dataset below, containing detailed product listings from various online stores, your task is to analyze the information and recommend the BEST product to buy based on value, price, and quality.

Analyze the products and select ONE product that offers the best overall value. Focus mostly on the price. The cheaper option is usually better, as long as the price is realistic for that product. Consider:
- Price competitiveness
- Product quality and features
- Store reliability
- Overall value proposition

IMPORTANT: You must select a product that is actually present in the provided dataset. The product you recommend MUST exist in the list below.

Return your response in the following JSON format ONLY (no other text):
{
  "recommendedProductIndex": <index_of_the_recommended_product_in_the_array>,
  "rationale": "<detailed_explanation_of_why_this_product_was_chosen_as_the_best_option>"
}

The rationale should explain why this specific product is the best choice, considering price, quality, features, and overall value. Make sure to mention the exact product name, price, and store in your rationale.

Here's the dataset for analysis: {product_list}`;
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});
async function POST({ request }) {
  try {
    const { productList } = await request.json();
    if (!productList) {
      return json({ error: "Missing required parameters" }, { status: 400 });
    }
    const prompt = BUY_PROMPT.replace("{product_list}", JSON.stringify(productList, null, 2));
    const messages = [
      {
        role: "system",
        content: "You are an expert e-commerce analyst specializing in finding the best deals and highest value products. You must ONLY select products from the provided dataset. Always respond with valid JSON format only. The recommendedProductIndex must be a valid index (0 to array length - 1) from the provided product list."
      },
      {
        role: "user",
        content: prompt
      }
    ];
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages,
      temperature: 0.7,
      max_tokens: 1e3
    });
    const response = completion.choices[0]?.message?.content;
    if (!response) {
      return json({ error: "No response from OpenAI" }, { status: 500 });
    }
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", response);
      return json({ error: "Invalid AI response format" }, { status: 500 });
    }
    if (!parsedResponse.recommendedProductIndex || !parsedResponse.rationale) {
      return json({ error: "Invalid AI response structure" }, { status: 500 });
    }
    const index = parseInt(parsedResponse.recommendedProductIndex);
    if (isNaN(index) || index < 0 || index >= productList.length) {
      console.error("Invalid AI recommendation index:", {
        providedIndex: parsedResponse.recommendedProductIndex,
        parsedIndex: index,
        productListLength: productList.length,
        validRange: `0 to ${productList.length - 1}`
      });
      return json({ error: "AI recommended product index out of range" }, { status: 500 });
    }
    const recommendedProduct = productList[index];
    if (!recommendedProduct) {
      return json({ error: "Recommended product not found" }, { status: 500 });
    }
    console.log("AI Recommendation Debug:", {
      totalProducts: productList.length,
      selectedIndex: index,
      selectedProduct: {
        title: recommendedProduct.product_title,
        price: recommendedProduct.price,
        store: recommendedProduct.store_name
      },
      rationale: parsedResponse.rationale
    });
    return json({
      success: true,
      recommendedProduct,
      rationale: parsedResponse.rationale,
      type: "buy"
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
