import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "react-router-dom";

export default function QRTableDetector({ tableId: providedTableId = null }) {
  const [searchParams] = useSearchParams();
  const [table, setTable] = useState(providedTableId);
  const { table: pathTableParam, restaurantSlug: pathRestaurant } = useParams();

  useEffect(() => {
    // priority:
    // 1) explicit providedTableId (component prop)
    // 2) route path param (/:restaurantSlug/:table)
    // 3) query param ?table=
    if (providedTableId) {
      setTable(providedTableId);
      return;
    }

    // pathTableParam will be defined if route is like "/:restaurantSlug/:table"
    if (pathTableParam) {
      setTable(pathTableParam);
      return;
    }

    const qTable = searchParams.get("table");
    setTable(qTable);
  }, [providedTableId, searchParams, pathTableParam]);

  const status = table ? `Table ${table}` : "No table detected";

  return (
    <div
      className="flex gap-4 items-center p-4 rounded-[16px] bg-white/85 shadow-[0_20px_45px_rgba(15,23,42,0.08)] border border-[rgba(15,23,42,0.08)]"
      role="status"
    >
      <span className="text-2xl">🍽️</span>
      <div>
        <p className="m-0 text-sm uppercase tracking-wider text-slate-400">
          You're dining on
        </p>
        <p
          className={`m-[0.2rem_0_0.3rem] font-semibold text-xl ${
            table ? "text-indigo-600" : "text-red-500"
          }`}
        >
          {status}
        </p>
        {!table && (
          <small className="text-slate-500">
            Scan the QR code on your table to personalize the experience.
          </small>
        )}
        {pathRestaurant && (
          <div className="text-xs text-slate-400 mt-1">Restaurant: {pathRestaurant}</div>
        )}
      </div>
    </div>
  );
}




