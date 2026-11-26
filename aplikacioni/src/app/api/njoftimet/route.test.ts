import { beforeEach, describe, expect, test, vi } from "vitest";

const { getServerSessionMock, lexoNjoftimetMock } = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  lexoNjoftimetMock: vi.fn(),
}));

vi.mock("next-auth", () => ({ getServerSession: getServerSessionMock }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/njoftimet", () => ({ lexoNjoftimet: lexoNjoftimetMock }));

import { GET } from "./route";

describe("GET /api/njoftimet", () => {
  beforeEach(() => vi.clearAllMocks());

  test("kërkon sesion të autentikuar", async () => {
    getServerSessionMock.mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
    expect(lexoNjoftimetMock).not.toHaveBeenCalled();
  });

  test("lexon vetëm njoftimet personale dhe ndalon cache", async () => {
    getServerSessionMock.mockResolvedValue({ user: { githubId: "123" } });
    lexoNjoftimetMock.mockResolvedValue([{ id: "7", recipient_id: "123" }]);
    const response = await GET();
    expect(lexoNjoftimetMock).toHaveBeenCalledWith("123");
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(await response.json()).toEqual({ notifications: [{ id: "7", recipient_id: "123" }] });
  });
});
