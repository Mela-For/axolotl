import { getSupabaseClient } from "~/supabase_client";
import type { Profile, ProfileInsert } from "../types/Profile";

export async function getProfiles(): Promise<Profile[]> {
	const { data, error } = await getSupabaseClient()
		.from("profiles")
		.select("*");
	if (error) throw error;
	return data;
}

export async function getProfileById(id: string): Promise<Profile | undefined> {
	const { data, error } = await getSupabaseClient()
		.from("profiles")
		.select("*")
		.eq("id", id)
		.single();
	if (error) throw error;
	return data;
}

export async function uploadProfileImage(file: File): Promise<string> {
	const fileExt = file.name.split(".").at(-1) ?? "jpg";
	const fileName = `${crypto.randomUUID()}.${fileExt}`;
	const { error } = await getSupabaseClient()
		.storage.from("profile-images")
		.upload(fileName, file);
	if (error) throw error;
	const { data } = getSupabaseClient()
		.storage.from("profile-images")
		.getPublicUrl(fileName);
	return data.publicUrl;
}

export async function createProfile(data: ProfileInsert): Promise<Profile> {
	const {
		data: { user },
	} = await getSupabaseClient().auth.getUser();
	const { data: newProfile, error } = await getSupabaseClient()
		.from("profiles")
		// biome-ignore lint/style/useNamingConvention: matches database column name
		.insert({ ...data, user_id: user?.id })
		.select()
		.single();
	if (error) throw error;
	return newProfile;
}

export async function updateProfile(
	id: string,
	data: Partial<Profile>,
): Promise<Profile> {
	const { data: updatedProfile, error } = await getSupabaseClient()
		.from("profiles")
		.update(data)
		.eq("id", id)
		.select()
		.single();
	if (error) throw error;
	return updatedProfile;
}

export async function deleteProfile(id: string): Promise<void> {
	const { error } = await getSupabaseClient()
		.from("profiles")
		.delete()
		.eq("id", id);
	if (error) throw error;
}
