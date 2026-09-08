/**
 * 统一 Demo 主线数据源
 * 所有页面通过 useWorkflowContext() 读取，确保同一套连续数据贯穿全链路。
 *
 * 主线：
 *   项目 PRJ001 → 计划 PLAN-BRH-BIO-2025-001-DRAFT → 分析批 BATCH-001 / BATCH-002 / BATCH-003
 *   → 考察项 4.1 / 4.4 / 4.5 / 4.7 / 4.8 → 任务 T001 / T002 / T003
 *   → 特殊申请 SR-001~004 / 新发现 DS-001~004
 */
import type { Plan, Task } from '../../types/experiments';
import type { AnalysisBatch, BatchStatus } from './batches';
import type { SpecialResourceRequest, RequestStatus } from './specialRequests';
import type { ResourceDiscovery, DiscoveryStage } from './resourceDiscovery';
import type { SDResourceType } from '@/types/experiments';

// ─── 常量 ────────────────────────────────────────────────────────────────────
export const DEMO_PROJECT_ID = 'PRJ001';
export const DEMO_PROJECT_CODE = 'BRH-BIO-2025-001';
export const DEMO_PLAN_CODE = 'PLAN-BRH-BIO-2025-001-DRAFT';
export const DEMO_BATCH_IDS = ['BATCH-001', 'BATCH-002', 'BATCH-003'];
export const DEMO_ITEM_IDS = ['4.1', '4.4', '4.5', '4.7', '4.8'];
export const DEMO_TASK_IDS = ['T001', 'T002', 'T003'];
export const DEMO_METHOD_CODE = 'BRH-MN-202506059';
export const DEMO_METHOD_VERSION = 'VAL1';
export const DEMO_LOCALSTORAGE_KEY = `demo-workflow::${DEMO_PLAN_CODE}`;

// ─── 项目信息 ────────────────────────────────────────────────────────────────
export const demoProject = {
  id: DEMO_PROJECT_ID,
  code: DEMO_PROJECT_CODE,
  name: '布洛芬 bio 分析项目',
  department: '生物分析部',
  manager: '武琴',
  researchArea: '药代动力学',
  status: 'active' as const,
};

// ─── 计划信息 ────────────────────────────────────────────────────────────────
export const demoPlan: Plan = {
  id: DEMO_PLAN_CODE,
  code: DEMO_PLAN_CODE,
  projectName: demoProject.name,
  version: 'MV-2025-048 / 1V',
  methodCode: DEMO_METHOD_CODE,
  methodVersion: DEMO_METHOD_VERSION,
  responsiblePerson: '武琴',
  investigators: ['张明', '李华', '王芳'],
  itemCount: DEMO_ITEM_IDS.length,
  status: 'running',
  startDate: '2026-09-01',
  endDate: '2026-09-30',
  createdAt: '2026-08-25 09:00:00',
};

// ─── 分析批 ──────────────────────────────────────────────────────────────────
export const demoBatches: AnalysisBatch[] = [
  {
    id: 'BATCH-001',
    name: '批次一：基质效应与选择性',
    planCode: DEMO_PLAN_CODE,
    projectCode: DEMO_PROJECT_CODE,
    description: `${DEMO_PROJECT_CODE} 项目第 1 批次，包含基质效应与选择性考察`,
    plannedDate: '2026-09-15',
    creator: '张明',
    status: 'items_bound',
    itemIds: ['4.5', '4.4'],
    notes: '第一批样品为 BL-2026-003，共 30 个样本',
  },
  {
    id: 'BATCH-002',
    name: '批次二：准确度与精密度',
    planCode: DEMO_PLAN_CODE,
    projectCode: DEMO_PROJECT_CODE,
    description: `${DEMO_PROJECT_CODE} 项目第 2 批次，包含准确度和精密度考察`,
    plannedDate: '2026-09-20',
    creator: '张明',
    status: 'draft',
    itemIds: ['4.7'],
    notes: '第二批样品为 BL-2026-004，待确认',
  },
  {
    id: 'BATCH-003',
    name: '批次三：提取回收率',
    planCode: DEMO_PLAN_CODE,
    projectCode: DEMO_PROJECT_CODE,
    description: `${DEMO_PROJECT_CODE} 项目第 3 批次，提取回收率考察`,
    plannedDate: '2026-09-25',
    creator: '张明',
    status: 'draft',
    itemIds: ['4.8'],
    notes: '尚未选择考察项',
  },
];

