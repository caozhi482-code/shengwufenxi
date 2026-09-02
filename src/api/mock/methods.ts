import type { MethodFile, MethodStep } from '../../types/experiments';

const stepsVAL1: MethodStep[] = [
  {
    seq: 1,
    action: '用移液器精密移取 30 μL 内标工作液 IS-WS，置于 96 孔深孔板中',
    expected: [{ value: 30, unit: 'μL' }],
    scanObjects: ['device', 'reagent'],
    requiredFields: ['actualVolume', 'deviceId', 'reagentBatch', 'time'],
    notes: '溶剂空白（Solvent）和双空白样品（DB）及不加内标的定量上限（Single ULOQ）样品加的是稀释液2（50%乙腈水溶液）；提取回收率参照样品取的是 32 μL 复溶液（超纯水）',
  },
  {
    seq: 2,
    action: '用移液器精密移取 40 μL 基质样品，置于 96 孔深孔板中',
    expected: [{ value: 40, unit: 'μL' }],
    scanObjects: ['device', 'sample'],
    requiredFields: ['actualVolume', 'deviceId', 'sampleId', 'time'],
    notes: '溶剂空白（Solvent）样品加的是超纯水，DB 和 Blank 样品加入的是空白基质；提取回收率参照样品取的是 38 μL 空白基质',
  },
  {
    seq: 3,
    action: '用移液器精密移取 400 μL 沉淀剂（0.1%甲酸甲醇），封板后用涡旋振荡仪震荡 10 分钟，再在离心机中以 4000 rpm 离心 15 分钟',
    expected: [{ value: 400, unit: 'μL' }, { value: 10, unit: 'min' }, { value: 4000, unit: 'rpm' }, { value: 15, unit: 'min' }],
    scanObjects: ['reagent', 'device'],
    requiredFields: ['actualVolume', 'reagentBatch', 'vortexTime', 'centrifugeRpm', 'centrifugeTime', 'deviceIds', 'time'],
    notes: '离心后小心转移上清液',
  },
  {
    seq: 4,
    action: '用移液工作站精密移取 200 μL 上清于另一预先加入 200 μL 复溶液（超纯水）的 96 深孔板中，封板后用涡旋振荡仪震荡 5 分钟，再在离心机中以 4000 rpm 离心 3 分钟',
    expected: [{ value: 200, unit: 'μL' }, { value: 200, unit: 'μL' }, { value: 5, unit: 'min' }, { value: 4000, unit: 'rpm' }, { value: 3, unit: 'min' }],
    scanObjects: ['device', 'reagent'],
    requiredFields: ['actualVolume1', 'actualVolume2', 'reagentBatch', 'vortexTime', 'centrifugeRpm', 'centrifugeTime', 'deviceIds', 'time'],
    notes: '提取回收率参照样品加的是对应浓度水平的 MS 溶液',
  },
  {
    seq: 5,
    action: '记录处理环境与时间',
    expected: [],
    scanObjects: [],
    requiredFields: ['lightType', 'temperature', 'humidity', 'startTime', 'endTime'],
    notes: '不能立即进样应置于 4℃ 低温保存箱',
  },
];

export const methods: MethodFile[] = [
  {
    id: 'M001',
    code: 'BRH-MN-202506059',
    version: 'VAL1',
    name: 'LC-MSMS法测定大鼠血浆中布洛芬浓度',
    steps: stepsVAL1,
  },
  {
    id: 'M002',
    code: 'BRH-MN-202506060',
    version: 'VAL2',
    name: 'LC-MSMS法测定人血浆中巴瑞替尼浓度',
    steps: stepsVAL1,
  },
];

export function getMethodById(id: string): MethodFile | undefined {
  return methods.find(m => m.id === id);
}

export const formTemplates: Array<{
  id: string;
  name: string;
  fields: string[];
  grid: { rows: string[]; cols: number };
  cellLabel: 'well' | 'none';
}> = [
  {
    id: 'FT001', name: '加样序列表',
    fields: ['孔位', '样品编号', '体积', '扫码状态'],
    grid: { rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], cols: 12 },
    cellLabel: 'well',
  },
  {
    id: 'FT002', name: '预处理记录表',
    fields: ['批次信息', '试剂来源', '设备', '步骤参数', '环境条件', '开始时间', '结束时间', '处理人', '审核人'],
    grid: { rows: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'], cols: 4 },
    cellLabel: 'none',
  },
  {
    id: 'FT003', name: '进样记录表',
    fields: ['进样序号', '样品编号', '进样时间', '峰面积', '保留时间'],
    grid: { rows: ['I1', 'I2', 'I3', 'I4'], cols: 3 },
    cellLabel: 'none',
  },
  {
    id: 'FT004', name: '结果计算表',
    fields: ['考察项', '浓度', '回收率', 'CV', 'RE'],
    grid: { rows: ['R1', 'R2', 'R3', 'R4'], cols: 5 },
    cellLabel: 'none',
  },
];

export const scanObjectOptions: Record<string, { label: string; value: string }[]> = {
  device: [
    { label: '移液器-001', value: '移液器-001' },
    { label: '移液器-002', value: '移液器-002' },
    { label: '移液工作站-001', value: '移液工作站-001' },
    { label: '涡旋振荡仪-001', value: '涡旋振荡仪-001' },
    { label: '离心机-001', value: '离心机-001' },
  ],
  reagent: [
    { label: '内标工作液 IS-WS', value: 'IS-WS' },
    { label: '沉淀剂 0.1%甲酸甲醇', value: 'FORMIC' },
    { label: '复溶液（超纯水）', value: 'REDSOL' },
    { label: '稀释液2（50%乙腈水溶液）', value: 'DIL2' },
    { label: 'MS 溶液', value: 'MSSOL' },
  ],
  sample: [
    { label: '基质样品板', value: 'SamplePlate' },
    { label: '校正标样板', value: 'CalibratorPlate' },
    { label: 'QC 样品板', value: 'QCPlate' },
  ],
  consumable: [
    { label: '96孔深孔板', value: 'DeepWellPlate' },
    { label: '封板膜', value: 'SealFilm' },
    { label: 'EP管', value: 'EP tube' },
  ],
};

export const taskTypeOptions = [
  { label: '系统适用性', value: '系统适用性' },
  { label: '定量', value: '定量' },
  { label: '稳定性', value: '稳定性' },
  { label: '专属性', value: '专属性' },
];

export const personOptions = [
  { label: '武琴', value: '武琴' },
  { label: '李依璇', value: '李依璇' },
  { label: '张明', value: '张明' },
  { label: '李华', value: '李华' },
  { label: '王芳', value: '王芳' },
];

export const instrumentOptions = [
  { label: 'LC-MS/MS-001', value: 'LC-MS/MS-001' },
  { label: 'LC-MS/MS-002', value: 'LC-MS/MS-002' },
  { label: '液相-001', value: '液相-001' },
];
