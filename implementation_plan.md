# Make Agent Ask for Clarification and Approval

The user wants to replace the hardcoded "autonomous checkout" interceptor with an interactive, intelligent flow where the agent first clarifies which item to buy, and then presents explicit "Approve" / "Cancel" buttons before executing the purchase.

## Open Questions
None. The requirements are clear: move checkout logic to an interactive LLM flow with approval buttons.

## Proposed Changes

### Chat API (`app/api/chat/route.ts`)
- Update `systemInstruction`: Instruct the agent to search inventory first if the item is ambiguous. When the user confirms the item, the agent MUST use a new `request_purchase_approval` tool instead of directly generating a payment link.
- Add `request_purchase_approval` tool: Takes `item`, `amount`, and `category`. When called, the API returns a `approvalRequest` object to the frontend.

### Frontend Chat (`components/ChatInterface.tsx`)
- Remove the hardcoded `if (mandate.isActive)` block from `handleSendMessage`. All messages will now correctly route to the LLM.
- Update the `Message` interface to include `approvalRequest?: { item: string, amount: number, category: string }`.
- Modify the message rendering logic to display a styled "Purchase Approval" card with **[Approve]** and **[Cancel]** buttons if `approvalRequest` is present.
- Implement the `handleApprovePurchase` function:
  - If `mandate.isActive`, directly call `/api/agent-checkout` to simulate the delegated agent executing the purchase on their behalf.
  - If not active, optionally generate a payment link by messaging the LLM.
- Implement the `handleCancelPurchase` function to append a message saying the purchase was cancelled.

## Verification Plan
- Type "I want to buy a womens kurta" in the chat.
- Verify the agent asks which kurta to buy (MASARA or Vishudh) since there are multiple in the database.
- Reply with a specific kurta.
- Verify the agent presents the Approval Card with buttons.
- Click "Approve" and verify the checkout succeeds.
