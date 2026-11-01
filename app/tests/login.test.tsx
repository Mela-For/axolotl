import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { clientAction, default as LoginPage } from "~/routes/login";

vi.mock("~/supabase_client", () => ({
	getSupabaseClient: vi.fn(),
}));

import { getSupabaseClient } from "~/supabase_client";

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

function renderLogin() {
	const router = createMemoryRouter(
		[
			{ path: "/login", element: <LoginPage />, action: clientAction },
			{ path: "/profiles", element: <div>Profiles Page</div> },
		],
		{ initialEntries: ["/login"] },
	);
	return render(<RouterProvider router={router} />);
}

describe("LoginPage", () => {
	beforeEach(() => vi.clearAllMocks());

	test("renders email, password fields and sign in button", () => {
		renderLogin();
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /sign in/i }),
		).toBeInTheDocument();
	});

	test("renders a link to the sign up page", () => {
		renderLogin();
		expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
	});

	test("navigates to /profiles on successful login", async () => {
		const user = userEvent.setup();
		(getSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
			auth: {
				signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
			},
		});

		renderLogin();
		await user.type(screen.getByLabelText(/email/i), "test@example.com");
		await user.type(screen.getByLabelText(/password/i), "password123");
		await user.click(screen.getByRole("button", { name: /sign in/i }));

		expect(await screen.findByText("Profiles Page")).toBeInTheDocument();
	});

	test("shows error message on failed login", async () => {
		const user = userEvent.setup();
		(getSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
			auth: {
				signInWithPassword: vi
					.fn()
					.mockResolvedValue({ error: { message: "Invalid credentials" } }),
			},
		});

		renderLogin();
		await user.type(screen.getByLabelText(/email/i), "test@example.com");
		await user.type(screen.getByLabelText(/password/i), "wrongpassword");
		await user.click(screen.getByRole("button", { name: /sign in/i }));

		expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
	});

	test("disables the button while signing in", async () => {
		const user = userEvent.setup();
		(getSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
			auth: {
				signInWithPassword: vi
					.fn()
					.mockImplementation(() => new Promise(() => {})),
			},
		});

		renderLogin();
		await user.type(screen.getByLabelText(/email/i), "test@example.com");
		await user.type(screen.getByLabelText(/password/i), "password123");
		await user.click(screen.getByRole("button", { name: /sign in/i }));

		expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
	});
});
