import Link from "next/link";
import type { ReactNode } from "react";
import { OraUdhetimit } from "@/components/OraUdhetimit";
import type { Udhetim } from "@/lib/udhetimet";

export function KartaUdhetimi({ udhetim, children }: { udhetim: Udhetim; children?: ReactNode }) {
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
          {udhetim.vende === 0 ? "Nuk ka vende të lira" :
            udhetim.vende === 1 ? "1 vend i lirë" : `${udhetim.vende} vende të lira`}
        </span>
      </p>
      <Link className="action secondary" href={`/udhetimi/${udhetim.id}`}>
        Shiko detajet
      </Link>
      {children}
    </article>
  );
}
