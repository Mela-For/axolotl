import { getSupabaseClient } from "~/supabase_client";
import type { Tables, TablesInsert } from "../types/database.types";

export type ConversationLog = Tables<"conversation_logs">;
export type ConversationLogInsert = TablesInsert<"conversation_logs">;

export async function getConversationLogs(
	profileId: string,
): Promise<ConversationLog[]> {
	const { data, error } = await getSupabaseClient()
		.from("conversation_logs")
		.select("*")
		.eq("profile_id", profileId)
		.order("date", { ascending: false });
	if (error) throw error;
	return data;
}

export async function updateConversationLog(
	id: string,
	content: string,
): Promise<ConversationLog> {
	const { data, error } = await getSupabaseClient()
		.from("conversation_logs")
		.update({ content })
		.eq("id", id)
		.select()
		.single();
	if (error) throw error;
	return data;
}

export async function deleteConversationLog(id: string): Promise<void> {
	const { error } = await getSupabaseClient()
		.from("conversation_logs")
		.delete()
		.eq("id", id);
	if (error) throw error;
}

export async function getLastContactDates(): Promise<Record<string, string>> {
	const { data, error } = await getSupabaseClient()
		.from("conversation_logs")
		.select("profile_id, date")
		.order("date", { ascending: false });
	if (error) throw error;
	const result: Record<string, string> = {};
	for (const { profile_id, date } of data) {
		if (!result[profile_id]) result[profile_id] = date;
	}
	return result;
}

export async function addConversationLog(
	profileId: string,
	content: string,
): Promise<ConversationLog> {
	const { data, error } = await getSupabaseClient()
		.from("conversation_logs")
		.insert({
			// biome-ignore lint/style/useNamingConvention: matches database column name
			profile_id: profileId,
			content,
			date: new Date().toLocaleDateString("en-CA"),
		} as ConversationLogInsert)
		.select()
		.single();
	if (error) throw error;
	return data;
}
