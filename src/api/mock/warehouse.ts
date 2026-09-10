// 仓库管理 Mock 数据

export interface WarehouseItem {
  id: string;
  code: string;
  name: string;
  brand: string;
  spec: string;
  material: string;
  category: string;
  supplier: string;
  projectCode: string;
  stock: number;
  locked: number;
  location: string;
  safetyStock: number;
  expiryWarningDays: number;
  status: '正常' | '低库存' | '临期' | '过期';
  lastInboundTime: string;
  inboundTime: string;
  outboundTime: string;
}

export interface InboundApplication {
  id: string;
  code: string;
  applicant: string;
  department: string;
  projectCode: string;
  status: '草稿' | '待审批' | '审批中' | '已通过' | '已拒绝';
  createdAt: string;
  updatedAt: string;
  items: InboundItem[];
}

export interface InboundItem {
  id: string;
  itemName: string;
  spec: string;
  quantity: number;
  unit: string;
  location: string;
  batchNo: string;
  expiryDate: string;
}

export interface OutboundApplication {
  id: string;
  code: string;
  applicant: string;
  department: string;
  projectCode: string;
  status: '草稿' | '待审批' | '审批中' | '已通过' | '已拒绝';
  createdAt: string;
  updatedAt: string;
  items: OutboundItem[];
}

export interface OutboundItem {
  id: string;
  itemName: string;
  spec: string;
  quantity: number;
  unit: string;
  location: string;
  batchNo: string;
}

export interface StockCount {
  id: string;
  code: string;
  name: string;
  type: '定期盘点' | '专项盘点' | '临时盘点';
  status: '进行中' | '已完成' | '已取消';
  creator: string;
  createdAt: string;
  items: StockCountItem[];
}

export interface StockCountItem {
  id: string;
  itemId: string;
  itemName: string;
  code: string;
  location: string;
  systemQty: number;
  actualQty: number;
  difference: number;
  unit: string;
  remark: string;
}

export interface Location {
  id: string;
  code: string;
  name: string;
  type: '区' | '架' | '格' | '层';
  parentId: string | null;
  path: string;
  capacity: number;
  used: number;
  status: '可用' | '已满' | '锁定';
  createdAt: string;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  parentId: string | null;
  description: string;
  itemCount: number;
  createdAt: string;
}

export interface Barcode {
  id: string;
  code: string;
  targetType: '物品' | '库位' | '批次';
  targetCode: string;
  targetName: string;
  qrLink: string;
  printCount: number;
  creator: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  type: '低库存' | '临期' | '过期' | '容量预警' | '数量异常';
  targetName: string;
  location: string;
  level: '高' | '中' | '低';
  detail: string;
  notified: boolean;
  status: '待处理' | '已处理';
  createdAt: string;
  updatedAt: string;
}

