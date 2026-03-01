import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPipeline } from '@/lib/actions';
import { getStepColor, getStepType } from '@/lib/step-types';
import PipelineActions from './actions-panel';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export default async function PipelineDetailPage({ params }: Props) {
  const pipeline = await getPipeline(params.slug);
  if (!pipeline) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pipeline.name}</h1>
          {pipeline.description && (
            <p className="mt-1 text-sm text-gray-500">{pipeline.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/pipelines/${pipeline.slug}/runs`}
            className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Runs ({pipeline._count.runs})
          </Link>
        </div>
      </div>

      {/* Pipeline info */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Status</p>
          <p className="mt-1 font-semibold text-gray-900">{pipeline.enabled ? 'Enabled' : 'Disabled'}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Schedule</p>
          <p className="mt-1 font-semibold text-gray-900">{pipeline.schedule || 'Manual'}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Steps</p>
          <p className="mt-1 font-semibold text-gray-900">{pipeline.steps.length}</p>
        </div>
      </div>

      {/* Steps visualization */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold text-gray-900">Pipeline Steps</h2>
        </div>
        {pipeline.steps.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">No steps yet. Add steps to build your pipeline.</p>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-center gap-2">
              {pipeline.steps.map((step, idx) => (
                <div key={step.id} className="flex items-center gap-2">
                  <div className="rounded-lg border p-3" style={{ borderLeftColor: getStepColor(step.type), borderLeftWidth: 4 }}>
                    <p className="text-xs font-medium text-gray-500">{getStepType(step.type)?.label ?? step.type}</p>
                    <p className="font-medium text-gray-900">{step.name}</p>
                  </div>
                  {idx < pipeline.steps.length - 1 && (
                    <span className="text-gray-300">&rarr;</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <PipelineActions pipelineId={pipeline.id} pipelineSlug={pipeline.slug} />
    </div>
  );
}
