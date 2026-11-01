// biome-ignore-all lint/style/useNamingConvention: Supabase uses snake_case column names
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, test, vi } from "vitest";
import ProfileView from "~/components/ProfileView";
import { ToastProvider } from "~/components/ToastProvider";
import type { Profile } from "~/types/Profile";

vi.mock("~/utils/logDataInterface", () => ({
	addConversationLog: vi.fn(),
	updateConversationLog: vi.fn(),
	deleteConversationLog: vi.fn(),
}));

vi.mock("~/utils/notesDataInterface", () => ({
	addPersonalNote: vi.fn(),
	deletePersonalNote: vi.fn(),
	updatePersonalNote: vi.fn(),
}));

vi.mock("~/utils/profileDataInterface", () => ({
	updateProfile: vi.fn(),
	uploadProfileImage: vi.fn(),
}));

import {
	addConversationLog,
	deleteConversationLog,
} from "~/utils/logDataInterface";

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

const mockProfile: Profile = {
	id: "profile-1",
	name: "Jane Doe",
	location: "Boston, MA",
	industry: "Technology",
	company: "Acme Corp",
	job: "Software Engineer",
	seniority: "Senior",
	email: "jane@example.com",
	phone: "555-1234",
	linkedin: "https://linkedin.com/in/jane",
	image: null,
	user_id: null,
};

const mockLogs = [
	{
		id: "log-1",
		profile_id: "profile-1",
		content: "<p>Had a great call</p>",
		date: "2025-01-15",
	},
	{
		id: "log-2",
		profile_id: "profile-1",
		content: "<p>Follow-up email sent</p>",
		date: "2025-02-20",
	},
];

const mockNotes = [
	{ id: "note-1", profile_id: "profile-1", content: "Met at the conference" },
];

function renderProfileView(
	profile: Profile = mockProfile,
	logs: (typeof mockLogs)[number][] = [],
	notes: (typeof mockNotes)[number][] = [],
) {
	const router = createMemoryRouter([
		{
			path: "/",
			element: (
				<ToastProvider>
					<ProfileView
						profile={profile}
						initialLogs={logs}
						initialNotes={notes}
					/>
				</ToastProvider>
			),
		},
	]);
	return render(<RouterProvider router={router} />);
}

//RENDER TESTS
// Using findBy because tiptap's useEditor initializes asynchronously
describe("ProfileView render", () => {
	test("renders the profile name", async () => {
		renderProfileView();
		expect(await screen.findByText("Jane Doe")).toBeInTheDocument();
	});

	test("renders profile location", async () => {
		renderProfileView();
		expect(await screen.findByText(/Boston, MA/)).toBeInTheDocument();
	});

	test("renders profile industry and company", async () => {
		renderProfileView();
		expect(await screen.findByText(/Technology/)).toBeInTheDocument();
		expect(await screen.findByText(/Acme Corp/)).toBeInTheDocument();
	});

	test("renders contact chips for email, phone, and LinkedIn", async () => {
		renderProfileView();
		expect(await screen.findByText("jane@example.com")).toBeInTheDocument();
		expect(await screen.findByText("555-1234")).toBeInTheDocument();
		expect(await screen.findByText("LinkedIn")).toBeInTheDocument();
	});

	test("renders the Edit Profile button", async () => {
		renderProfileView();
		expect(
			await screen.findByRole("button", { name: /edit profile/i }),
		).toBeInTheDocument();
	});

	test("renders the Contact Logs section heading", async () => {
		renderProfileView();
		expect(
			await screen.findByRole("heading", { name: /contact logs/i }),
		).toBeInTheDocument();
	});

	test("shows empty state message when there are no logs", async () => {
		renderProfileView(mockProfile, [], []);
		expect(await screen.findByText(/no contact logs yet/i)).toBeInTheDocument();
	});

	test("renders Edit and Delete buttons for each log entry", async () => {
		renderProfileView(mockProfile, mockLogs, []);
		const editButtons = await screen.findAllByRole("button", {
			name: /^edit$/i,
		});
		const deleteButtons = screen.getAllByRole("button", { name: /^delete$/i });
		expect(editButtons).toHaveLength(mockLogs.length);
		expect(deleteButtons).toHaveLength(mockLogs.length);
	});

	test("renders the Personal Notes section", async () => {
		renderProfileView(mockProfile, [], mockNotes);
		expect(
			await screen.findByText("Met at the conference"),
		).toBeInTheDocument();
	});
});

//INTERACTION TESTS
describe("ProfileView interactions", () => {
	test("clicking Edit Profile shows the edit form", async () => {
		const user = userEvent.setup();
		renderProfileView();

		await user.click(
			await screen.findByRole("button", { name: /edit profile/i }),
		);
		expect(
			await screen.findByRole("heading", { name: /edit profile/i }),
		).toBeInTheDocument();
	});

	test("deletes a log entry after confirming Delete", async () => {
		const user = userEvent.setup();
		(deleteConversationLog as ReturnType<typeof vi.fn>).mockResolvedValue(
			undefined,
		);
		renderProfileView(mockProfile, [mockLogs[0]], []);

		const deleteButton = await screen.findByRole("button", {
			name: /^delete$/i,
		});
		await user.click(deleteButton);

		expect(
			await screen.findByText(
				/are you sure you want to delete this contact log/i,
			),
		).toBeInTheDocument();

		const confirmDeleteButtons = screen.getAllByRole("button", {
			name: /^delete$/i,
		});
		await user.click(confirmDeleteButtons[confirmDeleteButtons.length - 1]);

		expect(deleteConversationLog).toHaveBeenCalledWith("log-1");

		await waitFor(() =>
			expect(
				screen.queryByText(/are you sure you want to delete this contact log/i),
			).not.toBeInTheDocument(),
		);
	});

	test("clicking Edit on a log shows the log editor", async () => {
		const user = userEvent.setup();
		renderProfileView(mockProfile, [mockLogs[0]], []);

		const editButton = await screen.findByRole("button", { name: /^edit$/i });
		await user.click(editButton);

		expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /^cancel$/i }),
		).toBeInTheDocument();
	});

	test("shows confirmation dialog when Delete Profile is clicked", async () => {
		const user = userEvent.setup();
		renderProfileView();

		await user.click(
			await screen.findByRole("button", { name: /delete profile/i }),
		);
		expect(
			await screen.findByText(/are you sure you want to delete this profile/i),
		).toBeInTheDocument();
	});

	test("dismisses profile delete dialog when Cancel is clicked", async () => {
		const user = userEvent.setup();
		renderProfileView();

		await user.click(
			await screen.findByRole("button", { name: /delete profile/i }),
		);
		await screen.findByText(/are you sure you want to delete this profile/i);
		await user.click(screen.getByRole("button", { name: /^cancel$/i }));

		expect(
			screen.queryByText(/are you sure you want to delete this profile/i),
		).not.toBeInTheDocument();
	});

	test("adds a log entry when Save Log is clicked", async () => {
		const user = userEvent.setup();
		const newLog = {
			id: "log-new",
			profile_id: "profile-1",
			content: "<p></p>",
			date: "2025-05-05",
		};
		(addConversationLog as ReturnType<typeof vi.fn>).mockResolvedValue(newLog);
		renderProfileView(mockProfile, [], []);

		const saveLogButton = await screen.findByRole("button", {
			name: /save log/i,
		});
		await user.click(saveLogButton);

		expect(addConversationLog).toHaveBeenCalledWith(
			"profile-1",
			expect.any(String),
		);
		await waitFor(() =>
			expect(
				screen.queryByText(/no contact logs yet/i),
			).not.toBeInTheDocument(),
		);
	});
});
