window.SYNAPZ_SUPABASE_CONFIG = {
    url: "https://pngooxhruzwolvwrypbe.supabase.co",
    publishableKey: "sb_publishable_4Cx0H4wmH9F1jNS4rl_lkg_V6lWegHg"
};


const supabaseClient = window.supabase.createClient(
    window.SYNAPZ_SUPABASE_CONFIG.url,
    window.SYNAPZ_SUPABASE_CONFIG.publishableKey,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    }
);