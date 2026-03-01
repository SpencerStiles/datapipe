import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPipeline, getRuns } from '@/lib/actions';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    success: 'bg-green-50 text-green-700',
    failed: 'bg-red-50 text-red-700',
    running: 'bg-blue-50 text-blue-700',
    pending: 'bg-gray-100 text-gray-500',
    cancelled: 'bg-yellow-50 text-yellow-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-500';
}

function formatDuration(ms: number | null): string {
  if (!ms) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default async function RunsPage({ params }: Props) {
  const pipeline = await getPipeline(params.slug);
  if (!pipeline) notFound();

  const runs = await getRuns(pipeline.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Runs</h1>
          <p className="mt-1 text-sm text-gray-500">
            {pipeline.name} &mdash; {runs.length} run{runs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href={`/pipelines/${pipeline.slug}`}
          className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Pipeline
        </Link>
      </div>

      {runs.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-700">No runs yet</h3>
          <p className="mt-2 text-sm text-gray-500">Trigger a run from the pipeline page.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Started</th>
                <th className="px-4 py-3 font-medium text-gray-500">Duration</th>
                <th className="px-4 py-3 font-medium text-gray-500">Rows In</th>
                <th className="px-4 py-3 font-medium text-gray-500">Rows Out</th>
                <th className="px-4 py-3 font-medium text-gray-500">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {runs.map((run) => (
                <tr key={run.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(run.status)}`}>
                      {run.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {new Date(run.startedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{formatDuration(run.duration)}</td>
                  <td className="px-4 py-3 text-gray-700">{run.rowsIn.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-700">{run.rowsOut.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/pipelines/${pipeline.slug}/runs/${run.id}`}
                      className="text-xs font-medium text-brand-600 hover:text-brand-700"
                    >
                      View Logs
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
