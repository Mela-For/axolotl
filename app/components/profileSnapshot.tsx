import { Avatar } from "@mui/material";
import { Typography } from "@mui/material";
import type { Profile } from "../types/Profile";

// creates new type for ProfileSnapshot component props
type ProfileSnapshotProps = {
	profile: Profile;
};

// profile prop of ProfileSnapshotProps type is used to display profile information in the component
export default function ProfileSnapshot({ profile }: ProfileSnapshotProps) {
	return (
		<div>
			{profile.image ? (
				<Avatar
					src={profile.image}
					alt={profile.name}
					sx={{ width: 80, height: 80 }}
				/>
			) : (
				<Avatar
					role="img"
					aria-label={profile.name}
					sx={{ width: 80, height: 80, bgcolor: "primary.main", fontSize: 32 }}
				>
					{profile.name.charAt(0)}
				</Avatar>
			)}
			<Typography variant="h6">{profile.name}</Typography>
			<Typography variant="body2" color="text.secondary">
				{profile.industry}
			</Typography>
		</div>
	);
}
