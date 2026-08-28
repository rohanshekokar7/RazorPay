# Buy BuDDY AI - Agent-to-Agent (A2A) Commerce Platform

Welcome to **Buy BuDDY AI**, a cutting-edge Next.js application that demonstrates the future of **Autonomous Agent-to-Agent (A2A) Commerce**. 

This platform allows users to delegate purchasing power to a personal AI agent, complete with strict guardrails, real-time auditing, and graceful step-up authentication. 

---

## 🚀 Key Features

* **🤖 Autonomous AI Agent Console**
  Interact with your personal AI via natural language. Tell the agent "I want to buy a phone" or "Order my usual coffee," and the agent will match your intent to the catalog and process the checkout autonomously.
  
* **🛡️ Delegated Mandates & Guardrails**
  Safety first! You control the AI's wallet. Set hard limits on the maximum transaction amount and restrict which categories (e.g., Groceries, Subscription) the AI is legally allowed to purchase from.

* **🛑 Graceful Step-Up Authentication (MFA)**
  If the AI attempts a purchase that exceeds its authorized mandate (e.g., buying an expensive phone when only authorized for groceries), the system actively blocks it. It triggers a "Graceful Failure" state, prompting the human user for biometric/MFA Step-Up Authentication to manually approve the overage.

* **📜 Real-time Transaction Audit Trail**
  Total transparency. The A2A Audit Trail gives you a terminal-style look into the AI's "thought process." See intent capture, catalog matching, bounded boundary checks, and gated token generation in real-time.

* **📦 Database-Backed Order Management**
  All successful autonomous and human-approved transactions are saved to a Prisma-backed SQLite database. View your active orders, delivery timelines, and cancel orders within a 7-day window.

* **🔐 Role-Based Access (Admin)**
  Secure login system with a dedicated Admin portal.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 14 (App Router)
* **Styling:** Tailwind CSS, Framer Motion, Lucide Icons
* **Database:** SQLite with Prisma ORM
* **Language:** TypeScript

---

## 💻 Getting Started

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
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

**Admin Login Details:**
To test the fully authenticated application flow:
* **Email:** `admin@gmail.com`
* **Password:** `Admin@123`

---

## 💡 How to use the Agent (A2A Demo)

1. Log in using the Admin credentials.
2. Navigate to the **Agent Console** (`/agent`).
3. Set your **Delegated Consent** rules on the left (e.g., Max limit ₹500, Categories: Groceries).
4. Chat with the agent on the right! 
   * *Try an authorized purchase:* "Buy some coffee beans" (Under limit, authorized category -> Auto Checkout)
   * *Try an unauthorized purchase:* "Buy a phone" (Over limit, unauthorized category -> Triggers Step-Up Auth!)
5. Watch the **A2A Audit Trail** verify and explain every single action.
6. Visit **My Orders** (`/orders`) to see the final results.

---

*This project was built to explore secure, explainable, and bounded AI-driven commerce systems.*
