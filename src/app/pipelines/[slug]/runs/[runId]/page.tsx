import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRun } from '@/lib/actions';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string; runId: string };
}

function levelColor(level: string) {
  const map: Record<string, string> = {
    debug: 'text-gray-400',
    info: 'text-blue-600',
    warn: 'text-yellow-600',
    error: 'text-red-600',
  };
  return map[level] ?? 'text-gray-500';
}

export default async function RunDetailPage({ params }: Props) {
  const run = await getRun(params.runId);
  if (!run) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Run Details</h1>
          <p className="mt-1 text-sm text-gray-500">
            {run.pipeline.name} &mdash; {run.status}
          </p>
        </div>
        <Link
          href={`/pipelines/${params.slug}/runs`}
          className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Runs
        </Link>
      </div>

      {/* Run info */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Status</p>
          <p className="mt-1 font-semibold text-gray-900">{run.status}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Duration</p>
          <p className="mt-1 font-semibold text-gray-900">
            {run.duration ? `${(run.duration / 1000).toFixed(1)}s` : '—'}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Rows In</p>
          <p className="mt-1 font-semibold text-gray-900">{run.rowsIn.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Rows Out</p>
          <p className="mt-1 font-semibold text-gray-900">{run.rowsOut.toLocaleString()}</p>
        </div>
      </div>

      {/* Error */}
      {run.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">Error</p>
          <p className="mt-1 font-mono text-sm text-red-600">{run.error}</p>
        </div>
      )}

      {/* Logs */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold text-gray-900">Logs ({run.logs.length})</h2>
        </div>
        {run.logs.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No logs recorded.</div>
        ) : (
          <div className="divide-y font-mono text-sm">
            {run.logs.map((log) => (
              <div key={log.id} className="flex gap-3 px-4 py-2">
                <span className="w-12 shrink-0 text-xs text-gray-400">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
                <span className={`w-12 shrink-0 text-xs font-medium uppercase ${levelColor(log.level)}`}>
                  {log.level}
                </span>
                <span className="text-gray-700">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
