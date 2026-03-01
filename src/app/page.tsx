import Link from 'next/link';
import { listPipelines, getStats } from '@/lib/actions';
import { cronToHuman } from '@/lib/utils';

export const dynamic = 'force-dynamic';

function statusBadge(status: string) {
  const map: Record<string, string> = {
    success: 'bg-green-50 text-green-700',
    failed: 'bg-red-50 text-red-700',
    running: 'bg-blue-50 text-blue-700',
    pending: 'bg-gray-100 text-gray-500',
  };
  return map[status] ?? 'bg-gray-100 text-gray-500';
}

export default async function DashboardPage() {
  const [pipelines, stats] = await Promise.all([listPipelines(), getStats()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Monitor and manage your data pipelines.</p>
        </div>
        <Link
          href="/pipelines/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          New Pipeline
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Pipelines', value: stats.pipelineCount },
          { label: 'Total Runs', value: stats.runCount },
          { label: 'Successful', value: stats.successCount },
          { label: 'Failed', value: stats.failedCount },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-white p-4">
            <p className="text-xs font-medium text-gray-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Pipeline list */}
      {pipelines.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-700">No pipelines yet</h3>
          <p className="mt-2 text-sm text-gray-500">Create your first pipeline to start processing data.</p>
          <Link
            href="/pipelines/new"
            className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Create Pipeline
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {pipelines.map((p) => {
            const lastRun = p.runs[0];
            return (
              <div key={p.id} className="rounded-lg border bg-white p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/pipelines/${p.slug}`}>
                      <h2 className="font-semibold text-gray-900 hover:text-brand-600">{p.name}</h2>
                    </Link>
                    {p.description && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-1">{p.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!p.enabled && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Disabled</span>
                    )}
                    {lastRun && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(lastRun.status)}`}>
                        {lastRun.status}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                  <span>{p.steps.length} steps</span>
                  <span>{p._count.runs} runs</span>
                  {p.schedule && <span>Schedule: {cronToHuman(p.schedule)}</span>}
                  <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/pipelines/${p.slug}`}
                    className="rounded border px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Configure
                  </Link>
                  <Link
                    href={`/pipelines/${p.slug}/runs`}
                    className="rounded border px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Runs
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
