import {
	Box,
	Button,
	Container,
	Link as MuiLink,
	TextField,
	Typography,
} from "@mui/material";
import {
	Form,
	Link as RouterLink,
	redirect,
	useActionData,
	useNavigation,
} from "react-router";
import { getSupabaseClient } from "~/supabase_client";
import type { Route } from "./+types/login";

export async function clientAction({ request }: Route.ClientActionArgs) {
	const formData = await request.formData();
	const email = formData.get("email")?.toString().trim() ?? "";
	const password = formData.get("password")?.toString() ?? "";

	if (!email) return { error: "Email is required." };
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
		return { error: "Please enter a valid email address." };
	if (!password) return { error: "Password is required." };

	const { error } = await getSupabaseClient().auth.signInWithPassword({
		email,
		password,
	});
	if (error) return { error: error.message };
	return redirect("/profiles");
}

export default function LoginPage() {
	const actionData = useActionData<typeof clientAction>();
	const navigation = useNavigation();
	const loading = navigation.state === "submitting";

	return (
		<Container maxWidth="xs">
			<Box
				sx={{
					mt: 12,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 2,
				}}
			>
				<Typography variant="h4">My Network</Typography>
				<Typography variant="body2" color="text.secondary">
					Sign in to access your contacts
				</Typography>

				<Box sx={{ width: "100%", mt: 1 }}>
					<Form method="post">
						<TextField
							label="Email"
							type="email"
							name="email"
							fullWidth
							required
							margin="normal"
						/>
						<TextField
							label="Password"
							type="password"
							name="password"
							fullWidth
							required
							margin="normal"
						/>
						<Typography variant="body2" sx={{ mt: 1, textAlign: "right" }}>
							<MuiLink
								component={RouterLink}
								to="/forgot-password"
								color="inherit"
								underline="hover"
							>
								Forgot password?
							</MuiLink>
						</Typography>

						{actionData?.error && (
							<Typography color="error" variant="body2" sx={{ mt: 1 }}>
								{actionData.error}
							</Typography>
						)}

						<Button
							type="submit"
							fullWidth
							variant="contained"
							disableElevation
							disabled={loading}
							sx={{ mt: 2 }}
						>
							{loading ? "Signing in..." : "Sign in"}
						</Button>

						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mt: 2, textAlign: "center" }}
						>
							Don't have an account?{" "}
							<MuiLink
								component={RouterLink}
								to="/signup"
								color="inherit"
								underline="hover"
							>
								Sign up
							</MuiLink>
						</Typography>
					</Form>
				</Box>
			</Box>
		</Container>
	);
}
