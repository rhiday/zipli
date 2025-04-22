// MessageBird verification edge function
import { initClient } from 'npm:messagebird@4.0.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface VerifyRequest {
  to: string;
  action: 'send' | 'check' | 'skip';
  code?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { to, action, code }: VerifyRequest = await req.json();

    if (!to || !action) {
      throw new Error('Missing required parameters');
    }

    // Allow skipping verification
    if (action === 'skip') {
      return new Response(
        JSON.stringify({ success: true, skipped: true }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
          status: 200,
        }
      );
    }

    const apiKey = Deno.env.get("MESSAGEBIRD_API_KEY");
    if (!apiKey) {
      throw new Error('Missing MessageBird configuration');
    }

    const messagebird = initClient(apiKey);

    if (action === 'send') {
      // Send verification SMS
      await messagebird.verify.create(to, {
        template: "Your Zipli verification code is %token",
        type: "sms",
        timeout: 600, // 10 minutes
        tokenLength: 6
      });

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
          status: 200,
        }
      );
    } else if (action === 'check' && code) {
      // Verify the code
      const verification = await messagebird.verify.verify(to, code);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          valid: verification.status === "verified"
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
          status: 200,
        }
      );
    }

    throw new Error('Invalid action');
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Verification failed' 
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});