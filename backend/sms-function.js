// SUPABASE EDGE FUNCTION: send_sms_notification
// Sends SMS confirmations and reminders using Twilio

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')!
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')! // e.g., +15551234567

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const { playdate_id, phone_number, message_type } = await req.json()
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get playdate details
    const { data: playdate, error } = await supabase
      .from('playdates')
      .select(`
        *,
        profiles (
          kid_name,
          parent_phone
        )
      `)
      .eq('id', playdate_id)
      .single()
    
    if (error) throw error
    
    // Craft the message based on type
    let message = ''
    
    if (message_type === 'confirmation') {
      message = `✅ Playdate Confirmed!

${playdate.title || 'Playdate'}
📅 ${formatDate(playdate.date)} at ${playdate.time}
${playdate.location ? `📍 ${playdate.location}` : ''}

Organized by ${playdate.profiles.kid_name}'s family
Reply STOP to unsubscribe`
    } else if (message_type === 'reminder') {
      message = `🔔 Reminder: Your playdate is tomorrow!

${playdate.title || 'Playdate'}
📅 ${formatDate(playdate.date)} at ${playdate.time}
${playdate.location ? `📍 ${playdate.location}` : ''}

See you there! 🎉`
    } else if (message_type === 'update') {
      message = `📢 Playdate Update:

${playdate.title || 'Playdate'}
${playdate.notes}

Contact: ${playdate.profiles.parent_phone}`
    }
    
    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
    
    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: phone_number,
        From: TWILIO_PHONE_NUMBER,
        Body: message
      })
    })
    
    if (!twilioResponse.ok) {
      const errorData = await twilioResponse.json()
      throw new Error(`Twilio error: ${errorData.message}`)
    }
    
    const result = await twilioResponse.json()
    
    // Log the SMS for tracking
    await supabase.from('sms_logs').insert({
      playdate_id,
      phone_number,
      message_type,
      status: result.status,
      twilio_sid: result.sid
    })
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully',
        sid: result.sid 
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('SMS error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })
}

/* 
SETUP INSTRUCTIONS:

1. Sign up for Twilio:
   - Go to https://twilio.com/try-twilio
   - Get $15 free credit
   - Verify your personal phone number

2. Get a Twilio phone number:
   - Go to Phone Numbers → Buy a Number
   - Choose a local number ($1/month)
   - Enable SMS capability

3. Get your credentials:
   - Dashboard → Account Info
   - Copy Account SID
   - Copy Auth Token

4. Add to Supabase secrets:
   - TWILIO_ACCOUNT_SID
   - TWILIO_AUTH_TOKEN
   - TWILIO_PHONE_NUMBER (format: +15551234567)

5. Create SMS logs table (in Supabase SQL Editor):
   CREATE TABLE sms_logs (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     playdate_id UUID REFERENCES playdates(id),
     phone_number TEXT NOT NULL,
     message_type TEXT NOT NULL,
     status TEXT,
     twilio_sid TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

6. Deploy:
   supabase functions deploy send_sms_notification

COST BREAKDOWN:
- Phone number: $1/month
- SMS (US/Canada): $0.0079 per message
- Free credit: $15 = ~1,900 messages

For 100 parents with 2 playdates/month:
- 100 confirmations = $0.79
- 100 reminders = $0.79
- Total: ~$2.58/month + $1 phone = $3.58/month

INTERNATIONAL RATES:
- UK: $0.04/SMS
- Australia: $0.08/SMS
- India: $0.02/SMS
Check full pricing at: https://www.twilio.com/sms/pricing

COMPLIANCE:
- Always include "Reply STOP to unsubscribe"
- Honor opt-out requests immediately
- Don't send marketing after opt-out
- Keep messages under 160 characters (or pay for multiple segments)
*/
