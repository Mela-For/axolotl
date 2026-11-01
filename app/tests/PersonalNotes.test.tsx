// biome-ignore-all lint/style/useNamingConvention: Supabase uses snake_case column names
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import PersonalNotes from "~/components/PersonalNotes";

vi.mock("~/utils/notesDataInterface", () => ({
	addPersonalNote: vi.fn(),
	deletePersonalNote: vi.fn(),
	updatePersonalNote: vi.fn(),
}));

vi.mock("~/components/ToastProvider", () => ({
	useToast: () => ({ addToast: vi.fn() }),
}));

import {
	addPersonalNote,
	deletePersonalNote,
} from "~/utils/notesDataInterface";

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

const mockNotes = [
	{ id: "note-1", profile_id: "profile-1", content: "Met at the conference" },
	{ id: "note-2", profile_id: "profile-1", content: "Referred by John" },
];

//RENDER TESTS
describe("PersonalNotes render", () => {
	test("shows empty state message when there are no notes", () => {
		render(<PersonalNotes profileId="profile-1" initialNotes={[]} />);
		expect(screen.getByText(/no notes yet/i)).toBeInTheDocument();
	});

	test("renders all initial notes", () => {
		render(<PersonalNotes profileId="profile-1" initialNotes={mockNotes} />);
		expect(screen.getByText("Met at the conference")).toBeInTheDocument();
		expect(screen.getByText("Referred by John")).toBeInTheDocument();
	});

	test("renders the note input field", () => {
		render(<PersonalNotes profileId="profile-1" initialNotes={[]} />);
		expect(screen.getByPlaceholderText(/add a note/i)).toBeInTheDocument();
	});

	test("renders the Add button", () => {
		render(<PersonalNotes profileId="profile-1" initialNotes={[]} />);
		expect(screen.getByRole("button", { name: /^add$/i })).toBeInTheDocument();
	});
});

//ADDING NOTES TESTS
describe("PersonalNotes adding notes", () => {
	test("calls addPersonalNote and shows the new note when Add is clicked", async () => {
		const user = userEvent.setup();
		const newNote = {
			id: "note-3",
			profile_id: "profile-1",
			content: "New note content",
		};
		(addPersonalNote as ReturnType<typeof vi.fn>).mockResolvedValue(newNote);

		render(<PersonalNotes profileId="profile-1" initialNotes={[]} />);
		await user.type(
			screen.getByPlaceholderText(/add a note/i),
			"New note content",
		);
		await user.click(screen.getByRole("button", { name: /^add$/i }));

		expect(addPersonalNote).toHaveBeenCalledWith(
			"profile-1",
			"New note content",
		);
		expect(await screen.findByText("New note content")).toBeInTheDocument();
	});

	test("calls addPersonalNote when Enter is pressed in the input", async () => {
		const user = userEvent.setup();
		const newNote = {
			id: "note-3",
			profile_id: "profile-1",
			content: "Enter note",
		};
		(addPersonalNote as ReturnType<typeof vi.fn>).mockResolvedValue(newNote);

		render(<PersonalNotes profileId="profile-1" initialNotes={[]} />);
		await user.type(
			screen.getByPlaceholderText(/add a note/i),
			"Enter note{Enter}",
		);

		expect(addPersonalNote).toHaveBeenCalledWith("profile-1", "Enter note");
	});

	test("does not call addPersonalNote when the input is empty", async () => {
		const user = userEvent.setup();
		render(<PersonalNotes profileId="profile-1" initialNotes={[]} />);
		await user.click(screen.getByRole("button", { name: /^add$/i }));
		expect(addPersonalNote).not.toHaveBeenCalled();
	});

	test("clears the input field after a note is successfully added", async () => {
		const user = userEvent.setup();
		const newNote = {
			id: "note-3",
			profile_id: "profile-1",
			content: "Temporary text",
		};
		(addPersonalNote as ReturnType<typeof vi.fn>).mockResolvedValue(newNote);

		render(<PersonalNotes profileId="profile-1" initialNotes={[]} />);
		const input = screen.getByPlaceholderText(/add a note/i);
		await user.type(input, "Temporary text");
		await user.click(screen.getByRole("button", { name: /^add$/i }));

		await waitFor(() => expect(input).toHaveValue(""));
	});
});

//DELETING NOTES TESTS
describe("PersonalNotes deleting notes", () => {
	test("shows confirmation dialog when Delete is clicked", async () => {
		const user = userEvent.setup();
		render(
			<PersonalNotes profileId="profile-1" initialNotes={[mockNotes[0]]} />,
		);
		await user.click(screen.getByRole("button", { name: /delete note/i }));
		expect(
			await screen.findByText(
				/are you sure you want to delete this personal note/i,
			),
		).toBeInTheDocument();
	});

	test("calls deletePersonalNote and removes the note after confirming", async () => {
		const user = userEvent.setup();
		(deletePersonalNote as ReturnType<typeof vi.fn>).mockResolvedValue(
			undefined,
		);

		render(
			<PersonalNotes profileId="profile-1" initialNotes={[mockNotes[0]]} />,
		);
		await user.click(screen.getByRole("button", { name: /delete note/i }));

		const confirmButtons = screen.getAllByRole("button", { name: /^delete$/i });
		await user.click(confirmButtons[confirmButtons.length - 1]);

		expect(deletePersonalNote).toHaveBeenCalledWith("note-1");
		await waitFor(() =>
			expect(
				screen.queryByText("Met at the conference"),
			).not.toBeInTheDocument(),
		);
	});

	test("does not call deletePersonalNote when Cancel is clicked in the dialog", async () => {
		const user = userEvent.setup();
		render(
			<PersonalNotes profileId="profile-1" initialNotes={[mockNotes[0]]} />,
		);
		await user.click(screen.getByRole("button", { name: /delete note/i }));
		await user.click(screen.getByRole("button", { name: /^cancel$/i }));

		expect(deletePersonalNote).not.toHaveBeenCalled();
		expect(
			screen.queryByText(/are you sure you want to delete this personal note/i),
		).not.toBeInTheDocument();
	});

	test("only removes the deleted note, not others", async () => {
		const user = userEvent.setup();
		(deletePersonalNote as ReturnType<typeof vi.fn>).mockResolvedValue(
			undefined,
		);

		render(<PersonalNotes profileId="profile-1" initialNotes={mockNotes} />);
		const deleteButtons = screen.getAllByRole("button", {
			name: /delete note/i,
		});
		await user.click(deleteButtons[0]);

		const confirmButtons = screen.getAllByRole("button", { name: /^delete$/i });
		await user.click(confirmButtons[confirmButtons.length - 1]);

		await waitFor(() =>
			expect(
				screen.queryByText("Met at the conference"),
			).not.toBeInTheDocument(),
		);
		expect(screen.getByText("Referred by John")).toBeInTheDocument();
	});
});
