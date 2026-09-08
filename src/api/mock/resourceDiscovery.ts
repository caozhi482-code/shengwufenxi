import type { SDResourceType } from '@/types/experiments';

export type DiscoveryStage = 'methodDev' | 'validation' | 'stability' | 'routine';

export interface ResourceDiscovery {
  id: string;
  planCode: string;
  projectId: string;
  discoverer: string;
  discoveryStage: DiscoveryStage;
  resourceName: string;
  resourceType: SDResourceType;
  usage: string;
  usageScenario: string;
  isVerified: boolean;
  suggestInclusion: boolean;
  suggestion: string;
  createdAt: string;
}

const records: ResourceDiscovery[] = [
  {
    id: 'DS-001',
    planCode: 'PLAN-BRH-BIO-2025-001-DRAFT',
    projectId: 'PRJ001',
    discoverer: '实验员张',
    discoveryStage: 'validation',
    resourceName: '布洛芬基质效应抑制物',
    resourceType: 'standard',
    usage: '基质效应考察中发现的非目标峰物质',
    usageScenario: '验证阶段基质效应考察，发现血浆中存在未知内源性干扰峰',
    isVerified: true,
    suggestInclusion: true,
    suggestion: '建议纳入方法验证报告，作为基质效应干扰物记录，必要时建立空白基质对照品',
    createdAt: '2026-09-02',
  },
  {
    id: 'DS-002',
    planCode: 'PLAN-BRH-BIO-2025-001-DRAFT',
    projectId: 'PRJ001',
    discoverer: '实验员张',
    discoveryStage: 'validation',
    resourceName: '新批号对照品稳定性异常',
    resourceType: 'standard',
    usage: '对照品稳定性考察中发现的不确定因素',
    usageScenario: '方法验证期间发现某批次对照品响应值异常偏低',
    isVerified: false,
    suggestInclusion: true,
    suggestion: '建议进一步验证该批次对照品的稳定性，确认是否需要更换批号',
    createdAt: '2026-09-01',
  },
  {
    id: 'DS-003',
    planCode: 'PLAN-BRH-BIO-2025-001-DRAFT',
    projectId: 'PRJ001',
    discoverer: '实验员李',
    discoveryStage: 'methodDev',
    resourceName: '替代内标工作液浓度优化',
    resourceType: 'standard',
    usage: '方法开发阶段优化内标浓度',
    usageScenario: '发现原IS-WS浓度下响应值偏低，建议尝试更高浓度工作液',
    isVerified: true,
    suggestInclusion: true,
    suggestion: '建议将优化后的内标浓度纳入方法验证方案，记录优化过程',
    createdAt: '2026-08-30',
  },
  {
    id: 'DS-004',
    planCode: 'PLAN-BRH-BIO-2025-001-DRAFT',
    projectId: 'PRJ001',
    discoverer: '实验员张',
    discoveryStage: 'stability',
    resourceName: '血浆样品冻融次数影响验证',
    resourceType: 'standard',
    usage: '稳定性考察中发现冻融对结果的影响',
    usageScenario: '冻融循环第2次后发现目标物峰面积下降约5%',
    isVerified: true,
    suggestInclusion: true,
    suggestion: '建议在方法验证报告中增加冻融稳定性考察项，规定最大冻融次数',
    createdAt: '2026-09-03',
  },
];

export { records };

export function getDiscoveryRecords(planCode: string, projectId: string): ResourceDiscovery[] {
  return records.filter(r => r.planCode === planCode && r.projectId === projectId);
}

export function getDiscoveryStageLabel(stage: DiscoveryStage): string {
  const map: Record<DiscoveryStage, string> = {
    methodDev: '方法开发',
    validation: '方法验证',
    stability: '稳定性',
    routine: '常规检测',
  };
  return map[stage];
}
