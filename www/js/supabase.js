const SupabaseConfig = {
    url: "https://cdnkujxjpcjiuhjvhzoi.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbmt1anhqcGNqaXVoanZoem9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMjk3MzgsImV4cCI6MjEwMTkwNTczOH0.COKexmenxm6ZmFj_qFym9FloBTF5aR5PQuRneXVq4Jc",
    table: "services"
};

function validateSupabaseConfig() {
    if (!SupabaseConfig.url || SupabaseConfig.url.includes("YOUR_PROJECT_REF")) {
        throw new Error("Supabase URL ayarlı değil. www/js/supabase.js dosyasındaki SupabaseConfig.url değerini kontrol et.");
    }
    if (!SupabaseConfig.anonKey || SupabaseConfig.anonKey.includes("YOUR_SUPABASE_ANON_KEY")) {
        throw new Error("Supabase anon anahtarı ayarlı değil. www/js/supabase.js dosyasındaki SupabaseConfig.anonKey değerini kontrol et.");
    }
}

const SupabaseClient = (() => {
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
        console.warn("Supabase JS yüklenmedi veya doğru sırada eklenmedi.");
        return null;
    }
    validateSupabaseConfig();
    return window.supabase.createClient(SupabaseConfig.url, SupabaseConfig.anonKey);
})();

function getSupabaseClient() {
    if (!SupabaseClient) {
        throw new Error("Supabase istemcisi başlatılamadı. Supabase scripti ve yapılandırma doğru mu?");
    }
    return SupabaseClient;
}
