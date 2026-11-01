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
	useActionData,
	useNavigation,
} from "react-router";
import { getSupabaseClient } from "~/supabase_client";
import type { Route } from "./+types/forgot-password";

export async function clientAction({ request }: Route.ClientActionArgs) {
	const formData = await request.formData();
	const email = formData.get("email")?.toString().trim() ?? "";

	if (!email) return { error: "Email is required." };
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
		return { error: "Please enter a valid email address." };

	const { error } = await getSupabaseClient().auth.resetPasswordForEmail(
		email,
		{ redirectTo: `${window.location.origin}/reset-password` },
	);
	if (error) return { error: error.message };
	return { message: "Check your email for a password reset link." };
}

export default function ForgotPasswordPage() {
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
				<Typography variant="h4">Reset Password</Typography>
				<Typography variant="body2" color="text.secondary">
					Enter your email and we'll send you a reset link.
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

						{actionData?.error && (
							<Typography color="error" variant="body2" sx={{ mt: 1 }}>
								{actionData.error}
							</Typography>
						)}

						{actionData?.message && (
							<Typography color="success.main" variant="body2" sx={{ mt: 1 }}>
								{actionData.message}
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
							{loading ? "Sending..." : "Send reset link"}
						</Button>

						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mt: 2, textAlign: "center" }}
						>
							Remember your password?{" "}
							<MuiLink
								component={RouterLink}
								to="/login"
								color="inherit"
								underline="hover"
							>
								Sign in
							</MuiLink>
						</Typography>
					</Form>
				</Box>
			</Box>
		</Container>
	);
}