// 物品台账
export const items: WarehouseItem[] = [
  { id: '1', code: 'WH-001', name: '乙腈（色谱纯）', brand: 'Merck', spec: '4L/瓶', material: '玻璃', category: '溶剂', supplier: '默克化工', projectCode: 'PROJ-2024-001', stock: 12, locked: 2, location: 'A-01-01', safetyStock: 5, expiryWarningDays: 30, status: '正常', lastInboundTime: '2024-08-15', inboundTime: '2024-08-15', outboundTime: '2024-08-20' },
  { id: '2', code: 'WH-002', name: '甲醇（色谱纯）', brand: 'TEDIA', spec: '4L/瓶', material: '玻璃', category: '溶剂', supplier: '特迪亚', projectCode: 'PROJ-2024-002', stock: 3, locked: 1, location: 'A-01-02', safetyStock: 5, expiryWarningDays: 30, status: '低库存', lastInboundTime: '2024-07-20', inboundTime: '2024-07-20', outboundTime: '2024-08-18' },
  { id: '3', code: 'WH-003', name: '磷酸二氢钾', brand: '国药', spec: '500g/瓶', material: '塑料', category: '无机盐', supplier: '国药集团', projectCode: 'PROJ-2024-003', stock: 25, locked: 0, location: 'B-02-01', safetyStock: 10, expiryWarningDays: 90, status: '正常', lastInboundTime: '2024-06-10', inboundTime: '2024-06-10', outboundTime: '2024-07-01' },
  { id: '4', code: 'WH-004', name: 'HPLC进样瓶', brand: 'Agilent', spec: '2mL/支', material: '玻璃', category: '耗材', supplier: '安捷伦', projectCode: 'PROJ-2024-001', stock: 8, locked: 3, location: 'C-01-01', safetyStock: 20, expiryWarningDays: 0, status: '低库存', lastInboundTime: '2024-08-01', inboundTime: '2024-08-01', outboundTime: '2024-08-22' },
  { id: '5', code: 'WH-005', name: '标准品-化合物A', brand: 'Sigma', spec: '100mg/支', material: '玻璃', category: '标准品', supplier: '西格玛奥德里奇', projectCode: 'PROJ-2024-004', stock: 15, locked: 0, location: 'D-01-01', safetyStock: 5, expiryWarningDays: 60, status: '正常', lastInboundTime: '2024-05-20', inboundTime: '2024-05-20', outboundTime: '2024-06-15' },
  { id: '6', code: 'WH-006', name: '乙醚', brand: '国药', spec: '500mL/瓶', material: '玻璃', category: '溶剂', supplier: '国药集团', projectCode: 'PROJ-2024-002', stock: 2, locked: 0, location: 'A-02-01', safetyStock: 3, expiryWarningDays: 7, status: '临期', lastInboundTime: '2024-01-10', inboundTime: '2024-01-10', outboundTime: '2024-08-10' },
  { id: '7', code: 'WH-007', name: '正己烷', brand: 'TEDIA', spec: '4L/瓶', material: '玻璃', category: '溶剂', supplier: '特迪亚', projectCode: 'PROJ-2024-005', stock: 0, locked: 0, location: 'A-03-01', safetyStock: 4, expiryWarningDays: 0, status: '过期', lastInboundTime: '2023-12-01', inboundTime: '2023-12-01', outboundTime: '2024-07-30' },
  { id: '8', code: 'WH-008', name: 'C18色谱柱', brand: 'Waters', spec: '250×4.6mm', material: '不锈钢', category: '耗材', supplier: '沃特世', projectCode: 'PROJ-2024-001', stock: 5, locked: 1, location: 'E-01-01', safetyStock: 2, expiryWarningDays: 0, status: '正常', lastInboundTime: '2024-04-15', inboundTime: '2024-04-15', outboundTime: '2024-05-01' },
  { id: '9', code: 'WH-009', name: '流动相缓冲盐', brand: 'Merck', spec: '1kg/袋', material: '塑料', category: '试剂', supplier: '默克化工', projectCode: 'PROJ-2024-003', stock: 18, locked: 4, location: 'B-01-02', safetyStock: 10, expiryWarningDays: 60, status: '正常', lastInboundTime: '2024-07-01', inboundTime: '2024-07-01', outboundTime: '2024-08-05' },
  { id: '10', code: 'WH-010', name: '离心管（50mL）', brand: 'Corning', spec: '50mL/支', material: '塑料', category: '耗材', supplier: '康宁', projectCode: 'PROJ-2024-006', stock: 100, locked: 20, location: 'C-02-01', safetyStock: 50, expiryWarningDays: 0, status: '正常', lastInboundTime: '2024-08-10', inboundTime: '2024-08-10', outboundTime: '2024-08-25' },
];

