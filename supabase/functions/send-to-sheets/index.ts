import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, timestamp, latitude, longitude, room_number } = await req.json();
    
    console.log('Sending attendance to Google Sheets:', { name, timestamp, latitude, longitude, room_number });
    
    const webhookUrl = Deno.env.get('GOOGLE_SHEETS_WEBHOOK_URL');
    
    if (!webhookUrl) {
      console.error('GOOGLE_SHEETS_WEBHOOK_URL not configured');
      throw new Error('Google Sheets webhook URL not configured');
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        timestamp,
        latitude,
        longitude,
        room_number,
        date: new Date(timestamp).toLocaleDateString(),
        time: new Date(timestamp).toLocaleTimeString(),
      }),
    });

    console.log('Google Sheets response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Sheets error:', errorText);
      throw new Error(`Failed to send to Google Sheets: ${errorText}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Attendance sent to Google Sheets' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in send-to-sheets function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
