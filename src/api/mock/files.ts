export type FileType = 'sop' | 'method' | 'protocol';
export type FileStatus = 'active' | 'deprecated' | 'archived';

export interface FileItem {
  id: string;
  projectId: string;
  type: FileType;
  name: string;
  code: string;
  version: string;
  status: FileStatus;
  publishDate: string;
  description: string;
}

export const files: FileItem[] = [
  // SOP 文件
  { id: 'SOP001', projectId: 'PRJ001', type: 'sop', name: '血浆样品前处理标准操作规程', code: 'SOP-BA-001', version: 'V3.0', status: 'active', publishDate: '2025-01-15', description: '适用于 LC-MS/MS 法测定人血浆药物浓度' },
  { id: 'SOP002', projectId: 'PRJ001', type: 'sop', name: '标准品及对照品管理规程', code: 'SOP-BA-002', version: 'V2.1', status: 'active', publishDate: '2025-03-01', description: '标准品的储存、配制及使用规范' },
  { id: 'SOP003', projectId: 'PRJ001', type: 'sop', name: '样品稳定性管理规程', code: 'SOP-BA-003', version: 'V1.0', status: 'active', publishDate: '2025-06-10', description: '样品处理及存储条件下的稳定性管理' },
  { id: 'SOP004', projectId: 'PRJ002', type: 'sop', name: 'LC-MS/MS 仪器操作 SOP', code: 'SOP-BA-004', version: 'V2.0', status: 'active', publishDate: '2025-02-20', description: 'LC-MS/MS 仪器日常操作规范' },
  { id: 'SOP005', projectId: 'PRJ002', type: 'sop', name: '系统适用性测试规程', code: 'SOP-BA-005', version: 'V1.2', status: 'active', publishDate: '2025-04-05', description: '分析方法系统适用性评价标准' },
  // 方法开发文件
  { id: 'MTH001', projectId: 'PRJ001', type: 'method', name: '布洛芬 LC-MS/MS 分析方法开发报告', code: 'BRH-MN-202506059', version: 'VAL1', status: 'active', publishDate: '2025-06-05', description: '大鼠血浆中布洛芬浓度测定的方法开发与验证' },
  { id: 'MTH002', projectId: 'PRJ001', type: 'method', name: '布洛芬方法验证报告', code: 'BRH-MN-202506059', version: 'VAL2', status: 'active', publishDate: '2025-07-20', description: '方法学验证最终版' },
  { id: 'MTH003', projectId: 'PRJ002', type: 'method', name: '巴瑞替尼 LC-MS/MS 分析方法', code: 'BRH-MN-202506060', version: 'VAL1', status: 'active', publishDate: '2025-06-10', description: '人血浆中巴瑞替尼浓度测定方法' },
  { id: 'MTH004', projectId: 'PRJ004', type: 'method', name: '帕拉米韦生物分析方法', code: 'BRH-MN-202506062', version: 'VAL1', status: 'active', publishDate: '2025-08-01', description: '大鼠血浆中帕拉米韦浓度测定' },
  // 方案文件
  { id: 'PRO001', projectId: 'PRJ001', type: 'protocol', name: '布洛芬生物分析方法学验证方案', code: 'MV-2025-048', version: '1.0', status: 'active', publishDate: '2025-07-01', description: '验证方案，包含全部考察项' },
  { id: 'PRO002', projectId: 'PRJ001', type: 'protocol', name: '布洛芬药代动力学研究方案', code: 'PK-2025-012', version: '2.0', status: 'active', publishDate: '2025-08-10', description: '大鼠药代动力学研究实验方案' },
  { id: 'PRO003', projectId: 'PRJ002', type: 'protocol', name: '巴瑞替尼方法学验证方案', code: 'MV-2025-049', version: '1.0', status: 'active', publishDate: '2025-07-15', description: '巴瑞替尼方法学验证完整方案' },
  { id: 'PRO004', projectId: 'PRJ003', type: 'protocol', name: '奥司他韦稳定性研究方案', code: 'ST-2025-008', version: '1.0', status: 'active', publishDate: '2025-05-20', description: '奥司他韦溶液及样品稳定性研究方案' },
  { id: 'PRO005', projectId: 'PRJ004', type: 'protocol', name: '帕拉米韦生物分析方案', code: 'BA-2025-021', version: '1.0', status: 'active', publishDate: '2025-08-15', description: '帕拉米韦生物分析研究方案' },
];

const typeLabels: Record<FileType, string> = { sop: 'SOP 文件', method: '方法开发文件', protocol: '方案文件' };
const statusLabels: Record<FileStatus, 'success' | 'danger' | 'neutral'> = { active: 'success', deprecated: 'danger', archived: 'neutral' };

export function getFilesByProject(projectId: string): FileItem[] {
  return files.filter(f => f.projectId === projectId);
}

export function getFilesByType(projectId: string, type: FileType): FileItem[] {
  return files.filter(f => f.projectId === projectId && f.type === type);
}

export function getFileTypeLabel(type: FileType): string { return typeLabels[type]; }
export function getFileStatusTone(status: FileStatus): 'success' | 'danger' | 'neutral' { return statusLabels[status]; }