// 入库申请
export const inboundApplications: InboundApplication[] = [
  {
    id: '1', code: 'IN-2024-001', applicant: '张三', department: '分析部', projectCode: 'PROJ-2024-001',
    status: '已通过', createdAt: '2024-08-20', updatedAt: '2024-08-21',
    items: [
      { id: 'i1', itemName: '乙腈（色谱纯）', spec: '4L/瓶', quantity: 5, unit: '瓶', location: 'A-01-01', batchNo: 'B20240801', expiryDate: '2026-08-01' },
      { id: 'i2', itemName: '甲醇（色谱纯）', spec: '4L/瓶', quantity: 3, unit: '瓶', location: 'A-01-02', batchNo: 'B20240802', expiryDate: '2026-07-15' },
    ]
  },
  {
    id: '2', code: 'IN-2024-002', applicant: '李四', department: '药理部', projectCode: 'PROJ-2024-002',
    status: '审批中', createdAt: '2024-08-22', updatedAt: '2024-08-22',
    items: [
      { id: 'i3', itemName: '磷酸二氢钾', spec: '500g/瓶', quantity: 10, unit: '瓶', location: 'B-02-01', batchNo: 'B20240803', expiryDate: '2027-01-01' },
    ]
  },
  {
    id: '3', code: 'IN-2024-003', applicant: '王五', department: '分析部', projectCode: 'PROJ-2024-003',
    status: '草稿', createdAt: '2024-08-25', updatedAt: '2024-08-25',
    items: [
      { id: 'i4', itemName: 'HPLC进样瓶', spec: '2mL/支', quantity: 50, unit: '支', location: 'C-01-01', batchNo: 'B20240804', expiryDate: '2028-01-01' },
      { id: 'i5', itemName: '正己烷', spec: '4L/瓶', quantity: 8, unit: '瓶', location: 'A-03-01', batchNo: 'B20240805', expiryDate: '2026-03-01' },
    ]
  },
];

// 出库申请
export const outboundApplications: OutboundApplication[] = [
  {
    id: '1', code: 'OUT-2024-001', applicant: '张三', department: '分析部', projectCode: 'PROJ-2024-001',
    status: '已通过', createdAt: '2024-08-18', updatedAt: '2024-08-19',
    items: [
      { id: 'o1', itemName: '乙腈（色谱纯）', spec: '4L/瓶', quantity: 2, unit: '瓶', location: 'A-01-01', batchNo: 'B20240801' },
      { id: 'o2', itemName: 'HPLC进样瓶', spec: '2mL/支', quantity: 10, unit: '支', location: 'C-01-01', batchNo: 'B20240101' },
    ]
  },
  {
    id: '2', code: 'OUT-2024-002', applicant: '李四', department: '药理部', projectCode: 'PROJ-2024-002',
    status: '待审批', createdAt: '2024-08-23', updatedAt: '2024-08-23',
    items: [
      { id: 'o3', itemName: '磷酸二氢钾', spec: '500g/瓶', quantity: 5, unit: '瓶', location: 'B-02-01', batchNo: 'B20240601' },
    ]
  },
];

// 库存盘点
export const stockCounts: StockCount[] = [
  {
    id: '1', code: 'SC-2024-001', name: '2024年8月定期盘点', type: '定期盘点', status: '进行中', creator: '赵六', createdAt: '2024-08-25',
    items: [
      { id: 's1', itemId: '1', itemName: '乙腈（色谱纯）', code: 'WH-001', location: 'A-01-01', systemQty: 12, actualQty: 11, difference: -1, unit: '瓶', remark: '' },
      { id: 's2', itemId: '2', itemName: '甲醇（色谱纯）', code: 'WH-002', location: 'A-01-02', systemQty: 3, actualQty: 3, difference: 0, unit: '瓶', remark: '' },
      { id: 's3', itemId: '4', itemName: 'HPLC进样瓶', code: 'WH-004', location: 'C-01-01', systemQty: 8, actualQty: 7, difference: -1, unit: '支', remark: '破损1支' },
    ]
  },
  {
    id: '2', code: 'SC-2024-002', name: '标准品专项盘点', type: '专项盘点', status: '已完成', creator: '赵六', createdAt: '2024-08-20',
    items: [
      { id: 's4', itemId: '5', itemName: '标准品-化合物A', code: 'WH-005', location: 'D-01-01', systemQty: 15, actualQty: 15, difference: 0, unit: '支', remark: '' },
    ]
  },
];

