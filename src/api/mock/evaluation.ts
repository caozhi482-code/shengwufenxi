export interface EvaluationItem {
  id: string;
  name: string;
  type: string;
  acceptance: string;
  levels: number;
  replicates: number;
  formTemplate: string;
  stepTemplate: string;
  formTemplates: string[];
}

export const evaluationItems: EvaluationItem[] = [
  { id: '4.1', name: '系统适用性', type: '系统适用性', acceptance: 'CV ≤ 5%, RE 在 ±5% 内', levels: 1, replicates: 6, formTemplate: '系统适用性记录表', stepTemplate: '纯溶液进样', formTemplates: ['加样序列表', '进样记录表'] },
  { id: '4.2', name: '分析物储备液检查', type: '储备液检查', acceptance: '含量 98~102%', levels: 1, replicates: 3, formTemplate: '储备液检查表', stepTemplate: '储备液配制', formTemplates: ['预处理记录表'] },
  { id: '4.3', name: '残留检查', type: '残留检查', acceptance: '残留 ≤ 20% 之 LLOQ', levels: 1, replicates: 1, formTemplate: '进样记录表', stepTemplate: '纯溶液进样', formTemplates: ['加样序列表', '进样记录表'] },
  { id: '4.4', name: '选择性', type: '选择性', acceptance: '空白基质无干扰峰', levels: 1, replicates: 6, formTemplate: '预处理记录表', stepTemplate: '基质样品预处理-蛋白沉淀法', formTemplates: ['预处理记录表', '加样序列表'] },
  { id: '4.5', name: '基质效应', type: '基质效应', acceptance: '基质因子 RSD ≤ 15%', levels: 3, replicates: 6, formTemplate: '预处理记录表', stepTemplate: '基质样品预处理-蛋白沉淀法', formTemplates: ['预处理记录表'] },
  { id: '4.6', name: '标准曲线', type: '标准曲线', acceptance: 'r² ≥ 0.99', levels: 8, replicates: 1, formTemplate: '标准曲线记录表', stepTemplate: '纯溶液配制', formTemplates: ['加样序列表', '进样记录表'] },
  { id: '4.7', name: '准确度和精密度', type: '准确度/精密度', acceptance: '准确度 85~115%, 精密度 ≤ 15%', levels: 3, replicates: 5, formTemplate: '预处理记录表', stepTemplate: '基质样品预处理-蛋白沉淀法', formTemplates: ['预处理记录表', '加样序列表'] },
  { id: '4.8', name: '提取回收率', type: '提取回收率', acceptance: '回收率 80~110%, RSD ≤ 10%', levels: 3, replicates: 5, formTemplate: '预处理记录表', stepTemplate: '基质样品预处理-蛋白沉淀法', formTemplates: ['预处理记录表'] },
  { id: '4.9', name: '稀释可靠性', type: '稀释可靠性', acceptance: '稀释后结果在 ±15% 内', levels: 1, replicates: 3, formTemplate: '预处理记录表', stepTemplate: '基质样品预处理-蛋白沉淀法', formTemplates: ['预处理记录表'] },
  { id: '4.10', name: '纯溶液稳定性', type: '稳定性', acceptance: '偏差 ≤ 10%', levels: 3, replicates: 3, formTemplate: '稳定性记录表', stepTemplate: '纯溶液配制', formTemplates: ['预处理记录表'] },
  { id: '4.11', name: '基质样品稳定性', type: '稳定性', acceptance: '偏差 ≤ 15%', levels: 3, replicates: 3, formTemplate: '预处理记录表', stepTemplate: '基质样品预处理-蛋白沉淀法', formTemplates: ['预处理记录表'] },
  { id: '4.12', name: '处理后样品稳定性', type: '稳定性', acceptance: '偏差 ≤ 10%', levels: 1, replicates: 3, formTemplate: '稳定性记录表', stepTemplate: '基质样品预处理-蛋白沉淀法', formTemplates: ['预处理记录表'] },
  { id: '4.13', name: '全血稳定性', type: '稳定性', acceptance: '偏差 ≤ 15%', levels: 3, replicates: 3, formTemplate: '预处理记录表', stepTemplate: '全血样品制备', formTemplates: ['预处理记录表'] },
  { id: '4.14', name: '重新进样重现性', type: '重现性', acceptance: 'RSD ≤ 10%', levels: 1, replicates: 2, formTemplate: '进样记录表', stepTemplate: '纯溶液进样', formTemplates: ['加样序列表'] },
  { id: '4.15', name: '样本最大批容量', type: '批容量', acceptance: '批内 RSD ≤ 15%', levels: 1, replicates: 1, formTemplate: '预处理记录表', stepTemplate: '基质样品预处理-蛋白沉淀法', formTemplates: ['预处理记录表'] },
];
