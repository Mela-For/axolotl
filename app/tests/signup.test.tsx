import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { clientAction, default as SignupPage } from "~/routes/signup";

vi.mock("~/supabase_client", () => ({
	getSupabaseClient: vi.fn(),
}));

import { getSupabaseClient } from "~/supabase_client";

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

function renderSignup() {
	const router = createMemoryRouter(
		[
			{ path: "/signup", element: <SignupPage />, action: clientAction },
			{ path: "/profiles", element: <div>Profiles Page</div> },
			{ path: "/login", element: <div>Login Page</div> },
		],
		{ initialEntries: ["/signup"] },
	);
	return render(<RouterProvider router={router} />);
}

describe("SignupPage", () => {
	beforeEach(() => vi.clearAllMocks());

	test("renders email, password fields and sign up button", () => {
		renderSignup();
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /sign up/i }),
		).toBeInTheDocument();
	});

	test("renders a link to the sign in page", () => {
		renderSignup();
		expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
	});

	test("navigates to /profiles on successful signup", async () => {
		const user = userEvent.setup();
		(getSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
			auth: {
				signUp: vi.fn().mockResolvedValue({ error: null }),
			},
		});

		renderSignup();
		await user.type(screen.getByLabelText(/email/i), "new@example.com");
		await user.type(screen.getByLabelText(/password/i), "password123");
		await user.click(screen.getByRole("button", { name: /sign up/i }));

		expect(await screen.findByText("Profiles Page")).toBeInTheDocument();
	});

	test("shows error message on failed signup", async () => {
		const user = userEvent.setup();
		(getSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
			auth: {
				signUp: vi
					.fn()
					.mockResolvedValue({ error: { message: "Email already in use" } }),
			},
		});

		renderSignup();
		await user.type(screen.getByLabelText(/email/i), "existing@example.com");
		await user.type(screen.getByLabelText(/password/i), "password123");
		await user.click(screen.getByRole("button", { name: /sign up/i }));

		expect(await screen.findByText("Email already in use")).toBeInTheDocument();
	});

	test("disables the button while creating account", async () => {
		const user = userEvent.setup();
		(getSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
			auth: {
				signUp: vi.fn().mockImplementation(() => new Promise(() => {})),
			},
		});

		renderSignup();
		await user.type(screen.getByLabelText(/email/i), "new@example.com");
		await user.type(screen.getByLabelText(/password/i), "password123");
		await user.click(screen.getByRole("button", { name: /sign up/i }));

		expect(
			screen.getByRole("button", { name: /creating account/i }),
		).toBeDisabled();
	});
});