// 库位
export const locations: Location[] = [
  { id: '1', code: 'A', name: 'A区-溶剂库', type: '区', parentId: null, path: 'A', capacity: 200, used: 145, status: '可用', createdAt: '2024-01-01' },
  { id: '2', code: 'A-01', name: 'A01架-有机溶剂', type: '架', parentId: '1', path: 'A/A-01', capacity: 50, used: 48, status: '已满', createdAt: '2024-01-01' },
  { id: '3', code: 'A-01-01', name: 'A01-01格', type: '格', parentId: '2', path: 'A/A-01/A-01-01', capacity: 10, used: 8, status: '可用', createdAt: '2024-01-01' },
  { id: '4', code: 'A-01-02', name: 'A01-02格', type: '格', parentId: '2', path: 'A/A-01/A-01-02', capacity: 10, used: 10, status: '已满', createdAt: '2024-01-01' },
  { id: '5', code: 'A-02', name: 'A02架-易制毒', type: '架', parentId: '1', path: 'A/A-02', capacity: 30, used: 12, status: '可用', createdAt: '2024-01-01' },
  { id: '6', code: 'B', name: 'B区-试剂库', type: '区', parentId: null, path: 'B', capacity: 300, used: 200, status: '可用', createdAt: '2024-01-01' },
  { id: '7', code: 'B-01', name: 'B01架-无机盐', type: '架', parentId: '6', path: 'B/B-01', capacity: 80, used: 55, status: '可用', createdAt: '2024-01-01' },
  { id: '8', code: 'B-02', name: 'B02架-缓冲盐', type: '架', parentId: '6', path: 'B/B-02', capacity: 60, used: 60, status: '已满', createdAt: '2024-01-01' },
  { id: '9', code: 'C', name: 'C区-耗材库', type: '区', parentId: null, path: 'C', capacity: 500, used: 300, status: '可用', createdAt: '2024-01-01' },
  { id: '10', code: 'D', name: 'D区-标准品库', type: '区', parentId: null, path: 'D', capacity: 100, used: 30, status: '可用', createdAt: '2024-01-01' },
  { id: '11', code: 'E', name: 'E区-设备耗材', type: '区', parentId: null, path: 'E', capacity: 80, used: 35, status: '可用', createdAt: '2024-01-01' },
];

// 分类
export const categories: Category[] = [
  { id: '1', code: 'CAT-001', name: '溶剂', parentId: null, description: 'HPLC/GC用有机溶剂', itemCount: 25, createdAt: '2024-01-01' },
  { id: '2', code: 'CAT-002', name: '无机盐', parentId: null, description: '缓冲盐及无机试剂', itemCount: 18, createdAt: '2024-01-01' },
  { id: '3', code: 'CAT-003', name: '耗材', parentId: null, description: '进样瓶、色谱柱等', itemCount: 42, createdAt: '2024-01-01' },
  { id: '4', code: 'CAT-004', name: '标准品', parentId: null, description: '对照品及标准物质', itemCount: 15, createdAt: '2024-01-01' },
  { id: '5', code: 'CAT-005', name: '试剂', parentId: null, description: '其他化学试剂', itemCount: 30, createdAt: '2024-01-01' },
  { id: '6', code: 'CAT-001-01', name: '有机溶剂', parentId: '1', description: 'HPLC级有机溶剂', itemCount: 12, createdAt: '2024-01-01' },
  { id: '7', code: 'CAT-001-02', name: '无机溶剂', parentId: '1', description: '酸类及其他无机溶剂', itemCount: 8, createdAt: '2024-01-01' },
  { id: '8', code: 'CAT-003-01', name: '色谱耗材', parentId: '3', description: '色谱柱、进样瓶等', itemCount: 20, createdAt: '2024-01-01' },
  { id: '9', code: 'CAT-003-02', name: '通用耗材', parentId: '3', description: '离心管、移液枪头等', itemCount: 22, createdAt: '2024-01-01' },
];

