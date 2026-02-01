# 📱 SMS Setup Guide: Text-Based Confirmations & Reminders

Your Playdate Matcher app now uses **SMS text messages** instead of email for all notifications!

**Why SMS?**
- ✅ 98% open rate (vs 20% for email)
- ✅ Read within 3 minutes on average
- ✅ No spam folders
- ✅ Perfect for busy parents
- ✅ Works without internet (once received)

---

## 🚀 Quick Setup (15 minutes total)

### Step 1: Set Up Supabase Database (5 minutes)

1. **Create account** at [supabase.com](https://supabase.com)
   - Click "Start your project"
   - Sign up (it's free!)

2. **Create new project**
   - Project name: "playdate-matcher"
   - Set a database password (save it!)
   - Choose nearest region

3. **Run SQL setup**
   - Go to SQL Editor (sidebar)
   - Click "New Query"
   - Copy/paste entire `supabase-setup.sql` file
   - Click "Run"

4. **Get credentials**
   - Go to Settings → API
   - Copy your **Project URL**
   - Copy your **anon public** key

---

### Step 2: Set Up Twilio for SMS (5 minutes)

1. **Sign up** at [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
   - You get **$15 free credit** = ~1,900 text messages!
   - No credit card needed to start

2. **Verify your phone**
   - They'll send you a code
   - This lets you test with your own number

3. **Get a phone number**
   - Click "Get a phone number"
   - Choose any number (costs $1/month)
   - Make sure it has **SMS capability**

4. **Get your credentials**
   - Go to Account → Account Info
   - Copy **Account SID** (starts with AC...)
   - Copy **Auth Token** (click "view" to reveal)
   - Copy your **Twilio Phone Number** (format: +15551234567)

---

### Step 3: Connect Everything (5 minutes)

1. **Update your app code**
   
   In `playdate-matcher-with-backend.jsx`, replace these lines:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
   
   With your actual Supabase values:
   ```javascript
   const SUPABASE_URL = 'https://xxxxx.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   ```

2. **Add Twilio secrets to Supabase**
   
   - In Supabase, go to Settings → Edge Functions
   - Add these three secrets:
   
   | Name | Value |
   |------|-------|
   | `TWILIO_ACCOUNT_SID` | AC123... (your Account SID) |
   | `TWILIO_AUTH_TOKEN` | abc123... (your Auth Token) |
   | `TWILIO_PHONE_NUMBER` | +15551234567 (your Twilio number) |

3. **Deploy the SMS function**
   
   Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```
   
   Login:
   ```bash
   supabase login
   ```
   
   Link your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   (Get YOUR_PROJECT_REF from Supabase Settings → General → Reference ID)
   
   Create function folder:
   ```bash
   mkdir -p supabase/functions/send_sms_notification
   ```
   
   Copy `sms-function.js` to `supabase/functions/send_sms_notification/index.ts`
   
   Deploy:
   ```bash
   supabase functions deploy send_sms_notification
   ```

4. **Create SMS logs table**
   
   In Supabase SQL Editor, run:
   ```sql
   CREATE TABLE sms_logs (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     playdate_id UUID REFERENCES playdates(id),
     phone_number TEXT NOT NULL,
     message_type TEXT NOT NULL,
     status TEXT,
     twilio_sid TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Enable RLS
   ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Allow all access to sms_logs" ON sms_logs FOR ALL USING (true);
   ```

---

## 🎉 Done! Now Test It

1. **Deploy your app** (Netlify Drop, GitHub Pages, or Vercel)

2. **Create a profile** with your real phone number

3. **Create a test playdate**

4. **Click "Confirm & Send SMS"**

5. **Check your phone** - you should receive:
   ```
   ✅ Playdate Confirmed!
   
   Park Playdate
   📅 Sat, Feb 1 at 3:00 PM
   📍 Central Park
   
   Organized by Emma's family
   Reply STOP to unsubscribe
   ```

---

## 💰 Cost Calculator

### Your Costs:

| Item | Price | Notes |
|------|-------|-------|
| **Supabase** | $0 | Free tier (500MB database) |
| **Twilio Phone** | $1/month | One phone number |
| **SMS (US/Canada)** | $0.0079/text | ~$0.79 per 100 texts |

### Example Scenarios:

**10 parents, 2 playdates/month:**
- 10 confirmations = $0.08
- 10 reminders = $0.08
- **Total: ~$1.16/month**

**50 parents, 4 playdates/month:**
- 50 × 2 texts × 4 events = 400 texts
- 400 × $0.0079 = $3.16
- **Total: ~$4.16/month**

**100 parents, 4 playdates/month:**
- 100 × 2 texts × 4 events = 800 texts
- 800 × $0.0079 = $6.32
- **Total: ~$7.32/month**

🎁 Remember: Twilio gives you **$15 free credit** to start!

---

## 📱 What Parents Will Receive

### When a playdate is confirmed:
```
✅ Playdate Confirmed!

Swimming at the Pool
📅 Sat, Feb 1 at 3:00 PM
📍 Community Pool

Organized by Emma's family
Reply STOP to unsubscribe
```

### 24 hours before the playdate:
```
🔔 Reminder: Your playdate is tomorrow!

Swimming at the Pool
📅 Sat, Feb 1 at 3:00 PM
📍 Community Pool

See you there! 🎉
```

### For plan changes:
```
📢 Playdate Update:

Swimming at the Pool
Location changed to Indoor Pool 
(it might rain!)

Contact: (555) 123-4567
```

---

## 🔔 Setting Up Automated Reminders

To send reminders 24 hours before playdates automatically:

### Option 1: GitHub Actions (Free, Easiest)

Create `.github/workflows/send-reminders.yml`:

```yaml
name: Send Playdate Reminders

on:
  schedule:
    - cron: '0 9 * * *'  # 9 AM UTC every day

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Send reminders
        run: |
          curl -X POST 'https://YOUR_PROJECT.supabase.co/rest/v1/rpc/send_daily_reminders' \
            -H 'apikey: ${{ secrets.SUPABASE_ANON_KEY }}' \
            -H 'Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}' \
            -H 'Content-Type: application/json'
```

Then create the database function in Supabase SQL Editor:

```sql
CREATE OR REPLACE FUNCTION send_daily_reminders()
RETURNS void AS $$
DECLARE
  playdate RECORD;
BEGIN
  FOR playdate IN 
    SELECT p.id, p.title, p.date, p.time, p.location, pr.parent_phone
    FROM playdates p
    JOIN profiles pr ON p.creator_id = pr.id
    WHERE p.status = 'confirmed'
    AND p.date = (CURRENT_DATE + INTERVAL '1 day')::TEXT
  LOOP
    -- Call SMS function via HTTP
    PERFORM net.http_post(
      url := 'https://YOUR_PROJECT.supabase.co/functions/v1/send_sms_notification',
      headers := jsonb_build_object(
        'Authorization', 'Bearer YOUR_ANON_KEY',
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'playdate_id', playdate.id,
        'phone_number', playdate.parent_phone,
        'message_type', 'reminder'
      )
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Option 2: Supabase Cron (Requires Paid Plan)

If you upgrade to Supabase Pro ($25/month), you can use built-in cron:

```sql
SELECT cron.schedule(
  'send-playdate-reminders',
  '0 9 * * *',  -- 9 AM every day
  'SELECT send_daily_reminders();'
);
```

---

## 🌍 International SMS Rates

If your parents are outside US/Canada:

| Country | Rate/SMS | Example Cost (100 texts) |
|---------|----------|--------------------------|
| **United States** | $0.0079 | $0.79 |
| **Canada** | $0.0079 | $0.79 |
| **United Kingdom** | $0.040 | $4.00 |
| **Australia** | $0.080 | $8.00 |
| **India** | $0.020 | $2.00 |
| **Mexico** | $0.018 | $1.80 |

💡 **Pro tip**: For international users, consider WhatsApp Business API (free messaging, but harder to set up).

---

## ⚖️ Legal & Compliance

### Required Elements:

1. **Opt-out mechanism** ✅ Already included
   - Every message has "Reply STOP to unsubscribe"
   - Twilio handles STOP/UNSTOP automatically

2. **Clear purpose** ✅ 
   - Parents know they're signing up for playdate notifications
   - Messages are transactional, not marketing

3. **Consent** ✅
   - By entering their phone number, parents consent
   - Consider adding checkbox: "I agree to receive SMS notifications"

### Best Practices:

- ✅ Only send playdate-related messages
- ✅ Don't send late night (after 9pm) or early morning (before 8am)
- ✅ Keep messages concise (under 160 characters when possible)
- ✅ Always include who it's from
- ✅ Make it easy to opt out

---

## 🔧 Advanced Features You Can Add

### 1. Two-Way SMS (Parents Can Reply)

Add webhook handling in Supabase:

```javascript
// Handle incoming SMS from parents
const handleIncomingSMS = async (req) => {
  const { From, Body } = await req.json();
  
  // Check for keywords
  if (Body.toUpperCase().includes('YES')) {
    // Mark as confirmed
  } else if (Body.toUpperCase().includes('NO')) {
    // Mark as declined
  } else if (Body.toUpperCase().includes('MAYBE')) {
    // Mark as maybe
  }
};
```

### 2. Quick RSVP Links

Include a link in SMS:
```
✅ Playdate Confirmed!

Park Playdate
📅 Sat, Feb 1 at 3pm

Tap to RSVP: https://your-app.com/rsvp/abc123
```

### 3. Group SMS Threading

Create group threads for each playdate so parents can chat.

### 4. Smart Scheduling

Send reminders at optimal times based on playdate time:
- Morning playdate → Reminder night before
- Afternoon playdate → Reminder morning of
- Evening playdate → Reminder afternoon of

---

## 🆘 Troubleshooting

### Problem: "SMS not being sent"

**Check:**
1. Is your Twilio account verified?
2. Does your phone number have SMS capability?
3. Are your secrets set correctly in Supabase?
4. Check Twilio logs at console.twilio.com

**Common fix:**
```bash
# Redeploy the function
supabase functions deploy send_sms_notification
```

### Problem: "Invalid phone number"

**Fix:** Make sure phone numbers are in E.164 format:
- ✅ `+15551234567`
- ❌ `(555) 123-4567`
- ❌ `555-123-4567`

Add phone formatting in your app:
```javascript
const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`;
};
```

### Problem: "Free trial restrictions"

Twilio trial accounts can only send to **verified numbers**.

**Fix:**
1. Upgrade to paid account (just add $20)
2. Or verify recipient phone numbers in Twilio console

### Problem: "Messages are concatenated"

SMS messages over 160 characters are split and cost multiple segments.

**Fix:** Keep messages short or be aware of segment costs:
- 1-160 characters = 1 segment = $0.0079
- 161-306 characters = 2 segments = $0.0158
- 307-459 characters = 3 segments = $0.0237

---

## 📊 Monitoring & Analytics

### Track SMS Performance:

Add analytics to your `sms_logs` table:

```sql
-- View SMS stats
SELECT 
  message_type,
  COUNT(*) as total_sent,
  COUNT(DISTINCT phone_number) as unique_recipients,
  DATE(created_at) as date
FROM sms_logs
GROUP BY message_type, DATE(created_at)
ORDER BY date DESC;

-- Check delivery success rate
SELECT 
  status,
  COUNT(*) as count
FROM sms_logs
GROUP BY status;
```

### Twilio Dashboard:

Check real-time stats at console.twilio.com:
- Messages sent
- Delivery rate
- Errors
- Costs

---

## 🎓 Next Steps

Once SMS is working, consider:

1. **WhatsApp Integration**
   - Free messaging
   - Richer media (photos, videos)
   - Better international reach

2. **Parent Preferences**
   - Let parents choose SMS vs WhatsApp vs Email
   - Set notification preferences

3. **Smart Grouping**
   - Batch multiple playdates in one message
   - "You have 3 upcoming playdates this week..."

4. **Read Receipts**
   - Track who opened the text
   - Follow up with those who didn't

5. **Template Library**
   - Pre-written messages for common scenarios
   - "Running late" template
   - "Weather update" template

---

## 💡 Pro Tips

1. **Test everything with your own number first**
2. **Start with small batches** before scaling
3. **Monitor costs daily** in Twilio dashboard
4. **Set up billing alerts** (Settings → Billing)
5. **Keep an emergency contact** for critical updates
6. **Back up with email** for detailed info

---

## 📚 Resources

- [Twilio SMS Quickstart](https://www.twilio.com/docs/sms/quickstart)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [SMS Best Practices](https://www.twilio.com/docs/sms/best-practices)
- [International Regulations](https://www.twilio.com/docs/sms/compliance)

---

**Questions?** I'm here to help! Just ask. 🚀

**Cost too high?** Let me know and I can show you free alternatives like WhatsApp or Telegram.
