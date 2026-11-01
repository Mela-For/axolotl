// biome-ignore-all lint/style/useNamingConvention: Supabase uses snake_case column names
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, test, vi } from "vitest";
import ProfileFilter from "~/components/ProfileFilter";
import type { Profile } from "~/types/Profile";

const mockProfiles: Profile[] = [
	{
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
		user_id: null,
	},
	{
		id: "2",
		name: "Bob Smith",
		industry: "Finance",
		seniority: "Entry-Level",
		location: "Chicago, IL",
		company: "JP Morgan",
		job: "Data Analyst",
		email: null,
		linkedin: null,
		phone: null,
		image: null,
		user_id: null,
	},
	{
		id: "3",
		name: "Carol Chen",
		industry: "Technology",
		seniority: "Manager",
		location: "San Francisco, CA",
		company: "Apple",
		job: "Product Manager",
		email: null,
		linkedin: null,
		phone: null,
		image: null,
		user_id: null,
	},
	{
		id: "4",
		name: "David Miller",
		industry: "Consulting",
		seniority: "Mid-Level",
		location: "Boston, MA",
		company: "Analysis Group",
		job: "Strategy Consultant",
		email: null,
		linkedin: null,
		phone: null,
		image: null,
		user_id: null,
	},
	{
		id: "5",
		name: "Elena Rodriguez",
		industry: "Education",
		seniority: "Senior",
		location: "Austin, TX",
		company: "Khan Academy",
		job: "AI Curriculum Designer",
		email: null,
		linkedin: null,
		phone: null,
		image: null,
		user_id: null,
	},
	{
		id: "6",
		name: "Kenji Tanaka",
		industry: "Technology",
		seniority: "Entry-Level",
		location: "Seattle, WA",
		company: "Microsoft",
		job: "UX Researcher",
		email: null,
		linkedin: null,
		phone: null,
		image: null,
		user_id: null,
	},
	{
		id: "7",
		name: "Sarah Williams",
		industry: "Healthcare",
		seniority: "Director",
		location: "Philadelphia, PA",
		company: "Pfizer",
		job: "Health IT Manager",
		email: null,
		linkedin: null,
		phone: null,
		image: null,
		user_id: null,
	},
	{
		id: "8",
		name: "Michael Brown",
		industry: "Media",
		seniority: "Mid-Level",
		location: "Los Angeles, CA",
		company: "Netflix",
		job: "Content Strategist",
		email: null,
		linkedin: null,
		phone: null,
		image: null,
		user_id: null,
	},
];

