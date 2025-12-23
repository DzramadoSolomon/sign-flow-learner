# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/0996b6ad-049b-4891-b118-b69376dab1e0

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/0996b6ad-049b-4891-b118-b69376dab1e0) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/0996b6ad-049b-4891-b118-b69376dab1e0) and click on Share -> Publish.

## Professional Paystack Payment Integration

This project includes a **production-ready Paystack integration** for premium lesson access with full server-side verification and database persistence.

### Setup Steps

#### 1. Environment Variables
Add the following to your `.env` file:

```env
# Public key used by client (replace with your own if necessary)
VITE_PAYSTACK_PK=pk_live_c4cb8389ecb67e39646aea1b7a37aa1182c63ddd
VITE_SUPABASE_URL=your_supabase_url
# Optional: comma separated Paystack channels (e.g., "card,mobile_money")
VITE_PAYSTACK_CHANNELS=card,mobile_money
```

> Note: The app includes this public key as a fallback if `VITE_PAYSTACK_PK` is not set in your environment. For security and tracking, set your own public key in production and ensure the `PAYSTACK_SECRET_KEY` is configured in your Supabase Edge Function.

#### 2. Supabase Configuration
- Run the database migration: `supabase/migrations/20251223_create_lesson_purchases.sql`
  - This creates the `lesson_purchases` table to track all payment transactions
- Deploy the Edge Function: `supabase/functions/verify-payment/index.ts`
  - Set environment variable `PAYSTACK_SECRET_KEY` in your Supabase project settings

#### 3. Get Paystack Keys
- Create a free account at [Paystack.com](https://paystack.com)
- Get your **Public Key** (starts with `pk_test_` or `pk_live_`)
- Set your **Secret Key** in Supabase environment variables

### How It Works

1. **User clicks a premium lesson** (Intermediate or Advanced) in the sidebar
2. **Payment modal opens** asking for email
3. **After payment**, a request goes to Supabase Edge Function which:
   - Verifies the transaction with Paystack API using the secret key
   - Checks amount and transaction status
   - Records the purchase in the `lesson_purchases` table
4. **Sidebar fetches purchases** from the database and unlocks paid lessons
5. **User automatically redirected** to the lesson after successful payment

### Payment Amount
- **Amount**: GH₵10 (configurable in `PaymentDialog.tsx` - `amountGhs={10}`)
- **Currency**: Ghanaian Cedis (GHS)

### Testing
To test with Paystack sandbox:
- Use test Public Key: `pk_test_...` (from your Paystack test account)
- Use test Secret Key in Supabase
- Test card: `4111111111111111` with any future expiry date and CVC

### Production Checklist
- [ ] Switch to live Paystack keys (`pk_live_...`) and set `VITE_PAYSTACK_PK` in your `.env`
- [ ] Add `PAYSTACK_SECRET_KEY` in Supabase Edge Function environment variables
- [ ] Verify your production domain is authorized in Paystack dashboard
- [ ] Confirm live transactions by checking `lesson_purchases` table and Edge Function logs
- [ ] Consider adding webhooks and email receipts for better UX and support

### Security Notes
- Secret key is never exposed to client (only used in Edge Function)
- All payments verified server-side before marking as complete
- Purchase records stored in Supabase with RLS policies
- Email verification ensures users can only access their own purchases

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
