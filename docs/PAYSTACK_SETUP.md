# Paystack Payment Integration Setup Guide

## Quick Start

### 1. Get Paystack Keys
1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Navigate to **Settings → API Keys & Webhooks**
3. Copy your **Public Key** (test or live)
4. Copy your **Secret Key** (you'll need this for Supabase)

### 2. Add to `.env` File
```env
VITE_PAYSTACK_PK=pk_test_your_public_key_here
VITE_SUPABASE_URL=https://your-project.supabase.co
```

### 3. Deploy Supabase Migration
Run this migration to create the payment tracking table:
```bash
supabase migration up
```

Or manually run the SQL from: `supabase/migrations/20251223_create_lesson_purchases.sql`

### 4. Set Up Supabase Edge Function
1. In Supabase dashboard, go to **Edge Functions**
2. Create a new function named `verify-payment`
3. Copy contents from: `supabase/functions/verify-payment/index.ts`
4. Deploy it
5. Add environment variable:
   - **Key**: `PAYSTACK_SECRET_KEY`
   - **Value**: Your Paystack Secret Key

### 5. Test the Flow

#### Test Mode (Recommended First)
- Use test Public Key (`pk_test_...`)
- Use test Secret Key in Supabase
- Test card: `4111111111111111`
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits

#### Testing Steps
1. Start dev server: `npm run dev`
2. Go to **Lessons** page
3. Click an **Intermediate** lesson in sidebar
4. Enter email: `test@example.com`
5. Click **"Pay GH₵10"**
6. Enter card details
7. Click **Confirm**
8. Should see "Payment successful!" and redirect to lesson

### 6. Go Live
- Replace test key with live key (`pk_live_...`)
- Update Secret Key in Supabase
- First real transaction will be charged immediately
- All payments tracked in `lesson_purchases` table

## Troubleshooting

### "Paystack public key not configured"
- Check `.env` file has `VITE_PAYSTACK_PK` set
- Verify format: `pk_test_` or `pk_live_`
- Restart dev server after adding to `.env`

### "Payment verification failed"
- Ensure Paystack Secret Key is set in Supabase
- Check that Edge Function is deployed
- Verify function has correct environment variables
- Check Supabase function logs for errors

### "Unable to insert purchase record"
- Ensure database migration ran successfully
- Check `lesson_purchases` table exists in Supabase
- Verify RLS policies are in place
- Check user email matches in payment form

### Payment modal won't close
- Check browser console for errors
- Verify all required fields are filled
- Ensure Paystack script loaded (check Network tab)
- Try in incognito mode to rule out cache issues

## Files Modified/Created

1. **Database**: `supabase/migrations/20251223_create_lesson_purchases.sql`
2. **Edge Function**: `supabase/functions/verify-payment/index.ts`
3. **Components**: `src/components/PaymentDialog.tsx` (updated)
4. **Components**: `src/components/AppSidebar.tsx` (updated)
5. **Docs**: This file and `README.md`

## What Happens Behind the Scenes

```
User clicks premium lesson
    ↓
Payment dialog opens → User enters email
    ↓
User clicks "Pay" button → Paystack modal opens
    ↓
User enters card details
    ↓
Paystack processes payment → Returns transaction reference
    ↓
Dialog calls Supabase Edge Function with reference
    ↓
Edge Function verifies with Paystack API
    ↓
If valid → Records purchase in database
    ↓
Dialog shows success → Closes → Redirects to lesson
    ↓
Sidebar fetches purchases from database
    ↓
Lesson unlocked for user
```

## Amount Configuration

To change the payment amount:

1. **In PaymentDialog.tsx**:
   ```tsx
   amountGhs={10}  // Change to desired amount
   ```

2. **In AppSidebar.tsx**:
   ```tsx
   amountGhs={10}  // Change to same amount
   ```

Remember to update everywhere it's used!

## Support

- **Paystack Docs**: https://paystack.com/docs/api/
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **Test Cards**: https://paystack.com/docs/payments/testing/
