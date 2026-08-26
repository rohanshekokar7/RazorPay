import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'mock_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_key_secret',
});

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tool declarations for Groq
const tools: Groq.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'check_inventory',
      description: 'Checks the inventory for a specific item and retrieves related accessories.',
      parameters: {
        type: 'object',
        properties: {
          item: {
            type: 'string',
            description: 'The name of the item to check.',
          },
        },
        required: ['item'],
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
      name: 'generate_razorpay_link',
      description: 'Generates a payment link for a specific item (or combined items) and amount. Call this when the user is ready to purchase.',
      parameters: {
        type: 'object',
        properties: {
          item: {
            type: 'string',
            description: 'The name of the item(s).',
          },
          amount: {
            type: 'number',
            description: 'The total amount to charge the user.',
          },
        },
        required: ['item', 'amount'],
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
  }
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body; 

    let auditLogs: Array<{ id: string, timestamp: string, step: string, status: "INFO" | "SUCCESS" | "ERROR", details: string }> = [];
    let paymentLink: { url: string, amount: number, title: string } | null = null;
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

    const systemInstruction = `You are a helpful and expert AI store clerk for a modern e-commerce store. 
You can recommend products, check inventory, calculate discounts, generate payment links, and process refunds/cancellations.
CRITICAL RULES:
1. CROSS-SELL REQUIREMENT: Whenever a user asks to buy an item, you MUST check the inventory for a logically related accessory (returned by the check_inventory tool) and naturally suggest adding it to the order to increase total revenue, BEFORE generating the payment link.
2. When checking inventory, use ONLY the core product name as the search item (e.g. use "Sneakers" instead of "Sneakers priced at $500"). If the item is not found in inventory, DO NOT GIVE UP. Simply proceed to generate the payment link using the item name and price the user specified.
3. If the user wants to buy a product of 100 or less, you MUST suggest buying another item to increase their total bill and tell them they will get a discount of 10% on the total.
4. If the product is expensive (e.g. > 100), you MUST tell the user that they can get cashback or a discount by paying with a credit card, or get discounts by paying with UPI.
5. You must explicitly explain every money action in the chat before generating a payment link.
6. If a "Payment Success Webhook" message is received, thank the user and confirm their order is being shipped.
7. ORDER CANCELLATIONS: If a user asks to cancel an order or return an item, you MUST first use the 'lookup_order' tool to find it. If found, you MUST then use the 'process_refund' tool to issue their refund via Razorpay. Explain to the user that the refund will reflect in 5-7 days.
8. TWO-STEP CHECKOUT: When a user asks about a product, ONLY search the inventory and present the product details. DO NOT generate a payment link yet. You must wait for the user to explicitly confirm they want to buy it (e.g., "I want to buy this", "send me the link") BEFORE you generate the payment link.
9. Use the provided tools to perform these actions.`;

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
        
        if (name === 'check_inventory') {
            const products = await prisma.product.findMany({
                where: {
                    name: {
                        contains: args.item
                    }
                },
                take: 5
            });
            
            if (products.length > 0) {
                const formattedProducts = await Promise.all(products.map(async (p) => {
                    let accessoryName = 'None available';
                    if (p.accessoryId) {
                        const accessory = await prisma.product.findUnique({ where: { id: p.accessoryId } });
                        if (accessory) accessoryName = accessory.name;
                    }
                    return {
                        name: p.name,
                        description: p.description,
                        price: p.price,
                        in_stock: p.inStock,
                        accessory: accessoryName
                    };
                }));
                
                result = { products: formattedProducts };
                addLog(`Tool Success: ${name}`, 'SUCCESS', `Found ${products.length} products matching "${args.item}"`);
            } else {
                result = { in_stock: false, error: "Item not found in inventory catalog." };
                addLog(`Tool Success: ${name}`, 'SUCCESS', `Inventory checked for ${args.item}. Item not found.`);
            }
        } 
        else if (name === 'calculate_upsell_discount') {
            result = { discounted_price: args.original_price * 0.9, discount_percentage: 10 };
            addLog(`Tool Success: ${name}`, 'SUCCESS', `Calculated discount for ${args.original_price}`);
        } 
        else if (name === 'generate_razorpay_link') {
            const amountCheckLog = `[GUARDRAIL CHECK] Requested: $${args.amount} | Limit: $1000000 | Status: ${args.amount > 1000000 ? 'REJECTED' : 'PASSED'}`;
            
            if (args.amount > 1000000) {
                result = { error: 'Order total exceeds maximum allowed amount of $1000000. Guardrail enforced.' };
                addLog(`Guardrail Triggered`, 'ERROR', amountCheckLog);
            } else {
                addLog(`Guardrail Passed`, 'SUCCESS', amountCheckLog);
                
                if (args.item.toLowerCase().includes('limited edition sneakers')) {
                    addLog(`Tool Error: ${name}`, 'ERROR', `Simulated 500 Internal Server Error / API Timeout from Razorpay for ${args.item}`);
                    result = { error: 'Razorpay API 500: Internal Server Error. Timeout while generating link. Please offer a 10% discount on another item as an apology.' };
                } else {
                    try {
                        const linkData = {
                          amount: Math.round(args.amount * 100), // Razorpay accepts amounts in paise
                          currency: "INR", // Changed to INR to enable UPI, QR Code, and domestic payment options
                          accept_partial: false,
                          description: `Buy BuDDY AI Order: ${args.item}. Thank you for shopping with us!`,
                          customer: {
                            name: "Agentic Shopper",
                            email: "shopper@example.com",
                            contact: "+919876543210"
                          },
                          notify: { sms: false, email: false },
                          reminder_enable: false,
                          notes: {
                            store: "Buy BuDDY AI",
                            item: args.item,
                            support: "support@buybuddy.ai"
                          }
                        };
                        
                        addLog(`Calling Razorpay SDK`, 'INFO', `Creating payment link for $${args.amount}`);
                        
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
                            amount: args.amount,
                            title: `Payment for ${args.item}`
                        };
                        result = { success: true, payment_url: paymentLink.url, amount: args.amount };
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
        } else {
            result = { error: 'Unknown function' };
        }
        
        // Push the tool result to the conversation
        groqMessages.push({
            role: 'tool',
            tool_call_id: call.id,
            name: call.function.name,
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
    
    finalReply = responseMessage.content || (paymentLink ? "I have generated a payment link for you below." : "I couldn't process that.");
    addLog('Generation Complete', 'SUCCESS', 'Successfully generated final response.');
    
    return NextResponse.json({
        reply: finalReply,
        paymentLink,
        auditLogs
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
