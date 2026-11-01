import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createProfile,
	deleteProfile,
	getProfileById,
	getProfiles,
} from "./profileDataInterface";

vi.mock("~/supabase_client", () => ({
	getSupabaseClient: vi.fn(),
}));

import { getSupabaseClient } from "~/supabase_client";

const mockProfile = {
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
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe("getProfiles", () => {
	it("returns a list of profiles", async () => {
		(getSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
			from: vi.fn().mockReturnValue({
				select: vi.fn().mockResolvedValue({ data: [mockProfile], error: null }),
			}),
		});

		const result = await getProfiles();
		expect(result).toEqual([mockProfile]);
	});

	it("throws when Supabase returns an error", async () => {
		const mockError = new Error("DB error");
		(getSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
			from: vi.fn().mockReturnValue({
				select: vi.fn().mockResolvedValue({ data: null, error: mockError }),
			}),
		});

		await expect(getProfiles()).rejects.toThrow("DB error");
	});
});

describe("getProfileById", () => {
	it("returns the matching profile", async () => {
		(getSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
			from: vi.fn().mockReturnValue({
				select: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						single: vi
							.fn()
							.mockResolvedValue({ data: mockProfile, error: null }),
					}),
				}),
			}),
		});

		const result = await getProfileById("1");
		expect(result).toEqual(mockProfile);
	});

	it("throws when Supabase returns an error", async () => {
		const mockError = new Error("Not found");
		(getSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
			from: vi.fn().mockReturnValue({
				select: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
					}),
				}),
			}),
		});

		await expect(getProfileById("999")).rejects.toThrow("Not found");
	});
});

describe("createProfile", () => {
	it("returns the newly created profile with an id", async () => {
		(getSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
			auth: {
				getUser: vi
					.fn()
					.mockResolvedValue({ data: { user: { id: "user-1" } } }),
			},
			from: vi.fn().mockReturnValue({
				insert: vi.fn().mockReturnValue({
					select: vi.fn().mockReturnValue({
						single: vi
							.fn()
							.mockResolvedValue({ data: mockProfile, error: null }),
					}),
				}),
			}),
		});

		const result = await createProfile({ name: "Alice Johnson" });
		expect(result.id).toBeDefined();
		expect(result.name).toBe("Alice Johnson");
	});

	it("throws when Supabase returns an error", async () => {
		const mockError = new Error("Insert failed");
		(getSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
			auth: {
				getUser: vi
					.fn()
					.mockResolvedValue({ data: { user: { id: "user-1" } } }),
			},
			from: vi.fn().mockReturnValue({
				insert: vi.fn().mockReturnValue({
					select: vi.fn().mockReturnValue({
						single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
					}),
				}),
			}),
		});

		await expect(createProfile({ name: "Test User" })).rejects.toThrow(
			"Insert failed",
		);
	});
});

describe("updateProfile", () => {
	it("updates and returns the updated profile", async () => {
		(getSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
			from: vi.fn().mockReturnValue({
				update: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						select: vi.fn().mockReturnValue({
							single: vi.fn().mockResolvedValue({
								data: { ...mockProfile, name: "Updated Name" },
								error: null,
							}),
						}),
					}),
				}),
			}),
		});

		const result = await (await import("./profileDataInterface")).updateProfile(
			"1",
			{ name: "Updated Name" },
		);
		expect(result.name).toBe("Updated Name");
	});

	it("throws when Supabase returns an error", async () => {
		const mockError = new Error("Update failed");
		(getSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
			from: vi.fn().mockReturnValue({
				update: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						select: vi.fn().mockReturnValue({
							single: vi
								.fn()
								.mockResolvedValue({ data: null, error: mockError }),
						}),
					}),
				}),
			}),
		});

		await expect(
			(await import("./profileDataInterface")).updateProfile("1", {
				name: "Fail",
			}),
		).rejects.toThrow("Update failed");
	});
});

describe("deleteProfile", () => {
	it("completes without error", async () => {
		(getSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
			from: vi.fn().mockReturnValue({
				delete: vi.fn().mockReturnValue({
					eq: vi.fn().mockResolvedValue({ error: null }),
				}),
			}),
		});

		await expect(deleteProfile("1")).resolves.toBeUndefined();
	});

	it("throws when Supabase returns an error", async () => {
		const mockError = new Error("Delete failed");

		(getSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
			from: vi.fn().mockReturnValue({
				delete: vi.fn().mockReturnValue({
					eq: vi.fn().mockResolvedValue({ error: mockError }),
				}),
			}),
		});

		await expect(deleteProfile("1")).rejects.toThrow("Delete failed");
	});
});
