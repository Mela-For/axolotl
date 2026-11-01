import ProfileView from "app/components/ProfileView";
import { getPersonalNotes } from "app/utils/notesDataInterface";
import { useEffect } from "react";
import { redirect, useActionData } from "react-router";
import { useToast } from "~/components/ToastProvider";
import { getConversationLogs } from "~/utils/logDataInterface";
import { deleteProfile, getProfileById } from "~/utils/profileDataInterface";
import type { Route } from "./+types/profiles.$id";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
	const profile = await getProfileById(params.id);
	if (!profile) {
		throw new Response("Not Found", { status: 404 });
	}
	const notes = await getPersonalNotes(params.id);
	const logs = await getConversationLogs(params.id);
	return { profile, notes, logs };
}
clientLoader.hydrate = true as const;

export async function clientAction({ params }: Route.ClientActionArgs) {
	try {
		await deleteProfile(params.id);
		return redirect("/profiles");
	} catch {
		return { error: "Failed to delete profile. Please try again." };
	}
}

export default function ProfilePage({ loaderData }: Route.ComponentProps) {
	const { profile, notes, logs } = loaderData;
	const actionData = useActionData<typeof clientAction>();
	const { addToast } = useToast();

	useEffect(() => {
		if (actionData && "error" in actionData) {
			addToast(actionData.error, "error");
		}
	}, [actionData, addToast]);

	return (
		<ProfileView profile={profile} initialNotes={notes} initialLogs={logs} />
	);
}
