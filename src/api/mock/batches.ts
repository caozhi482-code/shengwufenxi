export type BatchStatus = 'draft' | 'created' | 'items_bound' | 'templates_bound' | 'published' | 'running' | 'completed' | 'has_exception';

export interface AnalysisBatch {
  id: string;
  name: string;
  planCode: string;
  projectCode: string;
  description: string;
  plannedDate: string;
  creator: string;
  status: BatchStatus;
  itemIds: string[];
  notes: string;
}

export const analysisBatches: AnalysisBatch[] = [
  {
    id: 'BATCH-001',
    name: '批次一：基质效应与选择性',
    planCode: 'PLAN-BRH-BIO-2025-001-DRAFT',
    projectCode: 'BRH-BIO-2025-001',
    description: 'BRH-BIO-2025-001 项目第 1 批次，包含基质效应与选择性考察',
    plannedDate: '2026-09-15',
    creator: '张明',
    status: 'items_bound',
    itemIds: ['4.5', '4.4'],
    notes: '第一批样品为 BL-2026-003，共 30 个样本',
  },
  {
    id: 'BATCH-002',
    name: '批次二：准确度与精密度',
    planCode: 'PLAN-BRH-BIO-2025-001-DRAFT',
    projectCode: 'BRH-BIO-2025-001',
    description: 'BRH-BIO-2025-001 项目第 2 批次，包含准确度和精密度考察',
    plannedDate: '2026-09-20',
    creator: '张明',
    status: 'draft',
    itemIds: ['4.7'],
    notes: '第二批样品为 BL-2026-004，待确认',
  },
  {
    id: 'BATCH-003',
    name: '批次三：提取回收率',
    planCode: 'PLAN-BRH-BIO-2025-001-DRAFT',
    projectCode: 'BRH-BIO-2025-001',
    description: 'BRH-BIO-2025-001 项目第 3 批次，提取回收率考察',
    plannedDate: '2026-09-25',
    creator: '张明',
    status: 'draft',
    itemIds: ['4.8'],
    notes: '尚未选择考察项',
  },
];

export function getBatchesByPlan(planCode: string): AnalysisBatch[] {
  return analysisBatches.filter(b => b.planCode === planCode);
}

export function getBatchesByProject(projectCode: string): AnalysisBatch[] {
  return analysisBatches.filter(b => b.projectCode === projectCode);
}

export function getNextBatchId(): string {
  const max = analysisBatches.reduce((cur, b) => {
    const parsed = parseInt(b.id.replace('BATCH-', ''), 10);
    return Number.isFinite(parsed) ? Math.max(cur, parsed) : cur;
  }, 0);
  return `BATCH-${String(max + 1).padStart(3, '0')}`;
}

export const batchStatusLabels: Record<BatchStatus, { label: string; tone: string }> = {
  draft: { label: '草稿', tone: 'neutral' },
  created: { label: '已创建', tone: 'info' },
  items_bound: { label: '已关联考察项', tone: 'warning' },
  templates_bound: { label: '已绑定模板', tone: 'success' },
  published: { label: '已发布', tone: 'success' },
  running: { label: '执行中', tone: 'info' },
  completed: { label: '已完成', tone: 'success' },
  has_exception: { label: '有异常', tone: 'danger' },
};
