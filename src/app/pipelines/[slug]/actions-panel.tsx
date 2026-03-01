'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addStep, triggerRun } from '@/lib/actions';
import { STEP_TYPES, StepType } from '@/lib/step-types';

interface Props {
  pipelineId: string;
  pipelineSlug: string;
}

export default function PipelineActions({ pipelineId, pipelineSlug }: Props) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [running, setRunning] = useState(false);
  const [stepName, setStepName] = useState('');
  const [stepType, setStepType] = useState<StepType>('extract');

  async function handleAddStep() {
    if (!stepName.trim()) return;
    await addStep({ pipelineId, name: stepName, type: stepType });
    setStepName('');
    setStepType('extract' as StepType);
    setAdding(false);
    router.refresh();
  }

  async function handleRun() {
    setRunning(true);
    try {
      await triggerRun(pipelineId);
      router.push(`/pipelines/${pipelineSlug}/runs`);
    } catch {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={handleRun}
          disabled={running}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {running ? 'Running...' : 'Run Pipeline'}
        </button>
        <button
          onClick={() => setAdding(!adding)}
          className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {adding ? 'Cancel' : 'Add Step'}
        </button>
      </div>

      {adding && (
        <div className="rounded-lg border bg-gray-50 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500">Step Type</label>
              <select
                value={stepType}
                onChange={(e) => setStepType(e.target.value as StepType)}
                className="mt-1 block w-full rounded-lg border px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {STEP_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label} — {t.description}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Step Name</label>
              <input
                type="text"
                value={stepName}
                onChange={(e) => setStepName(e.target.value)}
                placeholder="e.g., Fetch user data"
                className="mt-1 block w-full rounded-lg border px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
          <button
            onClick={handleAddStep}
            disabled={!stepName.trim()}
            className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            Add Step
          </button>
        </div>
      )}
    </div>
  );
}
