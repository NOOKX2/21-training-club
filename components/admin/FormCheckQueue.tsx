import type { FormCheckSubmission } from "@/lib/data";

export function FormCheckQueue({ submissions }: { submissions: FormCheckSubmission[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wide text-white">
          Video Form-Check Queue
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Review and provide feedback on Tier 3 client form submissions
        </p>
      </div>

      <div className="border border-zinc-800">
        {submissions.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <p className="font-medium text-white">No pending form checks</p>
            <p className="mt-1 text-sm text-zinc-500">
              Tier 3 client submissions will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {submissions.map((s) => (
              <div key={s.id} className="px-6 py-5">
                <p className="font-semibold text-white">
                  {s.user_name ?? "Client"} — {s.exercise_name ?? "Exercise"}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Submitted {s.submitted_at?.slice(0, 10) ?? "—"}
                </p>
                {s.video_base64 && (
                  <video
                    src={s.video_base64}
                    controls
                    className="mt-4 max-h-64 w-full max-w-md"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