describe("ProfileFilter tests", () => {
	test("ProfileFilter: renders all filter controls", () => {
		render(
			<MemoryRouter>
				<ProfileFilter profiles={[...mockProfiles]} onFilter={vi.fn()} />
			</MemoryRouter>,
		);

		expect(
			screen.getByRole("combobox", { name: /seniority/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("combobox", { name: /industry/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("textbox", { name: /search/i }),
		).toBeInTheDocument();
	});

	test("ProfileFilter: calls onFilter with all profiles on mount", () => {
		const onFilter = vi.fn();
		render(
			<MemoryRouter>
				<ProfileFilter profiles={[...mockProfiles]} onFilter={onFilter} />
			</MemoryRouter>,
		);

		// onFilter should be called on initial render with the full list
		const lastCall = onFilter.mock.calls.at(-1)?.[0] ?? [];
		expect(lastCall).toHaveLength(mockProfiles.length);
	});

	test("ProfileFilter: industry dropdown only shows industries present in profiles", () => {
		render(
			<MemoryRouter>
				<ProfileFilter profiles={[...mockProfiles]} onFilter={vi.fn()} />
			</MemoryRouter>,
		);

		const industrySelect = screen.getByRole("combobox", { name: /industry/i });
		const options = within(industrySelect).getAllByRole("option");

		// "All Industries" + only industries present in mockProfiles
		const presentIndustries = [...new Set(mockProfiles.map((p) => p.industry))];
		expect(options).toHaveLength(presentIndustries.length + 1);
	});

	test("ProfileFilter: selecting an industry calls onFilter with matching profiles", async () => {
		const user = userEvent.setup();
		const onFilter = vi.fn();
		render(
			<MemoryRouter>
				<ProfileFilter profiles={[...mockProfiles]} onFilter={onFilter} />
			</MemoryRouter>,
		);

		const industrySelect = screen.getByRole("combobox", { name: /industry/i });
		await user.selectOptions(industrySelect, "Technology");

		const lastCall = onFilter.mock.calls.at(-1)?.[0] ?? [];
		expect(lastCall).toHaveLength(3);
		expect(
			lastCall.every(
				(p: { industry: string | null }) => p.industry === "Technology",
			),
		).toBe(true);
	});

	test("ProfileFilter: selecting All Industries resets the filter", async () => {
		const user = userEvent.setup();
		const onFilter = vi.fn();
		render(
			<MemoryRouter>
				<ProfileFilter profiles={[...mockProfiles]} onFilter={onFilter} />
			</MemoryRouter>,
		);

		const industrySelect = screen.getByRole("combobox", { name: /industry/i });

		await user.selectOptions(industrySelect, "Technology");
		expect(onFilter.mock.calls.at(-1)?.[0] ?? []).toHaveLength(3);

		await user.selectOptions(industrySelect, "");
		expect(onFilter.mock.calls.at(-1)?.[0] ?? []).toHaveLength(
			mockProfiles.length,
		);
	});

	test("ProfileFilter: search input filters by name", async () => {
		const user = userEvent.setup();
		const onFilter = vi.fn();
		render(
			<MemoryRouter>
				<ProfileFilter profiles={[...mockProfiles]} onFilter={onFilter} />
			</MemoryRouter>,
		);

		const searchInput = screen.getByRole("textbox", { name: /search/i });
		await user.type(searchInput, "Alice");

		const lastCall = onFilter.mock.calls.at(-1)?.[0] ?? [];
		expect(lastCall).toHaveLength(1);
		expect(lastCall[0].name).toMatch(/Alice/i);
	});

	test("ProfileFilter: search input filters by location", async () => {
		const user = userEvent.setup();
		const onFilter = vi.fn();
		render(
			<MemoryRouter>
				<ProfileFilter profiles={[...mockProfiles]} onFilter={onFilter} />
			</MemoryRouter>,
		);

		const searchInput = screen.getByRole("textbox", { name: /search/i });
		await user.type(searchInput, "New York");

		const lastCall = onFilter.mock.calls.at(-1)?.[0] ?? [];
		expect(lastCall).toHaveLength(1);
		expect(lastCall[0].name).toMatch(/Alice/i);
	});

	test("ProfileFilter: search input filters by company", async () => {
		const user = userEvent.setup();
		const onFilter = vi.fn();
		render(
			<MemoryRouter>
				<ProfileFilter profiles={[...mockProfiles]} onFilter={onFilter} />
			</MemoryRouter>,
		);

		const searchInput = screen.getByRole("textbox", { name: /search/i });
		await user.type(searchInput, "Google");

		const lastCall = onFilter.mock.calls.at(-1)?.[0] ?? [];
		expect(lastCall).toHaveLength(1);
		expect(lastCall[0].name).toMatch(/Alice/i);
	});

	test("ProfileFilter: search is case insensitive", async () => {
		const user = userEvent.setup();
		const onFilter = vi.fn();
		render(
			<MemoryRouter>
				<ProfileFilter profiles={[...mockProfiles]} onFilter={onFilter} />
			</MemoryRouter>,
		);

		const searchInput = screen.getByRole("textbox", { name: /search/i });
		await user.type(searchInput, "new york");

		const lastCall = onFilter.mock.calls.at(-1)?.[0] ?? [];
		expect(lastCall).toHaveLength(1);
	});

	test("ProfileFilter: no matching search term calls onFilter with empty array", async () => {
		const user = userEvent.setup();
		const onFilter = vi.fn();
		render(
			<MemoryRouter>
				<ProfileFilter profiles={[...mockProfiles]} onFilter={onFilter} />
			</MemoryRouter>,
		);

		const searchInput = screen.getByRole("textbox", { name: /search/i });
		await user.type(searchInput, "Antarctica");

		expect(onFilter.mock.calls.at(-1)?.[0] ?? []).toHaveLength(0);
	});

	test("ProfileFilter: handles empty profiles array", () => {
		const onFilter = vi.fn();
		render(
			<MemoryRouter>
				<ProfileFilter profiles={[]} onFilter={onFilter} />
			</MemoryRouter>,
		);

		expect(onFilter.mock.calls.at(-1)?.[0] ?? []).toHaveLength(0);
	});

	test("ProfileFilter: selecting a seniority calls onFilter with matching profiles", async () => {
		const user = userEvent.setup();
		const onFilter = vi.fn();
		render(
			<MemoryRouter>
				<ProfileFilter profiles={[...mockProfiles]} onFilter={onFilter} />
			</MemoryRouter>,
		);

		const senioritySelect = screen.getByRole("combobox", {
			name: /seniority/i,
		});
		await user.selectOptions(senioritySelect, "Senior");

		const lastCall = onFilter.mock.calls.at(-1)?.[0] ?? [];
		expect(lastCall).toHaveLength(2);
		expect(
			lastCall.every(
				(p: { seniority: string | null }) => p.seniority === "Senior",
			),
		).toBe(true);
	});

	test("ProfileFilter: industry and search filters can be applied together", async () => {
		const user = userEvent.setup();
		const onFilter = vi.fn();
		render(
			<MemoryRouter>
				<ProfileFilter profiles={[...mockProfiles]} onFilter={onFilter} />
			</MemoryRouter>,
		);

		const industrySelect = screen.getByRole("combobox", { name: /industry/i });
		const searchInput = screen.getByRole("textbox", { name: /search/i });

		await user.selectOptions(industrySelect, "Technology");
		await user.type(searchInput, "San Francisco");

		const lastCall = onFilter.mock.calls.at(-1)?.[0] ?? [];
		// Only Carol matches both Technology AND San Francisco
		expect(lastCall).toHaveLength(1);
		expect(lastCall[0].name).toMatch(/Carol/i);
	});
});
