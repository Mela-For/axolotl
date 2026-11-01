import { Divider } from "@mui/material";
import { useState } from "react";
import ConnectionGallery from "~/components/ConnectionGallery";
import ProfileFilter from "~/components/ProfileFilter";
import type { Profile } from "~/types/Profile";
import { getLastContactDates } from "~/utils/logDataInterface";
import { getProfiles } from "~/utils/profileDataInterface";
import type { Route } from "./+types/profiles";

export async function clientLoader() {
	const [profiles, lastContactDates] = await Promise.all([
		getProfiles(),
		getLastContactDates(),
	]);
	return { profiles, lastContactDates };
}
clientLoader.hydrate = true as const;

export default function ProfilesPage({ loaderData }: Route.ComponentProps) {
	const { profiles, lastContactDates } = loaderData;
	const [filtered, setFiltered] = useState<Profile[]>(profiles);

	return (
		<div>
			<ProfileFilter profiles={profiles} onFilter={setFiltered} />

			<Divider sx={{ my: 5 }} />

			<ConnectionGallery
				connections={filtered}
				lastContactDates={lastContactDates}
			/>
		</div>
	);
}
