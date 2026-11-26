import { beforeEach, describe, expect, test, vi } from "vitest";

const { getServerSessionMock, shenoNjoftiminLexuarMock } = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  shenoNjoftiminLexuarMock: vi.fn(),
}));

vi.mock("next-auth", () => ({ getServerSession: getServerSessionMock }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/njoftimet", () => ({ shenoNjoftiminLexuar: shenoNjoftiminLexuarMock }));

import { POST } from "./route";

describe("POST /api/njoftimet/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  test("shënon vetëm ID-në nën pronësinë e sesionit aktual", async () => {
    getServerSessionMock.mockResolvedValue({ user: { githubId: "traveler-123" } });
    shenoNjoftiminLexuarMock.mockResolvedValue(true);
    const response = await POST(new Request("http://localhost"), { params: Promise.resolve({ id: "42" }) });
    expect(shenoNjoftiminLexuarMock).toHaveBeenCalledWith("42", "traveler-123");
    expect(await response.json()).toEqual({ read: true });
  });

  test("nuk zbulon njoftimin e një marrësi tjetër", async () => {
    getServerSessionMock.mockResolvedValue({ user: { githubId: "traveler-123" } });
    shenoNjoftiminLexuarMock.mockResolvedValue(false);
    const response = await POST(new Request("http://localhost"), { params: Promise.resolve({ id: "42" }) });
    expect(response.status).toBe(404);
  });
});
