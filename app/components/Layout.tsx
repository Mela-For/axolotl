import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { Link, Outlet, redirect, useNavigate } from "react-router";
import { useToast } from "~/components/ToastProvider";
import { getSupabaseClient } from "~/supabase_client";

export async function clientLoader() {
	const { data } = await getSupabaseClient().auth.getSession();
	if (!data.session) throw redirect("/login");
	return null;
}
clientLoader.hydrate = true as const;

export default function AppLayout() {
	const navigate = useNavigate();
	const { addToast } = useToast();

	async function handleLogout() {
		try {
			await getSupabaseClient().auth.signOut();
			navigate("/login");
		} catch {
			addToast("Failed to log out. Please try again.", "error");
		}
	}

	return (
		<Box>
			<AppBar
				position="static"
				elevation={0}
				sx={{ bgcolor: "#fafaf8", borderBottom: "1px solid #e7e5e4" }}
			>
				<Toolbar sx={{ justifyContent: "space-between" }}>
					<Typography
						component={Link}
						to="/profiles"
						variant="h6"
						sx={{
							color: "text.primary",
							textDecoration: "none",
						}}
					>
						My Network
					</Typography>
					<Box sx={{ display: "flex", gap: 1 }}>
						<Button
							component={Link}
							to="create-profile"
							variant="contained"
							aria-label="Create new profile"
							disableElevation
						>
							New Profile +
						</Button>
						<Button variant="outlined" onClick={handleLogout}>
							Log out
						</Button>
					</Box>
				</Toolbar>
			</AppBar>
			<Box sx={{ p: 3 }}>
				<Outlet />
			</Box>
		</Box>
	);
}
