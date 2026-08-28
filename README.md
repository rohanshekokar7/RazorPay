# Buy BuDDY AI - Agent-to-Agent (A2A) Commerce Platform

Welcome to Buy BuDDY AI, a modern Next.js application that demonstrates the future of Autonomous Agent-to-Agent (A2A) Commerce. 

This platform allows users to delegate purchasing power to a personal AI agent, complete with strict financial guardrails, real-time auditing, interactive checkout flows, and graceful step-up authentication.

---

## Key Features

* **Autonomous AI Agent Console (Powered by Groq LLM)**
  Interact with your personal AI via natural language. Tell the agent your intent, and the agent will match your request to the catalog, check inventory, process dynamic cross-selling, and handle the checkout autonomously.

* **Interactive Two-Step Checkout Flow**
  The AI utilizes a strict two-step verification process. Before any purchase is finalized, the agent requires explicit user confirmation via an interactive UI approval card within the chat interface, ensuring complete control over transactions.

* **Delegated Mandates & Financial Guardrails**
  Control the AI's wallet architecture. Set hard limits on the maximum transaction amount. Every financial action undertaken by the AI is explainable, bounded, and gated.

* **Graceful Step-Up Authentication (MFA)**
  If the AI attempts a purchase that exceeds its authorized financial mandate, the system actively blocks it. It triggers a Graceful Failure state, prompting the human user for biometric or MFA Step-Up Authentication to manually approve the overage.

* **Real-time Transaction Audit Trail**
  Maintain total transparency. The A2A Audit Trail provides a terminal-style look into the AI's processing logic. Monitor intent capture, catalog matching, bounded boundary checks, and gated token generation in real-time.

* **Comprehensive Order Management System**
  All successful autonomous and human-approved transactions are saved to a Prisma-backed SQLite database. Users can view active orders, dynamic product images, delivery timelines, and initiate order cancellations through a formal confirmation modal.

* **Role-Based Access (Admin)**
  Secure login system with a dedicated Admin portal.

---

## Technical Stack

* **Framework:** Next.js 14 (App Router)
* **Styling:** Tailwind CSS, Framer Motion
* **Database:** SQLite with Prisma ORM
* **Language:** TypeScript
* **AI Integration:** Groq SDK (Llama Models)
* **Payments:** Razorpay API Integration

---

## Getting Started

Follow these steps to run the project locally:

### 1. Clone the repository
```bash
git clone https://github.com/rohanshekokar7/RazorPay.git
cd RazorPay
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup the Database
Initialize the Prisma SQLite database and push the schema:
```bash
npx prisma generate
npx prisma db push
```

### 4. Run the Development Server
```bash
npm run dev
```

### 5. Test the Application
Open http://localhost:3000 with your browser to see the result.

**Admin Login Details:**
To test the fully authenticated application flow:
* **Email:** admin@gmail.com
* **Password:** Admin@123

---

## Usage Guide (A2A Demo)

1. Log in using the provided Admin credentials.
2. Navigate to the storefront and interact with the AI Store Clerk on the right sidebar.
3. Configure your Delegated Consent rules via the settings panel (e.g., Max limit ₹500).
4. Chat with the agent to initiate a purchase: 
   * Authorized purchase: The AI will generate an approval card. Upon clicking 'Approve', it will process via Auto Checkout.
   * Unauthorized purchase: If the item exceeds the set mandate, the AI will trigger the Step-Up Authentication flow for manual approval.
5. Monitor the A2A Audit Trail to verify and understand the logic behind every autonomous action.
6. Visit the My Orders dashboard to review order details, view dynamic product images, and manage cancellations.

---

*This project was developed to explore secure, explainable, and bounded AI-driven commerce systems.*
