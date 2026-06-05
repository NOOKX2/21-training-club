"use client";

import { useRouter } from "next/navigation";
import { Apple } from "lucide-react";
import { FieldLabel } from "@/components/ui/Input";
import type { AdminClient, MealSubmission } from "@/lib/data";

export function NutritionReview({
  clients,
  selectedClientId,
  date,
  meals,
}: {
  clients: AdminClient[];
  selectedClientId: string;
  date: string;
  meals: MealSubmission[];
}) {
  const router = useRouter();
  const selected = clients.find((c) => c.id === selectedClientId);

  function navigate(clientId: string, nextDate: string) {
    const params = new URLSearchParams();
    if (clientId) params.set("client", clientId);
    params.set("date", nextDate);
    router.push(`/admin/nutrition?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold uppercase tracking-wide text-white">
          <Apple className="h-6 w-6 text-[#a3e635]" />
          Nutrition Review
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Review client nutrition intake</p>
      </div>

      <div className="grid gap-4 border border-zinc-800 p-6 sm:grid-cols-2">
        <div>
          <FieldLabel>Select Client</FieldLabel>
          <select
            value={selectedClientId}
            onChange={(e) => navigate(e.target.value, date)}
            className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm text-white"
          >
            <option value="">Choose a client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>Select Date</FieldLabel>
          <input
            type="date"
            value={date}
            onChange={(e) => navigate(selectedClientId, e.target.value)}
            className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm text-white"
          />
        </div>
      </div>

      {selected && (
        <>
          <div className="flex items-center justify-between border border-zinc-800 bg-zinc-950 p-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Viewing nutrition for
              </p>
              <p className="mt-1 text-2xl font-bold text-white">{selected.name}</p>
              <p className="text-sm text-zinc-500">{date}</p>
            </div>
            <div className="border border-zinc-800 px-6 py-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Total Meals
              </p>
              <p className="mt-1 text-3xl font-bold text-[#a3e635]">{meals.length}</p>
            </div>
          </div>

          <div className="border border-zinc-800">
            {meals.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-center">
                <Apple className="mb-4 h-16 w-16 stroke-1 text-zinc-700" />
                <p className="font-medium text-white">No meals logged for this date</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {selected.name} hasn&apos;t logged any meals on {date}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-800">
                {meals.map((m) => (
                  <li key={m.id} className="flex gap-4 px-6 py-4">
                    {m.photo_base64 && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.photo_base64}
                        alt=""
                        className="h-20 w-20 object-cover"
                      />
                    )}
                    <div>
                      <p className="font-bold uppercase text-white">
                        Meal {m.meal_number}
                        {m.custom_name ? ` — ${m.custom_name}` : ""}
                      </p>
                      {m.description && (
                        <p className="mt-1 text-sm text-zinc-400">{m.description}</p>
                      )}
                      <p className="mt-1 text-xs text-zinc-500">
                        {m.coach_reviewed ? "Reviewed" : "Pending review"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
