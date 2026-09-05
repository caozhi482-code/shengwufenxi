import type { SDResourceSource } from '../../types/experiments';

export type LedgerType = 'reagent' | 'consumable' | 'standard' | 'control' | 'sample' | 'solvent' | 'equipment' | 'other';
export type LedgerStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'reserved' | 'maintenance';

export interface SampleLedgerItem {
  id: string;
  name: string;
  code: string;
  type: '标准品' | '对照品' | '内标' | '质控品' | '基质';
  specification: string;
  brand: string;
  batch: string;
  stock: number;
  unit: string;
  location: string;
  expiryDate: string;
  status: LedgerStatus;
  remark?: string;
}

export interface WarehouseLedgerItem {
  id: string;
  name: string;
  code: string;
  type: LedgerType;
  specification: string;
  brand: string;
  batch: string;
  stock: number;
  unit: string;
  shelf: string;
  status: LedgerStatus;
  remark?: string;
}

export interface EquipmentLedgerItem {
  id: string;
  name: string;
  code: string;
  model: string;
  brand: string;
  serialNumber: string;
  location: string;
  status: 'available' | 'in_use' | 'maintenance' | 'calibration';
  nextCalibration: string;
  remark?: string;
}

const sampleLedger: SampleLedgerItem[] = [
  { id: 'SL-001', name: '布洛芬标准品', code: 'STD-BRF-001', type: '标准品', specification: '1000μg/mL', brand: 'USP', batch: '1HKN2', stock: 12, unit: '支', location: '标准品柜 A-01', expiryDate: '2027-06-30', status: 'in_stock' },
  { id: 'SL-002', name: '布洛芬内标工作液 IS-WS', code: 'IS-WS-001', type: '内标', specification: '10μg/mL', brand: '内部配制', batch: 'IS20260901', stock: 8, unit: '瓶', location: '工作液冰箱 -18℃', expiryDate: '2026-12-31', status: 'in_stock' },
  { id: 'SL-003', name: '布洛芬质控低值 LQC', code: 'QC-L-BRF', type: '质控品', specification: '100μg/mL', brand: '内部配制', batch: 'QCL20260901', stock: 5, unit: '支', location: '质控品冰箱 -18℃', expiryDate: '2026-11-30', status: 'in_stock' },
  { id: 'SL-004', name: '布洛芬质控高值 HQC', code: 'QC-H-BRF', type: '质控品', specification: '1000μg/mL', brand: '内部配制', batch: 'QCH20260901', stock: 5, unit: '支', location: '质控品冰箱 -18℃', expiryDate: '2026-11-30', status: 'in_stock' },
  { id: 'SL-005', name: '空白人血浆', code: 'MAT-BLD-001', type: '基质', specification: ' pooling', brand: 'BioreclamationIVT', batch: 'BLD202608', stock: 3, unit: '瓶', location: '基质冰箱 -80℃', expiryDate: '2027-03-01', status: 'in_stock' },
  { id: 'SL-006', name: '加样用空白基质', code: 'MAT-ADD-001', type: '基质', specification: '无药物人血浆', brand: 'BioreclamationIVT', batch: 'MAT202608', stock: 0, unit: '瓶', location: '基质冰箱 -80℃', expiryDate: '2027-03-01', status: 'out_of_stock' },
];

