'use server';

import { prisma } from './db';
import { revalidatePath } from 'next/cache';
import { randomBytes } from 'crypto';
import { StepType } from './step-types';
import { logger } from './logger';

// ──────────────────────────────────────────────
// Pipelines
// ──────────────────────────────────────────────

export async function createPipeline(data: { name: string; description?: string }) {
  try {
    const suffix = randomBytes(3).toString('hex');
    const slug = data.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + suffix;

    const pipeline = await prisma.pipeline.create({
      data: { name: data.name, description: data.description ?? '', slug },
    });

    revalidatePath('/');
    return pipeline;
  } catch (err) {
    logger.error('Failed in createPipeline', { error: err instanceof Error ? err.message : 'Unknown error' });
    throw new Error(err instanceof Error ? err.message : 'Operation failed');
  }
}

export async function updatePipeline(
  id: string,
  data: { name?: string; description?: string; schedule?: string; enabled?: boolean },
) {
  try {
    const pipeline = await prisma.pipeline.update({ where: { id }, data });
    revalidatePath('/');
    revalidatePath(`/pipelines/${pipeline.slug}`);
    return pipeline;
  } catch (err) {
    logger.error('Failed in updatePipeline', { error: err instanceof Error ? err.message : 'Unknown error' });
    throw new Error(err instanceof Error ? err.message : 'Operation failed');
  }
}

export async function deletePipeline(id: string) {
  try {
    await prisma.pipeline.delete({ where: { id } });
    revalidatePath('/');
  } catch (err) {
    logger.error('Failed in deletePipeline', { error: err instanceof Error ? err.message : 'Unknown error' });
    throw new Error(err instanceof Error ? err.message : 'Operation failed');
  }
}

export async function getPipeline(slug: string) {
  try {
    return prisma.pipeline.findUnique({
      where: { slug },
      include: {
        steps: { orderBy: { order: 'asc' } },
        _count: { select: { runs: true } },
      },
    });
  } catch (err) {
    logger.error('Failed in getPipeline', { error: err instanceof Error ? err.message : 'Unknown error' });
    throw new Error(err instanceof Error ? err.message : 'Operation failed');
  }
}

export async function listPipelines() {
  try {
    return prisma.pipeline.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        steps: { select: { id: true }, orderBy: { order: 'asc' } },
        _count: { select: { runs: true } },
        runs: { orderBy: { startedAt: 'desc' }, take: 1 },
      },
    });
  } catch (err) {
    logger.error('Failed in listPipelines', { error: err instanceof Error ? err.message : 'Unknown error' });
    throw new Error(err instanceof Error ? err.message : 'Operation failed');
  }
}

// ──────────────────────────────────────────────
// Steps
// ──────────────────────────────────────────────

export async function addStep(data: {
  pipelineId: string;
  name: string;
  type: StepType;
  config?: string;
}) {
  try {
    const maxOrder = await prisma.step.aggregate({
      where: { pipelineId: data.pipelineId },
      _max: { order: true },
    });

    const step = await prisma.step.create({
      data: {
        pipelineId: data.pipelineId,
        name: data.name,
        type: data.type,
        config: data.config ?? '{}',
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });

    revalidatePath('/');
    return step;
  } catch (err) {
    logger.error('Failed in addStep', { error: err instanceof Error ? err.message : 'Unknown error' });
    throw new Error(err instanceof Error ? err.message : 'Operation failed');
  }
}

export async function deleteStep(id: string) {
  try {
    await prisma.step.delete({ where: { id } });
    revalidatePath('/');
  } catch (err) {
    logger.error('Failed in deleteStep', { error: err instanceof Error ? err.message : 'Unknown error' });
    throw new Error(err instanceof Error ? err.message : 'Operation failed');
  }
}

// ──────────────────────────────────────────────
// Runs
// ──────────────────────────────────────────────

export async function triggerRun(pipelineId: string) {
  try {
    const pipeline = await prisma.pipeline.findUnique({
      where: { id: pipelineId },
      include: { steps: { select: { id: true } } },
    });

    if (!pipeline) {
      return { error: 'Pipeline not found.' };
    }
    if (!pipeline.enabled) {
      return { error: 'Pipeline is disabled and cannot be run.' };
    }
    if (pipeline.steps.length === 0) {
      return { error: 'Pipeline has no steps. Add at least one step before running.' };
    }

    const run = await prisma.run.create({
      data: {
        pipelineId,
        status: 'running',
      },
    });

    // Simulate run completion after creation
    const rowsIn = Math.floor(Math.random() * 10000) + 100;
    const rowsOut = Math.floor(rowsIn * (0.7 + Math.random() * 0.3));
    const duration = Math.floor(Math.random() * 30000) + 500;
    const success = Math.random() > 0.15;

    await prisma.run.update({
      where: { id: run.id },
      data: {
        status: success ? 'success' : 'failed',
        finishedAt: new Date(),
        duration,
        rowsIn,
        rowsOut,
        error: success ? '' : 'Simulated error: connection timeout',
      },
    });

    // Add sample logs
    await prisma.log.createMany({
      data: [
        { runId: run.id, level: 'info', message: `Pipeline started — ${rowsIn} rows extracted` },
        { runId: run.id, level: 'info', message: `Transform complete — ${rowsOut} rows produced` },
        ...(success
          ? [{ runId: run.id, level: 'info', message: `Load complete in ${duration}ms` }]
          : [{ runId: run.id, level: 'error', message: 'Connection timeout during load phase' }]),
      ],
    });

    revalidatePath('/');
    return run;
  } catch (err) {
    logger.error('Failed in triggerRun', { error: err instanceof Error ? err.message : 'Unknown error' });
    throw new Error(err instanceof Error ? err.message : 'Operation failed');
  }
}

export async function getRuns(pipelineId: string) {
  try {
    return prisma.run.findMany({
      where: { pipelineId },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
  } catch (err) {
    logger.error('Failed in getRuns', { error: err instanceof Error ? err.message : 'Unknown error' });
    throw new Error(err instanceof Error ? err.message : 'Operation failed');
  }
}

export async function getRun(id: string) {
  try {
    return prisma.run.findUnique({
      where: { id },
      include: {
        pipeline: true,
        logs: { orderBy: { createdAt: 'asc' } },
      },
    });
  } catch (err) {
    logger.error('Failed in getRun', { error: err instanceof Error ? err.message : 'Unknown error' });
    throw new Error(err instanceof Error ? err.message : 'Operation failed');
  }
}

// ──────────────────────────────────────────────
// Stats
// ──────────────────────────────────────────────

export async function getStats() {
  try {
    const [pipelineCount, runCount, successCount, failedCount] = await Promise.all([
      prisma.pipeline.count(),
      prisma.run.count(),
      prisma.run.count({ where: { status: 'success' } }),
      prisma.run.count({ where: { status: 'failed' } }),
    ]);

    return { pipelineCount, runCount, successCount, failedCount };
  } catch (err) {
    logger.error('Failed in getStats', { error: err instanceof Error ? err.message : 'Unknown error' });
    throw new Error(err instanceof Error ? err.message : 'Operation failed');
  }
}
