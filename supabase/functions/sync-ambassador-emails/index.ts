import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WaitlistEntry {
  _id?: { $oid: string };
  id: string;
  email: string;
  fullName: string;
  username?: string;
  socials?: Record<string, string>;
  createdAt: string;
}

interface UserWithAmbassador {
  _id?: { $oid: string };
  id: string;
  username?: string;
  ambassadorEmail?: string;
  ambassadorFullName?: string;
  ambassadorTier?: string;
  ambassadorReferralCode?: string;
  ambassadorSyncedAt?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mongoConnectionString = Deno.env.get('MONGO_CONNECTION_STRING');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!mongoConnectionString) {
      throw new Error('MONGO_CONNECTION_STRING not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting ambassador email sync...');

    // Parse MongoDB connection for database name
    const dbMatch = mongoConnectionString.match(/\/([^/?]+)(\?|$)/);
    const dbName = dbMatch ? dbMatch[1] : 'starstore';

    // Use MongoDB Data API or direct connection via proxy
    // Since we have mongo-proxy edge function, let's call it
    const mongoProxyUrl = `${supabaseUrl}/functions/v1/mongo-proxy`;

    let syncedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Sync from ambassador_waitlist collection
    console.log('Fetching from ambassador_waitlist collection...');
    try {
      const waitlistResponse = await fetch(mongoProxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          collection: 'ambassador_waitlist',
          operation: 'find',
          query: {},
          options: { limit: 1000 }
        }),
      });

      if (waitlistResponse.ok) {
        const waitlistResult = await waitlistResponse.json();
        const waitlistEntries: WaitlistEntry[] = waitlistResult.data || [];
        
        console.log(`Found ${waitlistEntries.length} waitlist entries`);

        for (const entry of waitlistEntries) {
          try {
            const { error } = await supabase
              .from('ambassador_emails')
              .upsert({
                email: entry.email?.toLowerCase(),
                full_name: entry.fullName,
                username: entry.username,
                source: 'waitlist',
                mongo_id: entry.id || entry._id?.$oid,
                synced_at: new Date().toISOString(),
              }, {
                onConflict: 'email',
                ignoreDuplicates: false
              });

            if (error) {
              console.error(`Error upserting waitlist entry ${entry.email}:`, error.message);
              errorCount++;
              errors.push(`Waitlist ${entry.email}: ${error.message}`);
            } else {
              syncedCount++;
            }
          } catch (e: unknown) {
            errorCount++;
            const errMsg = e instanceof Error ? e.message : String(e);
            errors.push(`Waitlist ${entry.email}: ${errMsg}`);
          }
        }
      } else {
        const errorText = await waitlistResponse.text();
        console.error('Failed to fetch waitlist:', errorText);
        errors.push(`Waitlist fetch failed: ${errorText}`);
      }
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error('Error fetching waitlist:', errMsg);
      errors.push(`Waitlist fetch error: ${errMsg}`);
    }

    // Sync from users collection (those with ambassadorEmail)
    console.log('Fetching users with ambassador data...');
    try {
      const usersResponse = await fetch(mongoProxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          collection: 'users',
          operation: 'find',
          query: { ambassadorEmail: { $exists: true, $ne: null } },
          options: { limit: 1000 }
        }),
      });

      if (usersResponse.ok) {
        const usersResult = await usersResponse.json();
        const users: UserWithAmbassador[] = usersResult.data || [];
        
        console.log(`Found ${users.length} users with ambassador data`);

        for (const user of users) {
          if (!user.ambassadorEmail) continue;
          
          try {
            const { error } = await supabase
              .from('ambassador_emails')
              .upsert({
                telegram_id: String(user.id),
                email: user.ambassadorEmail?.toLowerCase(),
                full_name: user.ambassadorFullName,
                username: user.username,
                tier: user.ambassadorTier,
                referral_code: user.ambassadorReferralCode,
                source: 'synced',
                mongo_id: user._id?.$oid || String(user.id),
                synced_at: new Date().toISOString(),
              }, {
                onConflict: 'email',
                ignoreDuplicates: false
              });

            if (error) {
              console.error(`Error upserting user ${user.ambassadorEmail}:`, error.message);
              errorCount++;
              errors.push(`User ${user.ambassadorEmail}: ${error.message}`);
            } else {
              syncedCount++;
            }
          } catch (e: unknown) {
            errorCount++;
            const errMsg = e instanceof Error ? e.message : String(e);
            errors.push(`User ${user.ambassadorEmail}: ${errMsg}`);
          }
        }
      } else {
        const errorText = await usersResponse.text();
        console.error('Failed to fetch users:', errorText);
        errors.push(`Users fetch failed: ${errorText}`);
      }
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error('Error fetching users:', errMsg);
      errors.push(`Users fetch error: ${errMsg}`);
    }

    console.log(`Sync complete: ${syncedCount} synced, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        syncedCount,
        errorCount,
        errors: errors.slice(0, 10), // Limit error list
        syncedAt: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Sync error:', errMsg);
    return new Response(
      JSON.stringify({
        success: false,
        error: errMsg,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
