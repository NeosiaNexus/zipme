import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SERVICE_SUPABASESERVICE_KEY!);

export default supabase;