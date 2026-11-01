import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import type { Profile } from "~/types/Profile";
import ProfileSnapshot from "../components/profileSnapshot";

const mockProfile: Profile = {
	id: "1",
	name: "Alice Johnson",
	industry: "Technology",
	seniority: "Senior",
	location: "New York, NY",
	company: "Google",
	job: "Software Engineer",
	email: null,
	linkedin: null,
	phone: null,
	image: null,
	// biome-ignore lint/style/useNamingConvention: matches database column name
	user_id: null,
};

describe("ProfileSnapshot tests", () => {
	test("ProfileSnapshot: displays profile image", () => {
		render(<ProfileSnapshot profile={mockProfile} />);
		expect(
			screen.getByRole("img", { name: mockProfile.name }),
		).toBeInTheDocument();
	});

	test("ProfileSnapshot: displays profile name", () => {
		render(<ProfileSnapshot profile={mockProfile} />);
		expect(
			screen.getByRole("heading", { name: mockProfile.name }),
		).toBeInTheDocument();
	});

	test("ProfileSnapshot: displays profile industry", () => {
		render(<ProfileSnapshot profile={mockProfile} />);
		expect(screen.getByText(mockProfile.industry ?? "")).toBeInTheDocument();
	});
});
