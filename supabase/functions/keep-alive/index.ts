import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Track sync timing - sync emails every 30 min (6 pings * 5 min = 30 min)
let pingCount = 0;
const SYNC_EVERY_N_PINGS = 6;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Simple query to keep the database active
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Keep-alive ping failed:', error.message);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Keep-alive ping successful at ${new Date().toISOString()} - ${count} profiles`);

    pingCount++;
    let syncResult = null;

    // Trigger ambassador email sync every 30 minutes (6 pings)
    if (pingCount >= SYNC_EVERY_N_PINGS) {
      pingCount = 0;
      console.log('Triggering ambassador email sync...');
      
      try {
        const syncResponse = await fetch(`${supabaseUrl}/functions/v1/sync-ambassador-emails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
        });
        
        if (syncResponse.ok) {
          syncResult = await syncResponse.json();
          console.log('Email sync completed:', syncResult);
        } else {
          const errorText = await syncResponse.text();
          console.error('Email sync failed:', errorText);
          syncResult = { error: errorText };
        }
      } catch (syncError) {
        console.error('Email sync error:', syncError);
        syncResult = { error: String(syncError) };
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        timestamp: new Date().toISOString(),
        message: 'Database is active',
        pingCount,
        nextEmailSync: SYNC_EVERY_N_PINGS - pingCount,
        emailSyncTriggered: syncResult !== null,
        syncResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Keep-alive error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
