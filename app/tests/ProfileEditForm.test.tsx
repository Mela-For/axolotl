// biome-ignore-all lint/style/useNamingConvention: Supabase uses snake_case column names
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import ProfileEditForm from "~/components/ProfileEditForm";
import { ToastProvider } from "~/components/ToastProvider";
import type { Profile } from "~/types/Profile";

vi.mock("~/utils/profileDataInterface", () => ({
	updateProfile: vi.fn(),
	uploadProfileImage: vi.fn(),
}));

import {
	updateProfile,
	uploadProfileImage,
} from "~/utils/profileDataInterface";

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

function renderForm(
	onSave = vi.fn(),
	onCancel = vi.fn(),
	profile = mockProfile,
) {
	return render(
		<ToastProvider>
			<ProfileEditForm profile={profile} onSave={onSave} onCancel={onCancel} />
		</ToastProvider>,
	);
}

//RENDER TESTS
describe("ProfileEditForm render", () => {
	test("renders the Edit Profile heading", () => {
		renderForm();
		expect(
			screen.getByRole("heading", { name: /edit profile/i }),
		).toBeInTheDocument();
	});

	test("renders all text input fields", () => {
		renderForm();
		expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/linkedin/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/profile picture/i)).toBeInTheDocument();
	});

	test("renders the Industry and Seniority dropdowns", () => {
		renderForm();
		expect(screen.getAllByText(/^industry$/i).length).toBeGreaterThan(0);
		expect(screen.getAllByText(/^seniority$/i).length).toBeGreaterThan(0);
	});

	test("pre-fills fields with the current profile values", () => {
		renderForm();
		expect(screen.getByLabelText(/^name/i)).toHaveValue("Jane Doe");
		expect(screen.getByLabelText(/location/i)).toHaveValue("Boston, MA");
		expect(screen.getByLabelText(/company/i)).toHaveValue("Acme Corp");
		expect(screen.getByLabelText(/job title/i)).toHaveValue(
			"Software Engineer",
		);
		expect(screen.getByLabelText(/email/i)).toHaveValue("jane@example.com");
		expect(screen.getByLabelText(/phone/i)).toHaveValue("555-1234");
	});

	test("renders the Save Changes and Cancel buttons", () => {
		renderForm();
		expect(
			screen.getByRole("button", { name: /save changes/i }),
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
	});
});

//INTERACTION TESTS
describe("ProfileEditForm interactions", () => {
	test("calls onCancel when Cancel button is clicked", async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();
		renderForm(vi.fn(), onCancel);

		await user.click(screen.getByRole("button", { name: /cancel/i }));
		expect(onCancel).toHaveBeenCalledOnce();
	});

	test("calls updateProfile with the correct data on submit", async () => {
		const user = userEvent.setup();
		const updatedProfile = { ...mockProfile, name: "Jane Smith" };
		(updateProfile as ReturnType<typeof vi.fn>).mockResolvedValue(
			updatedProfile,
		);

		renderForm();
		const nameInput = screen.getByLabelText(/^name/i);
		await user.clear(nameInput);
		await user.type(nameInput, "Jane Smith");
		await user.click(screen.getByRole("button", { name: /save changes/i }));

		expect(updateProfile).toHaveBeenCalledWith(
			"profile-1",
			expect.objectContaining({ name: "Jane Smith" }),
		);
	});

	test("calls onSave with the updated profile after a successful submit", async () => {
		const user = userEvent.setup();
		const onSave = vi.fn();
		const updatedProfile = { ...mockProfile, name: "Jane Smith" };
		(updateProfile as ReturnType<typeof vi.fn>).mockResolvedValue(
			updatedProfile,
		);

		renderForm(onSave);
		await user.click(screen.getByRole("button", { name: /save changes/i }));

		await waitFor(() => expect(onSave).toHaveBeenCalledWith(updatedProfile));
	});

	test("does not call onSave when updateProfile fails", async () => {
		const user = userEvent.setup();
		const onSave = vi.fn();
		(updateProfile as ReturnType<typeof vi.fn>).mockRejectedValue(
			new Error("Network error"),
		);

		renderForm(onSave);
		await user.click(screen.getByRole("button", { name: /save changes/i }));

		await waitFor(() => expect(onSave).not.toHaveBeenCalled());
	});

	test("shows an error toast when updateProfile fails", async () => {
		const user = userEvent.setup();
		(updateProfile as ReturnType<typeof vi.fn>).mockRejectedValue(
			new Error("Network error"),
		);

		renderForm();
		await user.click(screen.getByRole("button", { name: /save changes/i }));

		expect(
			await screen.findByText(/failed to update profile/i),
		).toBeInTheDocument();
	});
});

//IMAGE UPLOAD TESTS
describe("ProfileEditForm image upload", () => {
	test("calls uploadProfileImage with the selected file on submit", async () => {
		const user = userEvent.setup();
		const file = new File(["img"], "photo.png", { type: "image/png" });
		const imageUrl = "https://example.com/photo.png";
		(uploadProfileImage as ReturnType<typeof vi.fn>).mockResolvedValue(
			imageUrl,
		);
		(updateProfile as ReturnType<typeof vi.fn>).mockResolvedValue(mockProfile);

		renderForm();
		const input = screen.getByLabelText(/profile picture/i);
		await user.upload(input, file);
		await user.click(screen.getByRole("button", { name: /save changes/i }));

		await waitFor(() => expect(uploadProfileImage).toHaveBeenCalledWith(file));
		expect(updateProfile).toHaveBeenCalledWith(
			"profile-1",
			expect.objectContaining({ image: imageUrl }),
		);
	});

	test("shows an error toast and does not call updateProfile when uploadProfileImage fails", async () => {
		const user = userEvent.setup();
		const file = new File(["img"], "photo.png", { type: "image/png" });
		(uploadProfileImage as ReturnType<typeof vi.fn>).mockRejectedValue(
			new Error("Upload failed"),
		);

		renderForm();
		const input = screen.getByLabelText(/profile picture/i);
		await user.upload(input, file);
		await user.click(screen.getByRole("button", { name: /save changes/i }));

		expect(
			await screen.findByText(/failed to upload image/i),
		).toBeInTheDocument();
		expect(updateProfile).not.toHaveBeenCalled();
	});

	test("uses the existing profile image when no new file is selected", async () => {
		const user = userEvent.setup();
		const profileWithImage = {
			...mockProfile,
			image: "https://example.com/existing.png",
		};
		(updateProfile as ReturnType<typeof vi.fn>).mockResolvedValue(
			profileWithImage,
		);

		renderForm(vi.fn(), vi.fn(), profileWithImage);
		await user.click(screen.getByRole("button", { name: /save changes/i }));

		await waitFor(() =>
			expect(updateProfile).toHaveBeenCalledWith(
				"profile-1",
				expect.objectContaining({ image: "https://example.com/existing.png" }),
			),
		);
		expect(uploadProfileImage).not.toHaveBeenCalled();
	});
});
