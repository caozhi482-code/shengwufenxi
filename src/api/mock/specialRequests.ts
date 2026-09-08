import type { SDResourceItem } from '@/types/experiments';

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'supplemented';

export interface SpecialResourceRequest {
  id: string;
  planCode: string;
  projectId: string;
  applicant: string;
  resource: Omit<SDResourceItem, 'id' | 'instanceId' | 'itemId' | 'itemName' | 'templateId' | 'templateName' | 'currentStock' | 'gapQty' | 'status'>;
  status: RequestStatus;
  reason: string;
  approvedBy: string;
  approvedAt: string;
  rejectionReason?: string;
  createdAt: string;
  remark?: string;
}

const requests: SpecialResourceRequest[] = [
  {
    id: 'SR-001',
    planCode: 'PLAN-BRH-BIO-2025-001-DRAFT',
    projectId: 'PRJ001',
    applicant: '实验员张',
    resource: {
      name: '0.1%甲酸甲醇溶液（沉淀剂）',
      materialCode: 'SOL-PRE-001',
      type: 'reagent',
      specification: '500mL/瓶',
      unit: '瓶',
      plannedQty: 15,
      brand: '内部配制',
      expectedArrival: '2026-09-20',
      isCritical: true,
      priority: 'high',
      remark: '储备液配制需用',
      source: 'special',
    },
    status: 'pending',
    reason: '储备液配制试剂，仓库台账暂无库存，需向SD申请调配',
    createdAt: '2026-09-02',
  },
  {
    id: 'SR-002',
    planCode: 'PLAN-BRH-BIO-2025-001-DRAFT',
    projectId: 'PRJ001',
    applicant: '实验员张',
    resource: {
      name: '样品瓶（棕色）',
      materialCode: 'CSM-VIAL-2',
      type: 'consumable',
      specification: '2mL/支',
      unit: '支',
      plannedQty: 200,
      brand: 'Thermo',
      expectedArrival: '2026-09-25',
      isCritical: false,
      priority: 'medium',
      remark: '进样用样品瓶',
      source: 'special',
    },
    status: 'approved',
    reason: 'LC-MS进样样品瓶，仓库台账仅余200支，需补充',
    approvedBy: '武琴',
    approvedAt: '2026-09-02',
    createdAt: '2026-09-01',
  },
  {
    id: 'SR-003',
    planCode: 'PLAN-BRH-BIO-2025-001-DRAFT',
    projectId: 'PRJ001',
    applicant: '实验员张',
    resource: {
      name: '移液器吸头 200μL',
      materialCode: 'CSM-TIP-200',
      type: 'consumable',
      specification: '96盒/箱',
      unit: '盒',
      plannedQty: 3,
      brand: 'Eppendorf',
      expectedArrival: '2026-09-30',
      isCritical: false,
      priority: 'low',
      remark: '样品前处理专用吸头',
      source: 'special',
    },
    status: 'rejected',
    reason: '方法中未使用移液器吸头，改用枪头即可',
    rejectionReason: '方法开发文件未明确此耗材需求，建议确认方法步骤',
    createdAt: '2026-09-01',
  },
  {
    id: 'SR-004',
    planCode: 'PLAN-BRH-BIO-2025-001-DRAFT',
    projectId: 'PRJ001',
    applicant: '实验员张',
    resource: {
      name: '甲酸',
      materialCode: 'REG-FOR-001',
      type: 'reagent',
      specification: '500mL/瓶',
      unit: '瓶',
      plannedQty: 2,
      brand: 'Merck',
      expectedArrival: '2026-10-01',
      isCritical: true,
      priority: 'high',
      remark: '流动相添加剂',
      source: 'special',
    },
    status: 'supplemented',
    reason: '流动相配制试剂，仓库台账库存偏低',
    approvedBy: '武琴',
    approvedAt: '2026-09-01',
    createdAt: '2026-08-30',
  },
];

export { requests };

export function getSpecialRequests(planCode: string, projectId: string): SpecialResourceRequest[] {
  return requests.filter(r => r.planCode === planCode && r.projectId === projectId);
}

export function getRequestStatusLabel(status: RequestStatus): string {
  const map: Record<RequestStatus, string> = {
    pending: '待审批',
    approved: '已批准',
    rejected: '已驳回',
    supplemented: '已补充',
  };
  return map[status];
}

export function getRequestStatusTone(status: RequestStatus): 'warning' | 'success' | 'danger' | 'info' {
  const map: Record<RequestStatus, 'warning' | 'success' | 'danger' | 'info'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    supplemented: 'info',
  };
  return map[status];
}
