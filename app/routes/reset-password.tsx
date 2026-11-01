import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { Form, redirect, useActionData, useNavigation } from "react-router";
import { getSupabaseClient } from "~/supabase_client";
import type { Route } from "./+types/reset-password";

export async function clientAction({ request }: Route.ClientActionArgs) {
	const formData = await request.formData();
	const password = formData.get("password")?.toString() ?? "";
	const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

	if (!password) return { error: "Password is required." };
	if (password.length < 6)
		return { error: "Password must be at least 6 characters." };
	if (password !== confirmPassword) return { error: "Passwords do not match." };

	const { error } = await getSupabaseClient().auth.updateUser({ password });
	if (error) return { error: error.message };
	return redirect("/login");
}

export default function ResetPasswordPage() {
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
				<Typography variant="h4">Set New Password</Typography>
				<Typography variant="body2" color="text.secondary">
					Enter and confirm your new password.
				</Typography>

				<Box sx={{ width: "100%", mt: 1 }}>
					<Form method="post">
						<TextField
							label="New password"
							type="password"
							name="password"
							fullWidth
							required
							margin="normal"
							slotProps={{ htmlInput: { minLength: 6 } }}
						/>
						<TextField
							label="Confirm new password"
							type="password"
							name="confirmPassword"
							fullWidth
							required
							margin="normal"
						/>

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
							{loading ? "Updating..." : "Update password"}
						</Button>
					</Form>
				</Box>
			</Box>
		</Container>
	);
}
