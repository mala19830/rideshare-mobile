import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Udhetim } from "@/lib/udhetimet";

const { gjejUdhetiminMock, profiliMock } = vi.hoisted(() => ({
  gjejUdhetiminMock: vi.fn(),
  profiliMock: vi.fn(),
}));

vi.mock("@/lib/udhetimet", () => ({
  gjejUdhetimin: gjejUdhetiminMock,
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => { throw new Error(url); },
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));
vi.mock("@/lib/lejet", () => ({ profiliIm: profiliMock }));

import Kerkesa from "./page";

const udhetimi: Udhetim = {
  id: "2",
  nisja: "Fushë Kosovë",
  destinacioni: "AAB",
  ora: "08:15",
  vendtakimi: "Te stacioni kryesor",
  vende: 1,
};

describe("Kerkesa", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    profiliMock.mockResolvedValue(null);
  });

  test("hap kërkesat reale për një përdorues të identifikuar", async () => {
    gjejUdhetiminMock.mockResolvedValue(udhetimi);
    profiliMock.mockResolvedValue({ id: "123" });

    const html = renderToStaticMarkup(
      await Kerkesa({ params: Promise.resolve({ id: "2" }) }),
    );

    expect(html).toContain("Kërkesat për udhëtimin");
    expect(html).toContain("Gjendja e udhëtimit");
    expect(html).not.toContain("Simulim");
  });

  test("kthen vizitorin te paneli me adresën e kërkesës", async () => {
    gjejUdhetiminMock.mockResolvedValue(udhetimi);
    await expect(Kerkesa({ params: Promise.resolve({ id: "2" }) }))
      .rejects.toThrow("/panel?m=kerkesa&prapa=/udhetimi/2/kerkesa");
  });

  test("paraqet mungesën e vendeve pa simuluar kërkesë", async () => {
    gjejUdhetiminMock.mockResolvedValue({ ...udhetimi, vende: 0 });

    const html = renderToStaticMarkup(
      await Kerkesa({ params: Promise.resolve({ id: "2" }) }),
    );

    expect(html).toContain("Nuk ka vende të lira.");
    expect(html).not.toContain("Simulim: Në pritje");
  });

  test("paraqet gabim të sigurt kur databaza nuk arrihet", async () => {
    gjejUdhetiminMock.mockRejectedValue(new Error("connection failed"));

    const html = renderToStaticMarkup(
      await Kerkesa({ params: Promise.resolve({ id: "2" }) }),
    );

    expect(html).toContain("Nuk u lidhëm me databazën. Provo përsëri.");
  });
});
