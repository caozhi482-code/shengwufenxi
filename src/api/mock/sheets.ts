import type { DailySheet } from '../../types/experiments';

export const dailySheets: DailySheet[] = [
  { id: 'S001', date: '2026-08-12', itemCode: '4.7', itemName: '准确度和精密度', formTemplate: '预处理记录表', investigator: '张明', sampleBatch: 'BL-2026-004', instrument: 'LC-MS/MS-001', stepVersion: 'v1.2', status: 'pending' },
  { id: 'S002', date: '2026-08-12', itemCode: '4.5', itemName: '基质效应', formTemplate: '预处理记录表', investigator: '李华', sampleBatch: 'BL-2026-003', instrument: 'LC-MS/MS-002', stepVersion: 'v1.0', status: 'pending' },
  { id: 'S003', date: '2026-08-13', itemCode: '4.1', itemName: '系统适用性', formTemplate: '进样记录表', investigator: '张明', sampleBatch: 'BL-2026-001', instrument: 'LC-MS/MS-001', stepVersion: 'v1.2', status: 'executing' },
  { id: 'S004', date: '2026-08-13', itemCode: '4.8', itemName: '提取回收率', formTemplate: '预处理记录表', investigator: '李华', sampleBatch: 'BL-2026-001', instrument: 'LC-MS/MS-002', stepVersion: 'v1.0', status: 'submitted' },
  { id: 'S005', date: '2026-08-14', itemCode: '4.6', itemName: '标准曲线', formTemplate: '标准曲线记录表', investigator: '王芳', sampleBatch: 'BL-2026-001', instrument: 'LC-MS/MS-001', stepVersion: 'v1.1', status: 'pending' },
  { id: 'S006', date: '2026-08-14', itemCode: '4.2', itemName: '分析物储备液检查', formTemplate: '预处理记录表', investigator: '王芳', sampleBatch: 'BL-2026-005', instrument: 'LC-MS/MS-002', stepVersion: 'v1.0', status: 'pending' },
];

export function getSheetsByDate(date: string): DailySheet[] {
  return dailySheets.filter(s => s.date === date);
}

export function getSheetsByStatus(status: string): DailySheet[] {
  return dailySheets.filter(s => s.status === status);
}
