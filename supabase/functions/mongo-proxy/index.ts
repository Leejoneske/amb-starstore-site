import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MongoProxyRequest {
  collection: string;
  operation: 'find' | 'findOne' | 'insertOne' | 'updateOne' | 'deleteOne' | 'aggregate';
  query?: any;
  data?: any;
  options?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get MongoDB connection string from environment
    const mongoUri = Deno.env.get('MONGO_CONNECTION_STRING');
    if (!mongoUri) {
      return new Response(
        JSON.stringify({ error: 'MongoDB connection string not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Verify the request is from an authenticated user (optional - you can add admin check)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const { collection, operation, query, data, options }: MongoProxyRequest = await req.json();

    if (!collection || !operation) {
      return new Response(
        JSON.stringify({ error: 'Collection and operation are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Connect to MongoDB
    const client = new MongoClient();
    await client.connect(mongoUri);
    
    const db = client.database('tg-star-store'); // Replace with your actual database name
    const coll = db.collection(collection);

    let result;

    switch (operation) {
      case 'find':
        result = await coll.find(query || {}, options).toArray();
        break;
      
      case 'findOne':
        result = await coll.findOne(query || {}, options);
        break;
      
      case 'insertOne':
        result = await coll.insertOne(data);
        break;
      
      case 'updateOne':
        result = await coll.updateOne(query, data, options);
        break;
      
      case 'deleteOne':
        result = await coll.deleteOne(query);
        break;
      
      case 'aggregate':
        result = await coll.aggregate(query || []).toArray();
        break;
      
      default:
        await client.close();
        return new Response(
          JSON.stringify({ error: `Unsupported operation: ${operation}` }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
    }

    await client.close();

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error: unknown) {
    console.error('MongoDB proxy error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});