import { ImageAnnotatorClient } from 'npm:@google-cloud/vision@4.0.2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      throw new Error('No image provided');
    }

    // Initialize Vision client
    const client = new ImageAnnotatorClient({
      credentials: JSON.parse(Deno.env.get('GOOGLE_CLOUD_CREDENTIALS') || '{}'),
    });

    // Convert image to base64
    const buffer = await image.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(buffer)));

    // Detect text in image
    const [result] = await client.textDetection({
      image: {
        content: base64Image
      }
    });

    const detections = result.textAnnotations;
    if (!detections?.length) {
      throw new Error('No text detected in image');
    }

    // Extract menu items and quantities
    const text = detections[0].description;
    const menuItems = text.split('\n')
      .filter(line => /^[\w\s]+((\d+(\.\d+)?)\s*(kg|g|pcs|pieces|items|portions|servings|ml|l))/i.test(line))
      .map(line => {
        const [name, ...rest] = line.split(/(\d+)/);
        const quantity = rest.join('').trim();
        return { name: name.trim(), quantity };
      });

    return new Response(
      JSON.stringify({ 
        success: true,
        items: menuItems
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process image'
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