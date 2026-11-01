import { getSupabaseClient } from "~/supabase_client";
import type { Tables, TablesInsert } from "./types/database.types";

export type PersonalNote = Tables<"personal_notes">;
export type PersonalNoteInsert = TablesInsert<"personal_notes">;

export async function getPersonalNotes(
	profileId: string,
): Promise<PersonalNote[]> {
	const { data, error } = await getSupabaseClient()
		.from("personal_notes")
		.select("*")
		.eq("profile_id", profileId);
	if (error) throw error;
	return data;
}

export async function addPersonalNote(
	profileId: string,
	content: string,
): Promise<PersonalNote> {
	const { data, error } = await getSupabaseClient()
		.from("personal_notes")
		// biome-ignore lint/style/useNamingConvention: matches database column name
		.insert({ profile_id: profileId, content } as PersonalNoteInsert)
		.select()
		.single();
	if (error) throw error;
	return data;
}

export async function updatePersonalNote(
	id: string,
	content: string,
): Promise<PersonalNote> {
	const { data, error } = await getSupabaseClient()
		.from("personal_notes")
		.update({ content })
		.eq("id", id)
		.select()
		.single();
	if (error) throw error;
	return data;
}

export async function deletePersonalNote(id: string): Promise<void> {
	const { error } = await getSupabaseClient()
		.from("personal_notes")
		.delete()
		.eq("id", id);
	if (error) throw error;
}
