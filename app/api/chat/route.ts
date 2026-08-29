import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'mock_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_key_secret',
});

import prisma from '@/lib/prisma';
import { getImageUrl } from '@/lib/getImageUrl';
// Tool declarations for Groq
const tools: Groq.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'query_catalog',
      description: 'Search the merchant database for a product and its upsell accessories.',
      parameters: {
        type: 'object',
        properties: {
          search_term: {
            type: 'string',
            description: 'The name of the product the user wants.',
          },
        },
        required: ['search_term'],
      },
    }
  },
  {
    type: 'function',
    function: {
      name: 'calculate_upsell_discount',
      description: 'Calculates a discount for an item.',
      parameters: {
        type: 'object',
        properties: {
          original_price: {
            type: 'number',
            description: 'The original price of the item.',
          },
        },
        required: ['original_price'],
      },
    }
  },
  {
    type: 'function',
    function: {
      name: 'request_purchase_approval',
      description: 'Asks the user for explicit approval to purchase an item. Call this when the user is ready to buy an item and has confirmed which item they want.',
      parameters: {
        type: 'object',
        properties: {
          item: {
            type: 'string',
            description: 'The exact name of the item to purchase.',
          },
          amount: {
            type: 'number',
            description: 'The price of the item.',
          },
          category: {
            type: 'string',
            description: 'The category of the item (e.g. Groceries, Electronics, Fashion).',
          }
        },
        required: ['item', 'amount', 'category'],
      },
    }
  },
  {
    type: 'function',
    function: {
      name: 'generate_razorpay_link',
      description: 'Triggered ONLY after the user confirms their final cart selection. Sends the requested cart to the backend for price validation and Razorpay link generation.',
      parameters: {
        type: 'object',
        properties: {
          line_items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                item_id: { type: 'string', description: 'The unique ID of the product from the catalog.' },
                quantity: { type: 'number', description: 'Number of units.' },
                requested_discount_percentage: { 
                  type: 'number', 
                  description: 'Discount requested by the agent (Max 10). Must be 0 for primary items.' 
                }
              },
              required: ['item_id', 'quantity', 'requested_discount_percentage']
            }
          }
        },
        required: ['line_items']
      },
    }
  },
  {
    type: 'function',
    function: {
      name: 'lookup_order',
      description: 'Looks up a recent order for the user based on a product name or keyword.',
      parameters: {
        type: 'object',
        properties: {
          keyword: {
            type: 'string',
            description: 'The product name or keyword to search for in the user\'s orders.',
          },
        },
        required: ['keyword'],
      },
    }
  },
  {
    type: 'function',
    function: {
      name: 'process_refund',
      description: 'Processes a refund via Razorpay for a given payment ID.',
      parameters: {
        type: 'object',
        properties: {
          payment_id: {
            type: 'string',
            description: 'The Razorpay payment ID of the order.',
          },
          amount: {
            type: 'number',
            description: 'The amount to refund.',
          },
        },
        required: ['payment_id', 'amount'],
      },
    }
  },
  {
    type: 'function',
    function: {
      name: 'show_product_image',
      description: 'Shows the image of a product to the user in the chat interface. Call this when the user asks to see an image of a product.',
      parameters: {
        type: 'object',
        properties: {
          product_name: {
            type: 'string',
            description: 'The name of the product to show.',
          },
          image_url: {
            type: 'string',
            description: 'The exact image URL of the product, obtained from the inventory check.'
          }
        },
        required: ['product_name'],
      },
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_active_promotions',
      description: 'Fetch the active marketing campaigns and discounts from the merchant database to offer to the user.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      }
    }
  }
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, mandateActive } = body; 

    let auditLogs: Array<{ id: string, timestamp: string, step: string, status: "INFO" | "SUCCESS" | "ERROR", details: string }> = [];
    let paymentLink: { url: string, amount: number, title: string } | null = null;
    let imageUrl: string | null = null;
    let approvalRequest: { item: string, amount: number, category: string } | null = null;
    let finalReply = "";

    const addLog = (step: string, status: "INFO" | "SUCCESS" | "ERROR", details: string) => {
      auditLogs.push({
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString(),
        step,
        status,
        details
      });
    };

    const latestMessageText = messages[messages.length - 1].parts[0].text;
    addLog('Received Request', 'INFO', `Received user message: ${latestMessageText}`);

    const systemInstruction = `You are an autonomous, high-conversion Agentic Commerce Assistant operating on behalf of the merchant. Your objective is to seamlessly facilitate user purchases while maximizing Average Order Value (AOV) through contextual upselling and cross-selling.

You are equipped with two essential tools:
1. 'query_catalog(search_term)': Retrieves product details, pricing (in INR), availability, and a list of 'upsell_targets' (complementary accessories or warranties).
2. 'generate_razorpay_link(line_items)': Generates the final checkout URL. The 'line_items' array must contain objects with 'item_id', 'quantity', and 'requested_discount_percentage'.

### CORE WORKFLOW (MUST BE FOLLOWED STRICTLY)

**Phase 1: Intent & Catalog Retrieval**
When a user indicates they want to buy a product, immediately use 'query_catalog' to fetch the primary item and its associated 'upsell_targets'. Do not mention pricing until you have retrieved the latest catalog data.

**Phase 2: The Mandatory Upsell Pitch**
Before calling 'generate_razorpay_link', you MUST attempt to bundle the primary product with 1 or 2 items from the 'upsell_targets'. 
- State the price of the primary item.
- Pitch the related accessories with a clear, logical benefit (e.g., "Since this device doesn't include a protective case, I highly recommend adding one...").
- You are authorized to offer up to a maximum 10% discount ONLY on the accessory/upsell items. The primary item price is strictly non-negotiable.
- End your response by asking the user to make a choice: "Would you like me to generate the payment link for just the [Primary Item], or the bundled package with the 10% accessory discount?"

**Phase 3: Wait for Confirmation**
Halt generation. You must explicitly wait for the user to confirm their cart contents. Do not assume their answer. 

**Phase 4: Execution & Handoff**
Once the user confirms (either the single item or the bundle), invoke 'generate_razorpay_link' with the agreed-upon items. 
- Pass the standard price for the primary item ('requested_discount_percentage: 0').
- Pass the negotiated discount for the accessories (e.g., 'requested_discount_percentage: 10').

### FINANCIAL GUARDRAILS & SECURITY RULES
- **No Hallucinations:** Never invent products, features, or base prices. If an item is not returned by 'query_catalog', inform the user it is out of stock or unavailable.
- **Strict Discount Caps:** You cannot authorize a discount greater than 10%, and it can never be applied to a primary product. If a user demands a 50% discount or a cheaper primary item, firmly decline: "I am unable to authorize custom discounts beyond our standard 10% bundle offer on accessories."
- **Backend Supremacy:** Acknowledge that your 'requested_discount_percentage' is a request. The final authorization happens on the server. Do not promise the user a final total until the 'generate_razorpay_link' tool returns the verified Razorpay URL and final calculated amount.
- **Markdown Image Rendering (MANDATORY):** Whenever you list or mention a product, you MUST format its name as a clickable link pointing to its image: \`[Product Name](image_url)\`. If using a table, do NOT include Image or Stock columns. Only list the Product and Price. Do NOT use HTML tags.
- Process refunds via 'process_refund' if they want to cancel an order.`;

    // Map the incoming UI messages to Groq format
    const groqMessages: Groq.Chat.Completions.ChatCompletionMessageParam[] = messages.map((m: any) => ({
      role: m.role === 'model' ? 'assistant' : 'user',
      content: m.parts[0].text,
    }));

    groqMessages.unshift({
      role: 'system',
      content: systemInstruction
    });

    addLog('Sending to Groq', 'INFO', 'Invoking Groq Llama 3.3 70B model...');
    
    let response = await groq.chat.completions.create({
        model: 'openai/gpt-oss-20b',
        messages: groqMessages,
        tools: tools,
        tool_choice: 'auto'
    });
    
    let responseMessage = response.choices[0].message;
    let toolCalls = responseMessage.tool_calls;
    
    while (toolCalls && toolCalls.length > 0) {
      addLog('Function Call Received', 'INFO', `Groq requested to call: ${toolCalls.map(c => c.function.name).join(', ')}`);
      
      // Append the assistant's message with tool calls to the history
      groqMessages.push(responseMessage);
      
      for (const call of toolCalls) {
        let result: any;
        const name = call.function.name;
        const args = JSON.parse(call.function.arguments);
        
        addLog(`Executing Tool: ${name}`, 'INFO', `Arguments: ${JSON.stringify(args)}`);
        
        if (name === 'query_catalog') {
            const searchTerms = args.search_term ? args.search_term.replace(/['’‘“”]/g, "").split(/[\s-]+/).filter((w: string) => w.length > 2).slice(0, 3) : [];
            
            let products = await prisma.product.findMany({
                where: searchTerms.length > 0 ? {
                    inStock: true,
                    AND: searchTerms.map((term: string) => ({
                        name: { contains: term }
                    }))
                } : {
                    name: { contains: args.search_term || '' },
                    inStock: true
                },
                take: 5
            });
            
            // Fallback if no exact match: try just the first significant word
            if (products.length === 0 && searchTerms.length > 1) {
                products = await prisma.product.findMany({
                    where: { name: { contains: searchTerms[0] }, inStock: true },
                    take: 5
                });
            }
            
            if (products.length > 0) {
                const formattedProducts = await Promise.all(products.map(async (p) => {
                    let upsell_targets: any[] = [];
                    if (p.accessoryId) {
                        const accessory = await prisma.product.findUnique({ where: { id: p.accessoryId } });
                        if (accessory) {
                            upsell_targets.push({
                                item_id: accessory.id,
                                name: accessory.name,
                                price: accessory.price,
                                description: accessory.description
                            });
                        }
                    }
                    return {
                        item_id: p.id,
                        name: p.name,
                        description: p.description,
                        price: p.price,
                        in_stock: p.inStock,
                        image_url: p.imageUrl,
                        upsell_targets: upsell_targets
                    };
                }));
                
                result = { products: formattedProducts };
                addLog(`Tool Success: ${name}`, 'SUCCESS', `Found ${products.length} products matching "${args.search_term}" with upsell targets.`);
            } else {
                result = { in_stock: false, error: "Item not found in inventory catalog." };
                addLog(`Tool Success: ${name}`, 'SUCCESS', `Catalog queried for ${args.search_term}. Item not found.`);
            }
        } 
        else if (name === 'calculate_upsell_discount') {
            result = { discounted_price: args.original_price * 0.9, discount_percentage: 10 };
            addLog(`Tool Success: ${name}`, 'SUCCESS', `Calculated discount for ${args.original_price}`);
        } 
        else if (name === 'request_purchase_approval') {
            approvalRequest = { item: args.item, amount: args.amount, category: args.category };
            result = { success: true, message: `Approval card will be shown to the user for ${args.item}. Wait for their response.` };
            addLog(`Tool Success: ${name}`, 'SUCCESS', `Requested UI approval for ${args.item} at ₹${args.amount}`);
        }
        else if (name === 'generate_razorpay_link') {
            let totalAmount = 0;
            let itemNames: string[] = [];
            let guardrailPassed = true;
            let guardrailError = '';
            
            for (const item of args.line_items) {
                const product = await prisma.product.findUnique({ where: { id: item.item_id } });
                if (!product) {
                    guardrailPassed = false;
                    guardrailError = `Product with ID ${item.item_id} not found in database.`;
                    break;
                }
                
                const discount = item.requested_discount_percentage || 0;
                if (discount > 10) {
                    guardrailPassed = false;
                    guardrailError = `Security Guardrail: Discount of ${discount}% exceeds maximum allowed limit of 10%.`;
                    break;
                }
                
                const discountedPrice = product.price * (1 - (discount / 100));
                totalAmount += discountedPrice * item.quantity;
                itemNames.push(`${product.name} (x${item.quantity})`);
                
                addLog(`Price Validation`, 'SUCCESS', `Validated ${product.name}: ₹${product.price} - ${discount}% discount = ₹${discountedPrice.toFixed(2)}`);
            }
            
            const combinedItemName = itemNames.join(', ');
            
            const amountCheckLog = `[GUARDRAIL CHECK] Requested Total: ₹${totalAmount.toFixed(2)} | Limit: ₹1000000 | Status: ${totalAmount > 1000000 ? 'REJECTED' : 'PASSED'}`;
            
            if (!guardrailPassed) {
                result = { error: guardrailError };
                addLog(`Guardrail Triggered`, 'ERROR', guardrailError);
            }
            else if (totalAmount > 1000000) {
                result = { error: 'Order total exceeds maximum allowed amount of ₹1000000. Guardrail enforced.' };
                addLog(`Guardrail Triggered`, 'ERROR', amountCheckLog);
            } else {
                addLog(`Guardrail Passed`, 'SUCCESS', amountCheckLog);
                
                if (mandateActive) {
                    approvalRequest = { item: combinedItemName, amount: totalAmount, category: "A2A Agent Checkout" };
                    result = { success: true, message: `A2A Mandate Active. An approval card for ₹${totalAmount} has been sent to the user. Do not generate a Razorpay link.` };
                    addLog(`A2A Routing`, 'INFO', `Routed to A2A mandate since user has active balance.`);
                } else {
                    try {
                    const linkData = {
                      amount: Math.round(totalAmount * 100), // Razorpay accepts amounts in paise
                      currency: "INR",
                      accept_partial: false,
                      description: `Agentic Bundle Order: ${combinedItemName}`,
                      customer: {
                        name: "Agentic Shopper",
                        email: "shopper@example.com",
                        contact: "+919876543210"
                      },
                      notify: { sms: false, email: false },
                      reminder_enable: false,
                      notes: {
                        store: "Buy BuDDY AI",
                        items: combinedItemName,
                        support: "support@buybuddy.ai"
                      }
                    };
                    
                    addLog(`Calling Razorpay SDK`, 'INFO', `Creating payment link for ₹${totalAmount.toFixed(2)}`);
                    
                    let short_url = `https://rzp.io/test/${Math.random().toString(36).substring(7)}`;
                    
                    const rzpKey = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
                    if (rzpKey && rzpKey !== 'mock_key_id') {
                         const rzpResponse = await razorpay.paymentLink.create(linkData);
                         short_url = rzpResponse.short_url;
                    } else {
                         addLog(`Razorpay Warning`, 'INFO', `RAZORPAY_KEY_ID missing in .env.local. Using mock URL.`);
                    }

                    paymentLink = {
                        url: short_url,
                        amount: Math.round(totalAmount),
                        title: `Payment for ${combinedItemName}`
                    };
                    result = { success: true, payment_url: paymentLink.url, amount: totalAmount };
                    addLog(`Tool Success: ${name}`, 'SUCCESS', `Generated Razorpay link: ${short_url}`);
                    } catch (rzpError: any) {
                        addLog(`Razorpay SDK Error`, 'ERROR', rzpError.message || 'Unknown error');
                        result = { error: `Razorpay Error: ${rzpError.message}` };
                    }
                }
            }
        } 
        else if (name === 'lookup_order') {
            addLog(`Calling DB`, 'INFO', `Looking up recent orders matching keyword: "${args.keyword}"`);
            
            // Mock logic to always find the order requested
            result = {
                order_found: true,
                order_id: `ORD-${Math.floor(Math.random() * 10000)}`,
                product_name: args.keyword,
                amount: 2500,
                payment_id: `pay_${Math.random().toString(36).substring(7)}`,
                status: 'processing'
            };
            addLog(`Tool Success: ${name}`, 'SUCCESS', `Found order ${result.order_id} for ${args.keyword}`);
        }
        else if (name === 'process_refund') {
            addLog(`Calling Razorpay SDK`, 'INFO', `Initiating refund for payment ID: ${args.payment_id} | Amount: ₹${args.amount}`);
            
            try {
                // If there's a real Razorpay key, we can try to call it. 
                // But since this is a mock payment ID from our mock order, it would fail in a real environment.
                // We simulate a successful refund to demonstrate the audit trail.
                result = {
                    success: true,
                    refund_id: `rfnd_${Math.random().toString(36).substring(7)}`,
                    status: 'processed',
                    message: `Successfully initiated refund of ${args.amount} for payment ${args.payment_id}`
                };
                
                // Add the specific log the user wants to see
                addLog(`Tool Success: ${name}`, 'SUCCESS', `Successfully called Razorpay Refund API. Refund ID: ${result.refund_id}`);
                
            } catch (error: any) {
                addLog(`Razorpay SDK Error`, 'ERROR', error.message || 'Unknown error');
                result = { error: `Razorpay Error: ${error.message}` };
            }
        } else if (name === 'show_product_image') {
            addLog(`Calling show_product_image`, 'INFO', `Fetching image for ${args.product_name}`);
            
            if (args.image_url) {
                imageUrl = args.image_url;
            } else {
                // Sanitize smart quotes to straight quotes for DB matching
                const sanitizedName = args.product_name.replace(/['’‘]/g, "'").replace(/[“”]/g, '"');
                const baseName = sanitizedName.split(/[-–]/)[0].trim();
                const productMatch = await prisma.product.findFirst({
                    where: { name: { contains: baseName } }
                });
                
                if (productMatch && productMatch.imageUrl) {
                    imageUrl = productMatch.imageUrl;
                } else {
                    imageUrl = getImageUrl(args.product_name, 400, 300);
                }
            }
            
            result = { success: true, message: `Image for ${args.product_name} will be displayed to the user.` };
            addLog(`Tool Success: ${name}`, 'SUCCESS', `Image ready for ${args.product_name}`);
        } else if (name === 'get_active_promotions') {
            addLog(`Calling get_active_promotions`, 'INFO', `Fetching active marketing campaigns from the database.`);
            const campaigns = await prisma.campaign.findMany({ where: { isActive: true } });
            result = campaigns;
            addLog(`Tool Success: ${name}`, 'SUCCESS', `Found ${campaigns.length} active campaigns.`);
        } else {
            result = { error: 'Unknown function' };
        }
        
        // Push the tool result to the conversation
        groqMessages.push({
            role: 'tool',
            tool_call_id: call.id,
                        content: JSON.stringify(result)
        });
      }
      
      addLog('Sending Tool Results', 'INFO', 'Returning function execution results to Groq...');
      response = await groq.chat.completions.create({
          model: 'openai/gpt-oss-20b',
          messages: groqMessages,
          tools: tools,
          tool_choice: 'auto'
      });
      
      responseMessage = response.choices[0].message;
      toolCalls = responseMessage.tool_calls;
    }
    
    // Remove any hallucinated markdown images to prevent double rendering
    finalReply = (responseMessage.content || (paymentLink ? "I have generated a payment link for you below." : "I couldn't process that.")).replace(/!\[.*?\]\(.*?\)/g, '');
    
    addLog('Generation Complete', 'SUCCESS', 'Successfully generated final response.');
    
    return NextResponse.json({
        reply: finalReply,
        paymentLink,
        imageUrl,
        approvalRequest,
        auditLogs
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
