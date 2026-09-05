import type { Task } from '../../types/experiments';

function makeStepSeq(seq: number, action: string, expected: { value: number; unit: string }[], scanTypes: string[], notes?: string): any {
  return { id: `S${seq}`, seq, action, expected, scanObjects: scanTypes.map((t, i) => ({ type: t as any, name: `${t}-${i + 1}` })), requiredFields: ['actualVolume', 'time'], notes };
}

export const tasks: Task[] = [
  {
    id: 'T001', planId: 'P001', taskName: '系统适用性验证任务',
    itemCode: '4.1', itemName: '系统适用性', itemType: '系统适用性', taskType: '系统适用性',
    methodId: 'M001', methodCode: 'BRH-MN-202506059', methodVersion: 'VAL1',
    steps: [
      { id: 'S1', seq: 1, action: '用移液器精密移取 30 μL 内标工作液 IS-WS', expected: [{ value: 30, unit: 'μL' }], scanObjects: [{ type: 'device', name: '移液器-001' }, { type: 'reagent', name: '内标工作液 IS-WS' }], requiredFields: ['actualVolume', 'time'], notes: '使用经校准移液器' },
      { id: 'S2', seq: 2, action: '用移液器精密移取 40 μL 基质样品', expected: [{ value: 40, unit: 'μL' }], scanObjects: [{ type: 'sample', name: '基质样品板' }], requiredFields: ['actualVolume', 'time'] },
      { id: 'S3', seq: 3, action: '加入沉淀剂 400 μL，涡旋 10 min，4000 rpm 离心 15 min', expected: [{ value: 400, unit: 'μL' }, { value: 10, unit: 'min' }, { value: 4000, unit: 'rpm' }, { value: 15, unit: 'min' }], scanObjects: [{ type: 'reagent', name: '沉淀剂 0.1%甲酸甲醇' }, { type: 'device', name: '涡旋振荡仪-001' }, { type: 'device', name: '离心机-001' }], requiredFields: ['actualVolume', 'vortexTime', 'centrifugeRpm', 'centrifugeTime', 'time'], notes: '离心后小心转移上清液' },
      { id: 'S4', seq: 4, action: '取上清 200 μL + 复溶液 200 μL，涡旋 5 min，4000 rpm 离心 3 min', expected: [{ value: 200, unit: 'μL' }, { value: 200, unit: 'μL' }, { value: 5, unit: 'min' }, { value: 4000, unit: 'rpm' }, { value: 3, unit: 'min' }], scanObjects: [{ type: 'device', name: '移液工作站-001' }, { type: 'reagent', name: '复溶液（超纯水）' }], requiredFields: ['actualVolume1', 'actualVolume2', 'vortexTime', 'centrifugeRpm', 'centrifugeTime', 'time'], notes: '提取回收率参照样品加的是对应浓度水平的 MS 溶液' },
      { id: 'S5', seq: 5, action: '记录处理环境与时间', expected: [], scanObjects: [], requiredFields: ['lightType', 'temperature', 'humidity', 'startTime', 'endTime'], notes: '不能立即进样应置于 4℃ 低温保存箱' },
    ],
    formTemplates: ['预处理记录表', '进样记录表'],
    responsiblePerson: '武琴',
    investigators: ['张明'],
    planDate: '2026-08-05',
    sampleBatch: 'BL-2026-001',
    instruments: ['LC-MS/MS-001'],
    status: 'passed',
  },
  {
    id: 'T002', planId: 'P001', taskName: '准确度与精密度验证',
    itemCode: '4.7', itemName: '准确度和精密度', itemType: '准确度/精密度', taskType: '定量',
    methodId: 'M001', methodCode: 'BRH-MN-202506059', methodVersion: 'VAL1',
    steps: [],
    formTemplates: ['工作溶液配制表', '预处理记录表'],
    responsiblePerson: '武琴',
    investigators: ['李华', '王芳'],
    planDate: '2026-08-12',
    sampleBatch: 'BL-2026-004',
    instruments: ['LC-MS/MS-001', 'LC-MS/MS-002'],
    status: 'scheduled',
  },
  {
    id: 'T003', planId: 'P001', taskName: '选择性考察',
    itemCode: '4.4', itemName: '选择性', itemType: '选择性', taskType: '专属性',
    methodId: 'M001', methodCode: 'BRH-MN-202506059', methodVersion: 'VAL1',
    steps: [],
    formTemplates: ['预处理记录表'],
    responsiblePerson: '武琴',
    investigators: ['张明'],
    planDate: '2026-08-08',
    sampleBatch: 'BL-2026-002',
    instruments: ['LC-MS/MS-001'],
    status: 'executing',
  },
];

export function getTasksByPlanId(planId: string): Task[] {
  return tasks.filter(t => t.planId === planId);
}
