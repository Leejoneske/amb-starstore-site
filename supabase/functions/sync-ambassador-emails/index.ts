import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// StarStore API configuration
const STARSTORE_URL = 'https://starstore.site';
const AMBASSADOR_API_KEY = 'amb_starstore_secure_key_2024';

interface WaitlistEntry {
  id: string;
  _id?: string;
  email: string;
  fullName: string;
  username?: string;
  socials?: Record<string, string>;
  createdAt: string;
}

interface StarStoreUser {
  id: string;
  username?: string;
  ambassadorEmail?: string;
  ambassadorFullName?: string;
  ambassadorTier?: string;
  ambassadorReferralCode?: string;
  ambassadorSyncedAt?: string;
  isAmbassador?: boolean;
}

// Helper to fetch from StarStore API with timeout
async function fetchFromStarStore<T>(endpoint: string): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

    console.log(`Fetching: ${STARSTORE_URL}${endpoint}`);
    
    const response = await fetch(`${STARSTORE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Ambassador-Dashboard/1.0',
        'X-API-Key': AMBASSADOR_API_KEY,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`StarStore API error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    console.log(`Successfully fetched data from ${endpoint}`);
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`Request timeout for ${endpoint}`);
    } else {
      console.error(`Failed to fetch from StarStore: ${error}`);
    }
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting ambassador email sync from StarStore API...');

    let syncedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Method 1: Fetch ambassador waitlist entries
    console.log('Fetching ambassador waitlist from StarStore...');
    try {
      const waitlistData = await fetchFromStarStore<{ success: boolean; waitlist: WaitlistEntry[] }>('/api/admin/ambassador-waitlist');
      
      if (waitlistData && waitlistData.success && waitlistData.waitlist) {
        console.log(`Found ${waitlistData.waitlist.length} waitlist entries`);

        for (const entry of waitlistData.waitlist) {
          if (!entry.email) continue;
          
          try {
            const { error } = await supabase
              .from('ambassador_emails')
              .upsert({
                email: entry.email.toLowerCase(),
                full_name: entry.fullName || entry.username,
                username: entry.username,
                mongo_id: entry._id || entry.id,
                source: 'waitlist',
                synced_at: new Date().toISOString(),
              }, {
                onConflict: 'email',
                ignoreDuplicates: false
              });

            if (error) {
              console.error(`Error upserting waitlist ${entry.email}:`, error.message);
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
        console.warn('No waitlist data returned from StarStore API - endpoint may not exist yet');
      }
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error('Error fetching waitlist from StarStore:', errMsg);
      errors.push(`Waitlist fetch error: ${errMsg}`);
    }

    // Method 2: Fetch users with ambassador data
    console.log('Fetching users with ambassador data from StarStore...');
    try {
      const usersData = await fetchFromStarStore<{ users: StarStoreUser[] }>('/api/admin/users-data?limit=1000');
      
      if (usersData && usersData.users) {
        const ambassadorUsers = usersData.users.filter(
          (user: StarStoreUser) => user.ambassadorEmail || user.isAmbassador
        );
        
        console.log(`Found ${ambassadorUsers.length} users with ambassador data`);

        for (const user of ambassadorUsers) {
          if (!user.ambassadorEmail) continue;
          
          try {
            const { error } = await supabase
              .from('ambassador_emails')
              .upsert({
                telegram_id: String(user.id),
                email: user.ambassadorEmail.toLowerCase(),
                full_name: user.ambassadorFullName || user.username,
                username: user.username,
                tier: user.ambassadorTier,
                referral_code: user.ambassadorReferralCode,
                source: 'starstore_user',
                mongo_id: String(user.id),
                synced_at: new Date().toISOString(),
              }, {
                onConflict: 'email',
                ignoreDuplicates: false
              });

            if (error) {
              console.error(`Error upserting ambassador user ${user.ambassadorEmail}:`, error.message);
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
        console.warn('No users data returned from StarStore API');
      }
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error('Error fetching users from StarStore:', errMsg);
      errors.push(`Users fetch error: ${errMsg}`);
    }

    // Method 3: Extract ambassador info from referrals
    console.log('Fetching ambassador data from referrals...');
    try {
      const referralsData = await fetchFromStarStore<{ referrals: Array<{ referrerUserId: string; referrerUsername?: string; referrerIsAmbassador?: boolean; referrerTier?: string }> }>('/api/admin/referrals-data?limit=1000');
      
      if (referralsData && referralsData.referrals) {
        const ambassadorReferrers = new Map<string, { username?: string; tier?: string }>();
        
        for (const ref of referralsData.referrals) {
          if (ref.referrerIsAmbassador && ref.referrerUserId) {
            ambassadorReferrers.set(ref.referrerUserId, {
              username: ref.referrerUsername,
              tier: ref.referrerTier
            });
          }
        }
        
        console.log(`Found ${ambassadorReferrers.size} unique ambassador referrers`);
        
        for (const [telegramId, data] of ambassadorReferrers) {
          if (!data.username) continue;
          
          try {
            // Check if we already have this ambassador by telegram_id
            const { data: existing } = await supabase
              .from('ambassador_emails')
              .select('id')
              .eq('telegram_id', telegramId)
              .maybeSingle();
            
            if (!existing) {
              // Create placeholder entry
              const { error } = await supabase
                .from('ambassador_emails')
                .upsert({
                  telegram_id: telegramId,
                  username: data.username,
                  tier: data.tier,
                  source: 'referral_tracker',
                  email: `pending_${telegramId}@starstore.placeholder`,
                  synced_at: new Date().toISOString(),
                }, {
                  onConflict: 'email',
                  ignoreDuplicates: true
                });
              
              if (!error) {
                syncedCount++;
              }
            }
          } catch (e: unknown) {
            // Silently ignore duplicate errors
          }
        }
      }
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error('Error processing referrals:', errMsg);
    }

    console.log(`Sync complete: ${syncedCount} synced, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        syncedCount,
        errorCount,
        errors: errors.slice(0, 10),
        syncedAt: new Date().toISOString(),
        source: 'starstore_api'
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
