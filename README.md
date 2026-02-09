
# Jambo Apparels | Premium Christian Streetwear Platform

A modern, full-stack e-commerce application built for a faith-based clothing brand. This project features a high-performance storefront, a comprehensive admin dashboard, and an AI-powered operations assistant.

## 🚀 Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **AI & Intelligence:** Google Gemini API (`@google/genai` SDK)
- **Payments:** PayPal JavaScript SDK
- **Email:** Resend API
- **State Management:** React Context API + LocalStorage Caching
- **Rich Text:** Tiptap Editor

## ✨ Key Features

### Storefront
- **Dynamic Catalog:** Filterable product listings with real-time stock checks.
- **Shopping Cart:** Persistent cart state with stock validation.
- **Checkout:** Guest and User checkout flows with address management.
- **Blog/Journal:** SEO-optimized content platform for brand storytelling.
- **Responsive Design:** Mobile-first UI with sticky navigation and optimized touch interactions.

### Admin Dashboard
- **Analytics:** Real-time revenue tracking, traffic distribution, and conversion metrics.
- **Order Management:** Process orders, handle returns, and print invoices.
- **Inventory Control:** Bulk editing, low stock alerts, and variant management.
- **Jambo Copilot:** An AI assistant embedded in the admin panel to help navigate the dashboard, generate reports, and answer operational questions using your live data.

## 🛠️ Setup & Installation

### 1. Clone and Install
```bash
git clone https://github.com/your-repo/jambo-apparels.git
cd jambo-apparels
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory based on the template below:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key

# Optional: Service Role Key (For server-side operations if running locally)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Configuration (Google Gemini)
# Can be set here for dev, or added via the Admin Settings UI in production
API_KEY=your-gemini-api-key
```

### 3. Database Setup
1. Create a new Supabase project.
2. Go to the SQL Editor in your Supabase dashboard.
3. Copy the contents of `seed.sql` from this repository.
4. Run the script to set up Tables, RLS Policies, Views, and Initial Data.

### 4. Run Locally
```bash
npm run dev
```
Access the app at `http://localhost:5173`.

## 📦 Deployment

This project is optimized for deployment on **Vercel**.

1. Connect your repository to Vercel.
2. Add the Environment Variables defined above in the Vercel Project Settings.
3. Deploy.

The `vercel.json` file handles routing rewrites for Single Page Application (SPA) support and API endpoints.

## 🤖 AI Copilot Configuration

The Admin Dashboard includes "Jambo Copilot," an AI assistant.
1. Navigate to **Admin > App Settings > System**.
2. Enter your **Google Gemini API Key**.
3. The assistant will now be active in the admin panel (bottom right widget or `Cmd+K`).

## 💳 Payment Setup (PayPal)

1. Navigate to **Admin > Shop Settings > Payments**.
2. Enter your **PayPal Client ID** and **Secret**.
3. Toggle "Enable PayPal Checkout".
4. (Optional) Configure Webhooks to receive real-time payment updates.

## 📄 License

This project is proprietary software developed for Jambo Apparels.
