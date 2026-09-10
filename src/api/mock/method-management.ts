export type MethodLibraryKind = 'integration' | 'acquisition';
export type MethodLibraryStatus = 'draft' | 'enabled' | 'archived';

export interface MethodLibraryRecord {
  id: string;
  kind: MethodLibraryKind;
  methodName: string;
  methodCode: string;
  version: string;
  projectCode: string;
  analyte: string;
  instrument: string;
  owner: string;
  status: MethodLibraryStatus;
  updatedAt: string;
  remark: string;
}

export const methodLibraryKinds: Array<{ label: string; value: MethodLibraryKind; description: string }> = [
  {
    label: '积分方法文件管理库',
    value: 'integration',
    description: '管理色谱峰积分、处理参数、定量规则等方法文件，供实验执行和结果复核引用。',
  },
  {
    label: '采集方法库',
    value: 'acquisition',
    description: '管理仪器采集方法、进样参数、液相/质谱条件等文件，供进样和采集任务引用。',
  },
];

export const methodLibraryStatuses = [
  { label: '全部', value: '' },
  { label: '草稿', value: 'draft' },
  { label: '启用', value: 'enabled' },
  { label: '归档', value: 'archived' },
];

export const methodLibraryRecords: MethodLibraryRecord[] = [
  {
    id: 'INT-001',
    kind: 'integration',
    methodName: '布洛芬血浆样品积分方法',
    methodCode: 'INT-BRH-202506059-01',
    version: 'V1.0',
    projectCode: 'BRH-BIO-2025-001',
    analyte: '布洛芬',
    instrument: 'Analyst / MultiQuant',
    owner: '李依璇',
    status: 'enabled',
    updatedAt: '2026-09-03 10:20',
    remark: '用于布洛芬方法学验证分析批的峰识别与积分处理。',
  },
  {
    id: 'INT-002',
    kind: 'integration',
    methodName: '巴瑞替尼低浓度样品积分方法',
    methodCode: 'INT-BRT-202506060-02',
    version: 'V1.1',
    projectCode: 'BRH-BIO-2025-002',
    analyte: '巴瑞替尼',
    instrument: 'MultiQuant',
    owner: '张明',
    status: 'draft',
    updatedAt: '2026-09-04 14:12',
    remark: '低浓度样品积分参数待复核。',
  },
  {
    id: 'ACQ-001',
    kind: 'acquisition',
    methodName: '布洛芬 LC-MS/MS 采集方法',
    methodCode: 'ACQ-BRH-202506059-01',
    version: 'VAL1',
    projectCode: 'BRH-BIO-2025-001',
    analyte: '布洛芬',
    instrument: 'LC-MS/MS-001',
    owner: '武琴',
    status: 'enabled',
    updatedAt: '2026-09-02 16:45',
    remark: '包含色谱条件、MRM 离子对、进样体积与运行时间。',
  },
  {
    id: 'ACQ-002',
    kind: 'acquisition',
    methodName: '帕拉米韦 LC-MS/MS 采集方法',
    methodCode: 'ACQ-PLMW-202506062-01',
    version: 'VAL1',
    projectCode: 'BRH-BIO-2025-004',
    analyte: '帕拉米韦',
    instrument: 'LC-MS/MS-002',
    owner: '李华',
    status: 'enabled',
    updatedAt: '2026-09-05 09:30',
    remark: '用于方法确认阶段采集任务。',
  },
];