// 条码
export const barcodes: Barcode[] = [
  { id: '1', code: 'BC-20240801-001', targetType: '物品', targetCode: 'WH-001', targetName: '乙腈（色谱纯）', qrLink: 'https://qr.example.com/BC-20240801-001', printCount: 3, creator: '赵六', createdAt: '2024-08-01' },
  { id: '2', code: 'BC-20240801-002', targetType: '物品', targetCode: 'WH-002', targetName: '甲醇（色谱纯）', qrLink: 'https://qr.example.com/BC-20240801-002', printCount: 2, creator: '赵六', createdAt: '2024-08-01' },
  { id: '3', code: 'BC-20240805-001', targetType: '库位', targetCode: 'A-01-01', targetName: 'A01-01格', qrLink: 'https://qr.example.com/BC-20240805-001', printCount: 1, creator: '赵六', createdAt: '2024-08-05' },
  { id: '4', code: 'BC-20240810-001', targetType: '批次', targetCode: 'B20240801', targetName: '乙腈批次20240801', qrLink: 'https://qr.example.com/BC-20240810-001', printCount: 5, creator: '赵六', createdAt: '2024-08-10' },
  { id: '5', code: 'BC-20240815-001', targetType: '物品', targetCode: 'WH-004', targetName: 'HPLC进样瓶', qrLink: 'https://qr.example.com/BC-20240815-001', printCount: 2, creator: '赵六', createdAt: '2024-08-15' },
];

// 预警
export const alerts: Alert[] = [
  { id: '1', type: '低库存', targetName: '甲醇（色谱纯）', location: 'A-01-02', level: '高', detail: '库存数量3，低于安全库存5', notified: true, status: '待处理', createdAt: '2024-08-25', updatedAt: '2024-08-25' },
  { id: '2', type: '低库存', targetName: 'HPLC进样瓶', location: 'C-01-01', level: '高', detail: '库存数量8，低于安全库存20', notified: true, status: '待处理', createdAt: '2024-08-24', updatedAt: '2024-08-24' },
  { id: '3', type: '临期', targetName: '乙醚', location: 'A-02-01', level: '高', detail: '距离过期仅剩7天', notified: true, status: '待处理', createdAt: '2024-08-23', updatedAt: '2024-08-23' },
  { id: '4', type: '过期', targetName: '正己烷', location: 'A-03-01', level: '高', detail: '已过保质期', notified: true, status: '已处理', createdAt: '2024-08-20', updatedAt: '2024-08-22' },
  { id: '5', type: '容量预警', targetName: 'A01-02格', location: 'A-01-02', level: '中', detail: '库位占用率100%', notified: false, status: '待处理', createdAt: '2024-08-22', updatedAt: '2024-08-22' },
  { id: '6', type: '容量预警', targetName: 'B02架-缓冲盐', location: 'B-02', level: '中', detail: '库位占用率100%', notified: true, status: '已处理', createdAt: '2024-08-18', updatedAt: '2024-08-19' },
  { id: '7', type: '数量异常', targetName: '乙腈（色谱纯）', location: 'A-01-01', level: '低', detail: '盘点差异-1瓶', notified: false, status: '待处理', createdAt: '2024-08-25', updatedAt: '2024-08-25' },
];

// 仪表盘汇总数据
export const dashboardStats = {
  totalItems: 1258,
  alertCount: 12,
  pendingInbound: 5,
  inboundCount: 342,
  pendingOutbound: 3,
  outboundCount: 289,
  monthOutboundCount: 67,
  capacityAlertCount: 4,
};

// 最近预警（前5）
export const recentAlerts = alerts.slice(0, 5);

// 物品统计
export const inventoryStats = {
  total: items.length,
  normal: items.filter(i => i.status === '正常').length,
  lowStock: items.filter(i => i.status === '低库存').length,
  expiring: items.filter(i => i.status === '临期').length,
  expired: items.filter(i => i.status === '过期').length,
};
