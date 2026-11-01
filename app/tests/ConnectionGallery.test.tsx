// biome-ignore-all lint/style/useNamingConvention: Supabase uses snake_case column names
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import ConnectionGallery from "~/components/ConnectionGallery";

const mockConnections = [
	{
		id: "1",
		name: "Alumn1",
		job: "Software Engineer",
		industry: "Tech",
		seniority: "Junior",
		location: "Boston",
		company: "Google",
		email: null,
		image: null,
		linkedin: null,
		phone: null,
		user_id: null,
	},
	{
		id: "2",
		name: "Alumn2",
		job: "Analyst",
		industry: "Consulting",
		seniority: "Senior",
		location: "New York",
		company: "McKinsey",
		email: null,
		image: null,
		linkedin: null,
		phone: null,
		user_id: null,
	},
];

describe("ConnectionGallery Component", () => {
	it("should display the names of all connections passed via props", () => {
		render(
			<MemoryRouter>
				<ConnectionGallery connections={mockConnections} />
			</MemoryRouter>,
		);
		expect(screen.getByText("Alumn1")).toBeDefined();
		expect(screen.getByText("Alumn2")).toBeDefined();
	});

	it("should render the correct number of connection cards", () => {
		render(
			<MemoryRouter>
				<ConnectionGallery connections={mockConnections} />
			</MemoryRouter>,
		);
		const cards = screen.getAllByRole("heading", { level: 3 });
		expect(cards.length).toBe(2);
	});

	it("should display the correct industry for each connection", () => {
		render(
			<MemoryRouter>
				<ConnectionGallery connections={mockConnections} />
			</MemoryRouter>,
		);
		expect(screen.getByText(/Tech/i)).toBeDefined();
		expect(screen.getByText(/Consulting/i)).toBeDefined();
	});
});
