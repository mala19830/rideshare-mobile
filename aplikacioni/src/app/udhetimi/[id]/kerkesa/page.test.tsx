import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { getServerSessionMock, lexogjendjenMock } = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  lexogjendjenMock: vi.fn(),
}));

vi.mock("next-auth", () => ({ getServerSession: getServerSessionMock }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/kerkesat", () => ({ lexogjendjen: lexogjendjenMock }));

import Kerkesa from "./page";

describe("Kerkesa", () => {
  beforeEach(() => vi.clearAllMocks());

  test("kërkon hyrje para shfaqjes së kërkesës personale", async () => {
    getServerSessionMock.mockResolvedValue(null);
    const html = renderToStaticMarkup(await Kerkesa({ params: Promise.resolve({ id: "2" }), searchParams: Promise.resolve({}) }));
    expect(html).toContain("Hyr me GitHub");
    expect(html).not.toContain("Kërko një vend");
  });

  test("paraqet gjendjen reale të lexuar përmes serverit", async () => {
    getServerSessionMock.mockResolvedValue({ user: { githubId: "123" } });
    lexogjendjenMock.mockResolvedValue({
      ride: { id: "2", nisja: "Ferizaj", vende: 2 }, role: "passenger", requests: [],
    });
    const html = renderToStaticMarkup(await Kerkesa({ params: Promise.resolve({ id: "2" }), searchParams: Promise.resolve({}) }));
    expect(html).toContain("Udhëtimi 2");
    expect(html).toContain("Vende të lira: <strong>2</strong>");
    expect(html).toContain("Pa kërkesë");
  });
});
