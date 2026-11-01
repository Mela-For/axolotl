import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/types/database.types";

let client: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
	if (client) return client;

	const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
	const supabasePubKey = import.meta.env.VITE_SUPABASE_PUB_KEY;

	if (!supabaseUrl || !supabasePubKey) {
		throw new Error(
			"Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUB_KEY environment variables",
		);
	}

	client = createClient<Database>(supabaseUrl, supabasePubKey);
	return client;
}
