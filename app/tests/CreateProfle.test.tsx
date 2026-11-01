import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, test, vi } from "vitest";
import CreateProfile from "~/components/CreateProfile";
import { ToastProvider } from "~/components/ToastProvider";

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

function renderCreateProfile() {
	const router = createMemoryRouter([
		{
			path: "/",
			element: (
				<ToastProvider>
					<CreateProfile />
				</ToastProvider>
			),
		},
	]);
	return render(<RouterProvider router={router} />);
}

//-------------------------------RENDER TESTS-------------------------------
describe("CreateProfile Render", () => {
	test("renders Create Button", () => {
		renderCreateProfile();
		screen.getByRole("button", { name: /create profile/i });
	});

	test("renders file input", () => {
		renderCreateProfile();
		screen.getByLabelText(/profile picture/i);
	});
	test("renders name,email,phoneNumber, jobtTitle, company, location", () => {
		renderCreateProfile();
		screen.getByLabelText(/name/i);
		screen.getByLabelText(/email/i);
		screen.getByLabelText(/phone number/i);
		screen.getByLabelText(/job title/i);
		screen.getByLabelText(/company/i);
		screen.getByLabelText(/location/i);
	});
});

//-------------------------------IMAGE ACCEPT AND REJECT TESTS------------------------------

//user selects valid image, preview appears
describe("CreateProfile Image Upload", () => {
	test("creates image preview when valid image file is selected", async () => {
		renderCreateProfile();
		const input = screen.getByLabelText(/profile picture/i) as HTMLInputElement;
		const smallBlob = new Uint8Array(4 * 1024 * 1024);
		const smallFile = new File([smallBlob], "small.png", { type: "image/png" });
		fireEvent.change(input, { target: { files: [smallFile] } });
		const _img = await screen.findByRole("img");
	});

	test("rejects non-image files when selected (no preview created)", async () => {
		renderCreateProfile();
		const input = screen.getByLabelText(/profile picture/i) as HTMLInputElement;
		const nonImageFile = new File(["hello"], "test.txt", {
			type: "text/plain",
		});

		// simulate user selecting a non-image file
		fireEvent.change(input, { target: { files: [nonImageFile] } });

		// component should not render an <img/> preview for a non-image file
		const img = screen.queryByRole("img");
		expect(img).toBeNull();
	});

	test("accepts only image files (has accept attribute)", () => {
		renderCreateProfile();
		const input = screen.getByLabelText(/profile picture/i) as HTMLInputElement;
		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute("accept", "image/*");
	});

	test("rejects files larger than 5MB (no preview created)", () => {
		renderCreateProfile();
		const input = screen.getByLabelText(/profile picture/i) as HTMLInputElement;

		const largeBlob = new Uint8Array(6 * 1024 * 1024);
		const largeFile = new File([largeBlob], "large.png", { type: "image/png" });
		fireEvent.change(input, { target: { files: [largeFile] } });

		expect(screen.queryByRole("img")).toBeNull();
	});
});

//-------------------------------SWAP TESTS AND EDGE CASES-------------------------------

describe("CreateProfile Swap tests and edge cases", () => {
	test("swaps preview when user selects a different image", async () => {
		renderCreateProfile();
		const input = screen.getByLabelText(/profile picture/i) as HTMLInputElement;

		// select first image
		const firstFile = new File([new Uint8Array(1 * 1024 * 1024)], "first.png", {
			type: "image/png",
		});
		fireEvent.change(input, { target: { files: [firstFile] } });

		// wait for first preview
		const firstPreview = await screen.findByRole("img");
		const firstSrc = firstPreview.getAttribute("src");

		// select second image
		const secondFile = new File(
			[new Uint8Array(1 * 1024 * 1024)],
			"second.png",
			{ type: "image/png" },
		);
		fireEvent.change(input, { target: { files: [secondFile] } });

		// wait for second preview and confirm src changed
		const secondPreview = await screen.findByRole("img");
		const secondSrc = secondPreview.getAttribute("src");
		expect(firstSrc).not.toBe(secondSrc);
	});

	test("does nothing when file picker is cancelled", async () => {
		renderCreateProfile();
		const input = screen.getByLabelText(/profile picture/i) as HTMLInputElement;

		//first select a valid image so there is existing preview
		const file = new File([new Uint8Array(1 * 1024 * 1024)], "photo.png", {
			type: "image/png",
		});
		fireEvent.change(input, { target: { files: [file] } });
		const preview = await screen.findByRole("img");
		const srcBefore = preview.getAttribute("src");

		// simulate cancel — empty files array
		fireEvent.change(input, { target: { files: [] } });

		//check if preview src is unchanged (still shows previous image)
		const srcAfter = screen.getByRole("img").getAttribute("src");
		expect(srcBefore).toBe(srcAfter);
	});

	test("revokes old object URL when new image is selected", async () => {
		renderCreateProfile();
		const input = screen.getByLabelText(/profile picture/i) as HTMLInputElement;
		const revokeSpy = vi.spyOn(URL, "revokeObjectURL");

		// select first image
		const firstFile = new File([new Uint8Array(1 * 1024 * 1024)], "first.png", {
			type: "image/png",
		});
		fireEvent.change(input, { target: { files: [firstFile] } });
		await screen.findByRole("img");

		// select second image — should trigger revoke of first URL
		const secondFile = new File(
			[new Uint8Array(1 * 1024 * 1024)],
			"second.png",
			{ type: "image/png" },
		);
		fireEvent.change(input, { target: { files: [secondFile] } });

		expect(revokeSpy).toHaveBeenCalled();
	});

	test("revokes object URL when component unmounts", async () => {
		const { unmount } = renderCreateProfile();
		const input = screen.getByLabelText(/profile picture/i) as HTMLInputElement;
		const revokeSpy = vi.spyOn(URL, "revokeObjectURL");

		const file = new File([new Uint8Array(1 * 1024 * 1024)], "photo.png", {
			type: "image/png",
		});
		fireEvent.change(input, { target: { files: [file] } });
		await screen.findByRole("img");

		unmount();
		expect(revokeSpy).toHaveBeenCalled();
	});
});