// ─── 任务（与计划 / 批次 / 考察项关联）────────────────────────────────────
export const demoTasks: Task[] = [
  {
    id: 'T001',
    planId: DEMO_PLAN_CODE,
    taskName: '系统适用性验证任务',
    itemCode: '4.1',
    itemName: '系统适用性',
    itemType: '系统适用性',
    taskType: '系统适用性',
    methodId: 'M001',
    methodCode: DEMO_METHOD_CODE,
    methodVersion: DEMO_METHOD_VERSION,
    steps: [
      {
        id: 'S1', seq: 1,
        action: '用移液器精密移取 30 μL 内标工作液 IS-WS',
        expected: [{ value: 30, unit: 'μL' }],
        scanObjects: [{ type: 'device', name: '移液器-001' }, { type: 'reagent', name: '内标工作液 IS-WS' }],
        requiredFields: ['actualVolume', 'time'],
        notes: '使用经校准移液器',
      },
      {
        id: 'S2', seq: 2,
        action: '用移液器精密移取 40 μL 基质样品',
        expected: [{ value: 40, unit: 'μL' }],
        scanObjects: [{ type: 'sample', name: '基质样品板' }],
        requiredFields: ['actualVolume', 'time'],
      },
      {
        id: 'S3', seq: 3,
        action: '加入沉淀剂 400 μL，涡旋 10 min，4000 rpm 离心 15 min',
        expected: [{ value: 400, unit: 'μL' }, { value: 10, unit: 'min' }, { value: 4000, unit: 'rpm' }, { value: 15, unit: 'min' }],
        scanObjects: [
          { type: 'reagent', name: '沉淀剂 0.1%甲酸甲醇' },
          { type: 'device', name: '涡旋振荡仪-001' },
          { type: 'device', name: '离心机-001' },
        ],
        requiredFields: ['actualVolume', 'vortexTime', 'centrifugeRpm', 'centrifugeTime', 'time'],
        notes: '离心后小心转移上清液',
      },
    ],
    formTemplates: ['预处理记录表', '进样记录表'],
    responsiblePerson: '武琴',
    investigators: ['张明'],
    planDate: '2026-09-15',
    sampleBatch: 'BL-2026-003',
    instruments: ['LC-MS/MS-001'],
    status: 'scheduled',
  },
  {
    id: 'T002',
    planId: DEMO_PLAN_CODE,
    taskName: '准确度与精密度验证',
    itemCode: '4.7',
    itemName: '准确度和精密度',
    itemType: '准确度/精密度',
    taskType: '定量',
    methodId: 'M001',
    methodCode: DEMO_METHOD_CODE,
    methodVersion: DEMO_METHOD_VERSION,
    steps: [],
    formTemplates: ['工作溶液配制表', '预处理记录表'],
    responsiblePerson: '武琴',
    investigators: ['李华', '王芳'],
    planDate: '2026-09-20',
    sampleBatch: 'BL-2026-004',
    instruments: ['LC-MS/MS-001', 'LC-MS/MS-002'],
    status: 'draft',
  },
  {
    id: 'T003',
    planId: DEMO_PLAN_CODE,
    taskName: '选择性考察',
    itemCode: '4.4',
    itemName: '选择性',
    itemType: '选择性',
    taskType: '专属性',
    methodId: 'M001',
    methodCode: DEMO_METHOD_CODE,
    methodVersion: DEMO_METHOD_VERSION,
    steps: [],
    formTemplates: ['预处理记录表'],
    responsiblePerson: '武琴',
    investigators: ['张明'],
    planDate: '2026-09-12',
    sampleBatch: 'BL-2026-003',
    instruments: ['LC-MS/MS-001'],
    status: 'published',
  },
];

// ─── 特殊资源申请（与主线关联）─────────────────────────────────────────────
export const demoSpecialRequests: SpecialResourceRequest[] = [
  {
    id: 'SR-001',
    planCode: DEMO_PLAN_CODE,
    projectId: DEMO_PROJECT_ID,
    applicant: '实验员张',
    resource: {
      name: '0.1%甲酸甲醇溶液（沉淀剂）',
      materialCode: 'SOL-PRE-001',
      type: 'reagent' as SDResourceType,
      specification: '500mL/瓶',
      unit: '瓶',
      plannedQty: 15,
      brand: '内部配制',
      expectedArrival: '2026-09-20',
      isCritical: true,
      priority: 'high' as const,
      remark: '储备液配制需用',
      source: 'special' as const,
    },
    status: 'pending' as RequestStatus,
    reason: '储备液配制试剂，仓库台账暂无库存，需向SD申请调配',
    createdAt: '2026-09-02',
  },
  {
    id: 'SR-002',
    planCode: DEMO_PLAN_CODE,
    projectId: DEMO_PROJECT_ID,
    applicant: '实验员张',
    resource: {
      name: '样品瓶（棕色）',
      materialCode: 'CSM-VIAL-2',
      type: 'consumable' as SDResourceType,
      specification: '2mL/支',
      unit: '支',
      plannedQty: 200,
      brand: 'Thermo',
      expectedArrival: '2026-09-25',
      isCritical: false,
      priority: 'medium' as const,
      remark: '进样用样品瓶',
      source: 'special' as const,
    },
    status: 'approved' as RequestStatus,
    reason: 'LC-MS进样样品瓶，仓库台账仅余200支，需补充',
    approvedBy: '武琴',
    approvedAt: '2026-09-02',
    createdAt: '2026-09-01',
  },
  {
    id: 'SR-003',
    planCode: DEMO_PLAN_CODE,
    projectId: DEMO_PROJECT_ID,
    applicant: '实验员张',
    resource: {
      name: '移液器吸头 200μL',
      materialCode: 'CSM-TIP-200',
      type: 'consumable' as SDResourceType,
      specification: '96盒/箱',
      unit: '盒',
      plannedQty: 3,
      brand: 'Eppendorf',
      expectedArrival: '2026-09-30',
      isCritical: false,
      priority: 'low' as const,
      remark: '样品前处理专用吸头',
      source: 'special' as const,
    },
    status: 'rejected' as RequestStatus,
    reason: '方法中未使用移液器吸头，改用枪头即可',
    approvedBy: '武琴',
    approvedAt: '2026-09-06 09:00:00',
    rejectionReason: '方法开发文件未明确此耗材需求，建议确认方法步骤',
    createdAt: '2026-09-01',
  },
  {
    id: 'SR-004',
    planCode: DEMO_PLAN_CODE,
    projectId: DEMO_PROJECT_ID,
    applicant: '实验员张',
    resource: {
      name: '甲酸',
      materialCode: 'REG-FOR-001',
      type: 'reagent' as SDResourceType,
      specification: '500mL/瓶',
      unit: '瓶',
      plannedQty: 2,
      brand: 'Merck',
      expectedArrival: '2026-10-01',
      isCritical: true,
      priority: 'high' as const,
      remark: '流动相添加剂',
      source: 'special' as const,
    },
    status: 'supplemented' as RequestStatus,
    reason: '流动相配制试剂，仓库台账库存偏低',
    approvedBy: '武琴',
    approvedAt: '2026-09-01',
    createdAt: '2026-08-30',
  },
];

