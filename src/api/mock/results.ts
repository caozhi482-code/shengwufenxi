import type { ValidationResult, Deviation } from '../../types/experiments';

export const validationResults: ValidationResult[] = [
  { itemId: '4.1', itemName: '系统适用性', status: 'pass', cv: 1.2, re: -0.8, acceptanceCriterion: 'CV ≤ 5%, RE 在 ±5% 内' },
  { itemId: '4.2', itemName: '分析物储备液检查', status: 'pass', acceptanceCriterion: '含量 98~102%' },
  { itemId: '4.3', itemName: '残留检查', status: 'pass', carryover: 0.3, acceptanceCriterion: '残留 ≤ 20% 之 LLOQ' },
  { itemId: '4.4', itemName: '选择性', status: 'pass', acceptanceCriterion: '空白基质无干扰峰' },
  { itemId: '4.5', itemName: '基质效应', status: 'pass', cv: 3.1, acceptanceCriterion: '基质因子 RSD ≤ 15%' },
  { itemId: '4.6', itemName: '标准曲线', status: 'pass', cv: 2.4, acceptanceCriterion: 'r² ≥ 0.99' },
  { itemId: '4.7', itemName: '准确度和精密度', status: 'pending', cv: 4.2, re: 2.1, acceptanceCriterion: '准确度 85~115%, 精密度 ≤ 15%' },
  { itemId: '4.8', itemName: '提取回收率', status: 'pending', recovery: 92.3, acceptanceCriterion: '回收率 80~110%, RSD ≤ 10%' },
  { itemId: '4.9', itemName: '稀释可靠性', status: 'na', acceptanceCriterion: '稀释后结果在 ±15% 内' },
  { itemId: '4.10', itemName: '纯溶液稳定性', status: 'pass', stabilityDeviation: 1.2, acceptanceCriterion: '偏差 ≤ 10%' },
  { itemId: '4.11', itemName: '基质样品稳定性', status: 'pending', stabilityDeviation: 3.5, acceptanceCriterion: '偏差 ≤ 15%' },
  { itemId: '4.12', itemName: '处理后样品稳定性', status: 'pending', acceptanceCriterion: '偏差 ≤ 10%' },
  { itemId: '4.13', itemName: '全血稳定性', status: 'pending', acceptanceCriterion: '偏差 ≤ 15%' },
  { itemId: '4.14', itemName: '重新进样重现性', status: 'na', acceptanceCriterion: 'RSD ≤ 10%' },
  { itemId: '4.15', itemName: '样本最大批容量', status: 'na', acceptanceCriterion: '批内 RSD ≤ 15%' },
];

export const deviations: Deviation[] = [
  {
    id: 'D001', code: 'DEV-2026-001', itemId: '4.7', itemType: '准确度和精密度',
    type: 'procedure', cause: '涡旋时间不足', resolution: '重新执行，补充涡旋时间至 10 min',
    reflectedInReport: true, qaStatus: 'pending',
  },
  {
    id: 'D002', code: 'DEV-2026-002', itemId: '4.11', itemType: '基质样品稳定性',
    type: 'equipment', cause: '冰箱温度波动', resolution: '维修冰箱，重新制备样品',
    reflectedInReport: false, qaStatus: 'approved',
  },
];
