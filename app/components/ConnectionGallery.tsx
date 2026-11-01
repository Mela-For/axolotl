import {
	Avatar,
	Box,
	Card,
	CardActionArea,
	CardContent,
	Chip,
	Grid,
	Stack,
	Typography,
} from "@mui/material";
import { Link } from "react-router";
import type { Profile } from "~/types/Profile";
import { getContactStatus, STATUS_COLOR } from "~/utils/contactStatus";

interface ConnectionGalleryProps {
	connections: Profile[];
	lastContactDates?: Record<string, string>;
}

const ConnectionGallery = ({
	connections,
	lastContactDates = {},
}: ConnectionGalleryProps) => {
	return (
		<Box sx={{ padding: 3 }}>
			<Box sx={{ mb: 4 }}>
				<Typography variant="h4" gutterBottom>
					Your Network
				</Typography>
				<Typography variant="subtitle1" color="text.secondary">
					{connections.length}{" "}
					{connections.length === 1 ? "connection" : "connections"}
				</Typography>
			</Box>

			<Grid container spacing={3} columns={12}>
				{connections.map((person) => (
					<Grid key={person.id} size={3}>
						<Card elevation={0} sx={{ border: "none", height: "100%" }}>
							<CardActionArea
								component={Link}
								to={`/profiles/${person.id}`}
								disableRipple
								sx={{
									height: "100%",
									"&:hover .MuiCardActionArea-focusHighlight": { opacity: 0 },
								}}
							>
								{person.image ? (
									<Box
										component="img"
										src={person.image}
										alt={person.name}
										sx={{
											width: "100%",
											height: 240,
											objectFit: "cover",
											display: "block",
										}}
									/>
								) : (
									<Box
										sx={{
											width: "100%",
											height: 240,
											bgcolor: "primary.main",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<Avatar
											sx={{
												width: 80,
												height: 80,
												bgcolor: "transparent",
												fontSize: 48,
											}}
										>
											{person.name.charAt(0)}
										</Avatar>
									</Box>
								)}

								<CardContent sx={{ px: 0 }}>
									<Stack
										direction="row"
										spacing={1}
										sx={{ alignItems: "center" }}
									>
										<Typography variant="h6" component="h3">
											{person.name}
										</Typography>
										<Box
											sx={{
												width: 8,
												height: 8,
												borderRadius: "50%",
												bgcolor:
													STATUS_COLOR[
														getContactStatus(lastContactDates[person.id])
													],
												flexShrink: 0,
											}}
										/>
									</Stack>
									{person.job && (
										<Typography variant="subtitle2" color="text.secondary">
											{person.job}
										</Typography>
									)}

									{person.company && (
										<Typography
											variant="body2"
											color="text.secondary"
											gutterBottom
										>
											at {person.company}
										</Typography>
									)}

									{person.industry && (
										<Chip
											label={person.industry}
											size="small"
											color="primary"
											variant="outlined"
											sx={{ mt: 0.5 }}
										/>
									)}

									{[person.location, person.seniority].some(Boolean) && (
										<Typography
											variant="caption"
											color="text.secondary"
											sx={{ display: "block", mt: 1 }}
										>
											{[person.location, person.seniority]
												.filter(Boolean)
												.join(" · ")}
										</Typography>
									)}
								</CardContent>
							</CardActionArea>
						</Card>
					</Grid>
				))}
			</Grid>
		</Box>
	);
};

export default ConnectionGallery;
