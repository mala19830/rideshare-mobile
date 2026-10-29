import Link from "next/link";
import { OraUdhetimit } from "@/components/OraUdhetimit";
import { tekstiVendeve, type Udhetim } from "@/lib/udhetimet";

export function KartaUdhetimi({ udhetim }: { udhetim: Udhetim }) {
  return (
    <article className="trip-card">
      <h2>
        {udhetim.nisja} → {udhetim.destinacioni}
      </h2>
      <p className="trip-meta">
        <span>
          Ora <OraUdhetimit udhetim={udhetim} />
        </span>
        <span>Shoferi: {udhetim.shoferi}</span>
        <span className={udhetim.vende > 0 ? "badge" : "badge full"}>
          {tekstiVendeve(udhetim.vende)}
        </span>
      </p>
      <Link className="action secondary" href={`/udhetimi/${udhetim.id}`}>
        Shiko detajet
      </Link>
    </article>
  );
}