// ─── 新发现资源记录（与主线关联）───────────────────────────────────────────
export const demoDiscoveryRecords: ResourceDiscovery[] = [
  {
    id: 'DS-001',
    planCode: DEMO_PLAN_CODE,
    projectId: DEMO_PROJECT_ID,
    discoverer: '实验员张',
    discoveryStage: 'validation',
    resourceName: '布洛芬基质效应抑制物',
    resourceType: 'reagent',
    usage: '基质效应考察中发现',
    usageScenario: '批次一：基质效应与选择性',
    isVerified: true,
    suggestInclusion: true,
    suggestion: '建议纳入分析方法确认，排除干扰',
    createdAt: '2026-09-10 15:30:00',
  },
  {
    id: 'DS-002',
    planCode: DEMO_PLAN_CODE,
    projectId: DEMO_PROJECT_ID,
    discoverer: '实验员张',
    discoveryStage: 'validation',
    resourceName: '新批号对照品稳定性异常',
    resourceType: 'standard',
    usage: '对照品稳定性考察中发现',
    usageScenario: '批次二：准确度与精密度',
    isVerified: false,
    suggestInclusion: true,
    suggestion: '需进一步验证该批号稳定性',
    createdAt: '2026-09-11 09:00:00',
  },
  {
    id: 'DS-003',
    planCode: DEMO_PLAN_CODE,
    projectId: DEMO_PROJECT_ID,
    discoverer: '实验员李',
    discoveryStage: 'methodDev',
    resourceName: '替代内标工作液浓度优化',
    resourceType: 'reagent',
    usage: '内标工作液配制中发现浓度偏差',
    usageScenario: '全批次通用',
    isVerified: true,
    suggestInclusion: true,
    suggestion: '建议调整 IS-WS 浓度至 50ng/mL',
    createdAt: '2026-09-08 11:20:00',
  },
  {
    id: 'DS-004',
    planCode: DEMO_PLAN_CODE,
    projectId: DEMO_PROJECT_ID,
    discoverer: '实验员张',
    discoveryStage: 'stability',
    resourceName: '血浆样品冻融次数影响验证',
    resourceType: 'sample',
    usage: '样品稳定性考察中发现冻融影响',
    usageScenario: '批次一、批次三',
    isVerified: true,
    suggestInclusion: true,
    suggestion: '建议明确冻融次数上限为 2 次',
    createdAt: '2026-09-09 14:00:00',
  },
];

// ─── 查询函数 ────────────────────────────────────────────────────────────────
export function getDemoBatch(batchId: string): AnalysisBatch | undefined {
  return demoBatches.find(b => b.id === batchId);
}

export function getDemoBatchesByPlan(): AnalysisBatch[] {
  return demoBatches;
}

export function getDemoTasksByPlan(): Task[] {
  return demoTasks;
}

export function getDemoTask(taskId: string): Task | undefined {
  return demoTasks.find(t => t.id === taskId);
}

export function getDemoTasksByBatch(batchId: string): Task[] {
  const batch = getDemoBatch(batchId);
  if (!batch) return [];
  const itemIds = new Set(batch.itemIds);
  return demoTasks.filter(t => itemIds.has(t.itemCode));
}

export function getDemoSpecialRequests(): SpecialResourceRequest[] {
  return demoSpecialRequests;
}

export function getDemoDiscoveryRecords(): ResourceDiscovery[] {
  return demoDiscoveryRecords;
}
