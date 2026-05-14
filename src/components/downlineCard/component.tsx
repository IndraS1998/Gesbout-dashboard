// components/DownlineAccordion/DownlineAccordion.tsx
"use client";

import { useState } from "react";
import styles from "./component.module.css";
import type {Purchase} from "@/context/types";

type DownlineAccordionProps = {
  name: string;
  code: string;
  totalPv: number;
  totalQuantity: number;
  purchases: Purchase[];
  defaultOpen?: boolean;
};

export default function DownlineAccordion({
  name,
  code,
  totalPv,
  purchases,
  totalQuantity,
  defaultOpen = false,
}: DownlineAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={styles.dlItem}>
      <div
        className={`${styles.dlHead} ${
          open ? styles.open : ""
        }`}
        onClick={() => setOpen(!open)}
      >
        <div>
          <div className={styles.dlName}>
            {name}
          </div>

          <div className={styles.dlCode}>
            {code}
          </div>
        </div>

        <div className={styles.rightSection}>
          <div>
            <span className={styles.dlPv}>
              {totalPv} PV
            </span>
          </div>

          <svg
            className={`${styles.dlChev} ${
              open ? styles.rotate : ""
            }`}
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      <div
        className={`${styles.dlBodyWrapper} ${
          open ? styles.bodyOpen : styles.bodyClosed
        }`}
      >
        <div className={styles.dlBody}>
          <div className={styles.tw}>
            <table>
              <thead>
                <tr>
                  <th>Libellé</th>
                  <th className={styles.r}>Qté</th>
                  <th className={styles.r}>
                    PV au Colis
                  </th>
                  <th className={styles.r}>
                    Total PV
                  </th>
                </tr>
              </thead>

              <tbody>
                {purchases.map((p, index) => (
                  <tr key={index}>
                    <td className={styles.b}>
                      {p.libelle}
                    </td>

                    <td className={styles.r}>
                      <span className={styles.qtyTag}>
                        {p.qte}
                      </span>
                    </td>

                    <td className={styles.r}>
                      {p.points}
                    </td>

                    <td className={styles.r}>
                      {p.qte * p.points}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <td className={styles.lbl}>
                    Sous-Total
                  </td>

                  <td className={styles.r}>
                    {totalQuantity}
                  </td>

                  <td className={styles.r}>/</td>

                  <td className={styles.r}>
                    {totalPv}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}