const warehouseLedger: WarehouseLedgerItem[] = [
  { id: 'WL-001', name: '乙腈（色谱纯）', code: 'REG-ACN-001', type: 'reagent', specification: '4L/瓶', brand: 'Merck', batch: 'K202601', stock: 6, unit: '瓶', shelf: '试剂架 R-01', status: 'in_stock' },
  { id: 'WL-002', name: '甲醇（色谱纯）', code: 'REG-MEO-001', type: 'reagent', specification: '4L/瓶', brand: 'Merck', batch: 'M202603', stock: 4, unit: '瓶', shelf: '试剂架 R-01', status: 'in_stock' },
  { id: 'WL-003', name: '甲酸', code: 'REG-FOR-001', type: 'reagent', specification: '500mL/瓶', brand: 'Merck', batch: 'F202602', stock: 2, unit: '瓶', shelf: '试剂架 R-02', status: 'low_stock' },
  { id: 'WL-004', name: '0.1%甲酸甲醇溶液（沉淀剂）', code: 'SOL-PRE-001', type: 'reagent', specification: '500mL/瓶', brand: '内部配制', batch: 'PRE20260901', stock: 15, unit: '瓶', shelf: '溶液柜 S-01', status: 'in_stock' },
  { id: 'WL-005', name: '超纯水（复溶液）', code: 'SOL-WAT-001', type: 'solvent', specification: '500mL/瓶', brand: 'Millipore', batch: 'WAT20260901', stock: 20, unit: '瓶', shelf: '溶液柜 S-01', status: 'in_stock' },
  { id: 'WL-006', name: '移液器吸头 200μL', code: 'CSM-TIP-200', type: 'consumable', specification: '96盒/箱', brand: 'Eppendorf', batch: '—', stock: 3, unit: '盒', shelf: '耗材架 C-03', status: 'low_stock' },
  { id: 'WL-007', name: '离心管 15mL', code: 'CSM-CNT-15', type: 'consumable', specification: '50支/袋', brand: 'Corning', batch: '—', unit: '袋', stock: 10, shelf: '耗材架 C-01', status: 'in_stock' },
  { id: 'WL-008', name: '96孔板（平底）', code: 'CSM-PLT-96', type: 'consumable', specification: '10板/盒', brand: 'Costar', batch: '—', stock: 0, unit: '盒', shelf: '耗材架 C-02', status: 'out_of_stock' },
  { id: 'WL-009', name: '样品瓶（棕色）', code: 'CSM-VIAL-2', type: 'consumable', specification: '2mL/支', brand: 'Thermo', batch: '—', stock: 200, unit: '支', shelf: '耗材架 C-04', status: 'in_stock' },
  { id: 'WL-010', name: '样品瓶盖/垫', code: 'CSM-CAP-2', type: 'consumable', specification: '套装', brand: 'Thermo', batch: '—', stock: 0, unit: '套', shelf: '耗材架 C-04', status: 'out_of_stock' },
];

const equipmentLedger: EquipmentLedgerItem[] = [
  { id: 'EL-001', name: 'LC-MS/MS 液相色谱-串联质谱仪', code: 'EQ-LCMS-001', model: 'API 5500', brand: 'SCIEX', serialNumber: 'SN20200345', location: 'LC-MS 实验室 1号机台', status: 'available', nextCalibration: '2026-12-15', remark: '年度校准到期' },
  { id: 'EL-002', name: 'LC-MS/MS 液相色谱-串联质谱仪', code: 'EQ-LCMS-002', model: 'API 5500', brand: 'SCIEX', serialNumber: 'SN20200346', location: 'LC-MS 实验室 2号机台', status: 'maintenance', nextCalibration: '2026-09-20', remark: '正在维护' },
  { id: 'EL-003', name: '移液器（单道）', code: 'EQ-PIP-001', model: 'Multipette E3', brand: 'Eppendorf', serialNumber: 'SN8801234', location: '前处理室 试剂台', status: 'available', nextCalibration: '2026-11-01' },
  { id: 'EL-004', name: '移液器（多道）', code: 'EQ-PIP-002', model: 'Multifunnel', brand: 'Eppendorf', serialNumber: 'SN8801235', location: '前处理室 加样台', status: 'available', nextCalibration: '2026-11-01' },
  { id: 'EL-005', name: '涡旋振荡仪', code: 'EQ-VOR-001', model: 'VC-300', brand: 'SCIEX', serialNumber: 'SN9900101', location: '前处理室 涡旋区', status: 'available', nextCalibration: '2027-01-01' },
  { id: 'EL-006', name: '离心机', code: 'EQ-CNT-001', model: '5810R', brand: 'Eppendorf', serialNumber: 'SN5500201', location: '前处理室 离心区', status: 'available', nextCalibration: '2027-03-01' },
  { id: 'EL-007', name: '超低温冰箱', code: 'EQ-FRG-001', model: 'UltiMate -86', brand: 'Thermo Fisher', serialNumber: 'SN7700301', location: '样品存储间', status: 'available', nextCalibration: '2027-06-01' },
  { id: 'EL-008', name: '分析天平', code: 'EQ-BAL-001', model: 'XP205', brand: 'Mettler Toledo', serialNumber: 'SN3300401', location: '称量室', status: 'available', nextCalibration: '2026-10-15' },
];

export { sampleLedger, warehouseLedger, equipmentLedger };

export function getLedgerItems(source: SDResourceSource) {
  if (source === 'sampleLedger') return sampleLedger;
  if (source === 'warehouseLedger') return warehouseLedger;
  if (source === 'equipmentLedger') return equipmentLedger;
  return [];
}
