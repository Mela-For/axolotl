import { beforeEach, describe, expect, test, vi } from "vitest";
import { clientLoader } from "~/components/Layout";

vi.mock("~/supabase_client", () => ({
	getSupabaseClient: vi.fn(),
}));

import { getSupabaseClient } from "~/supabase_client";

beforeEach(() => vi.clearAllMocks());

describe("Layout clientLoader (auth guard)", () => {
	test("returns null when a session exists", async () => {
		(getSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
			auth: {
				getSession: vi
					.fn()
					.mockResolvedValue({ data: { session: { user: { id: "user-1" } } } }),
			},
		});

		const result = await clientLoader();
		expect(result).toBeNull();
	});

	test("throws a redirect to /login when no session exists", async () => {
		(getSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
			auth: {
				getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
			},
		});

		try {
			await clientLoader();
			expect.fail("should have thrown a redirect");
		} catch (e) {
			expect(e).toBeInstanceOf(Response);
			expect((e as Response).headers.get("Location")).toBe("/login");
		}
	});
});
