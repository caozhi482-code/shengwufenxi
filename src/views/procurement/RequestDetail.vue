<template>
  <div class="space-y-5 pb-24" v-if="request">
    <!-- 顶部工具栏 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button class="text-xs text-[--muted-foreground] hover:text-[--text-main]" @click="goBack">← 返回</button>
        <div class="text-sm text-[--muted-foreground]">采购管理 / 采购申请 / 详情</div>
      </div>
      <div class="flex gap-2">
        <BaseButton v-if="request.status === 'draft'" variant="secondary" size="sm" @click="editRequest">编辑</BaseButton>
        <BaseButton v-if="request.status === 'draft'" variant="primary" size="sm" @click="submitApproval">提交申请</BaseButton>
        <BaseButton v-if="request.status === 'submitted'" variant="secondary" size="sm" @click="withdrawRequest">撤回</BaseButton>
        <BaseButton v-if="['submitted', 'processing'].includes(request.status)" variant="primary" size="sm" @click="startPurchase">采购负责人处理</BaseButton>
        <BaseButton v-if="request.status === 'processing'" variant="secondary" size="sm" @click="placeOrder">确认下单</BaseButton>
        <BaseButton v-if="request.status === 'ordered'" variant="primary" size="sm" @click="sendToWarehouse">交仓库验收</BaseButton>
        <BaseButton v-if="request.status === 'accepted'" variant="primary" size="sm" @click="stockRequest">验收通过并入库</BaseButton>
        <BaseButton v-if="['draft','rejected','withdrawn'].includes(request.status)" variant="secondary" size="sm" class="text-[--danger] hover:bg-[--danger-soft] border-[--danger-border]" @click="deleteRequest">删除</BaseButton>
      </div>
    </div>

    <!-- 基本信息 -->
    <BaseCard>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-base font-bold text-[--foreground]">基本信息</span>
          <StatusTag :status="request.status" :label="statusLabel(request.status)" />
        </div>
      </template>
      <div class="grid grid-cols-4 gap-4 text-sm">
        <div>
          <div class="text-[--muted-foreground] text-xs mb-1">申请单号</div>
          <div class="font-mono font-semibold text-[--text-main]">{{ request.code }}</div>
        </div>
        <div>
          <div class="text-[--muted-foreground] text-xs mb-1">申请人</div>
          <div class="font-medium text-[--text-main]">{{ request.applicant }}</div>
        </div>
        <div>
          <div class="text-[--muted-foreground] text-xs mb-1">申请部门</div>
          <div class="font-medium text-[--text-main]">{{ request.department }}</div>
        </div>
        <div>
          <div class="text-[--muted-foreground] text-xs mb-1">关联项目</div>
          <div class="font-medium text-[--text-main]">{{ request.projectName }}</div>
        </div>
        <div>
          <div class="text-[--muted-foreground] text-xs mb-1">采购分类</div>
          <div class="font-medium text-[--text-main]">{{ categoryLabel(request.category) }}</div>
        </div>
        <div>
          <div class="text-[--muted-foreground] text-xs mb-1">需求用途</div>
          <div class="font-medium text-[--text-main]">{{ request.purpose || '—' }}</div>
        </div>
        <div>
          <div class="text-[--muted-foreground] text-xs mb-1">申请日期</div>
          <div class="font-medium text-[--text-main]">{{ request.date }}</div>
        </div>
        <div>
          <div class="text-[--muted-foreground] text-xs mb-1">当前处理节点</div>
          <div class="font-medium text-[--text-main]">{{ request.currentNode || '—' }}</div>
        </div>
        <div>
          <div class="text-[--muted-foreground] text-xs mb-1">版本</div>
          <div class="font-mono text-xs text-[--text-main]">{{ request.expectedArrivalDate }}</div>
        </div>
        <div class="col-span-3">
          <div class="text-[--muted-foreground] text-xs mb-1">备注</div>
          <div class="font-medium text-[--text-main]">{{ request.notes || '—' }}</div>
        </div>
      </div>
    </BaseCard>

    <!-- 分类字段 -->
    <BaseCard>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-base font-bold text-[--foreground]">分类字段</span>
          <BaseTag tone="info" :label="categoryLabel(request.category)" />
        </div>
      </template>
      <div class="grid grid-cols-4 gap-4 text-sm">
        <template v-for="field in categoryFields" :key="field.label">
          <div v-if="field.value">
            <div class="text-[--muted-foreground] text-xs mb-1">{{ field.label }}</div>
            <div class="font-medium text-[--text-main]">{{ field.value }}</div>
          </div>
        </template>
      </div>
    </BaseCard>

    <!-- 处理流转 -->
    <BaseCard>
      <template #header>
        <span class="text-base font-bold text-[--foreground]">采购与仓库流转</span>
      </template>
      <div class="space-y-0">
        <div v-for="(step, i) in workflowSteps" :key="i" class="flex gap-4">
          <div class="flex flex-col items-center">
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold', step.done ? 'bg-[--primary] text-white' : step.current ? 'bg-[--warning] text-white' : 'bg-[--surface-muted] text-[--muted-foreground] border border-[--border]']">
              {{ step.done || step.current ? '✓' : i + 1 }}
            </div>
            <div v-if="i < workflowSteps.length - 1" :class="['w-px flex-1', step.done ? 'bg-[--primary]' : 'bg-[--border]']" />
          </div>
          <div class="pb-6 flex-1">
            <div class="flex items-center gap-3">
              <span class="text-sm font-semibold text-[--text-main]">{{ step.label }}</span>
              <BaseTag v-if="step.status" :label="step.status" :tone="step.tone" />
            </div>
            <div class="text-xs text-[--muted-foreground] mt-1">
              <span v-if="step.actor">操作人：{{ step.actor }}</span>
              <span v-if="step.time" class="ml-3">时间：{{ step.time }}</span>
            </div>
            <div v-if="step.remark" class="text-xs text-[--muted-foreground] mt-0.5">备注：{{ step.remark }}</div>
          </div>
        </div>
      </div>
    </BaseCard>

    <!-- 采购处理信息 -->
    <BaseCard v-if="request.processor || request.orderNo || request.warehouseAcceptanceNo">
      <template #header><span class="text-base font-bold text-[--foreground]">采购处理信息</span></template>
      <div class="grid grid-cols-4 gap-4 text-sm">
        <div><div class="text-[--muted-foreground] text-xs mb-1">采购负责人</div><div class="font-medium">{{ request.processor || '待分配' }}</div></div>
        <div><div class="text-[--muted-foreground] text-xs mb-1">处理时间</div><div class="font-medium">{{ request.processedAt || '—' }}</div></div>
        <div><div class="text-[--muted-foreground] text-xs mb-1">采购单号</div><div class="font-mono font-medium text-[--primary]">{{ request.orderNo || '待生成' }}</div></div>
        <div><div class="text-[--muted-foreground] text-xs mb-1">验收单号</div><div class="font-mono font-medium text-[--primary]">{{ request.warehouseAcceptanceNo || '待仓库生成' }}</div></div>
      </div>
    </BaseCard>

    <!-- 物品明细 -->
    <BaseCard>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-base font-bold text-[--foreground]">物品明细</span>
          <span class="text-xs text-[--muted-foreground]">共 {{ request.items.length }} 项</span>
        </div>
      </template>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-[--surface-muted]">
              <th class="px-4 py-2.5 text-left font-medium text-[--muted-foreground]">行号</th>
              <th class="px-4 py-2.5 text-left font-medium text-[--muted-foreground]">物品名称</th>
              <th class="px-4 py-2.5 text-left font-medium text-[--muted-foreground]">物品类型</th>
              <th class="px-4 py-2.5 text-left font-medium text-[--muted-foreground]">规格 / 品牌</th>
              <th class="px-4 py-2.5 text-left font-medium text-[--muted-foreground]">货号 / CAS</th>
              <th class="px-4 py-2.5 text-center font-medium text-[--muted-foreground]">数量</th>
              <th class="px-4 py-2.5 text-left font-medium text-[--muted-foreground]">单位</th>
              <th class="px-4 py-2.5 text-center font-medium text-[--muted-foreground]">已入库</th>
              <th class="px-4 py-2.5 text-center font-medium text-[--muted-foreground]">待入库</th>
              <th class="px-4 py-2.5 text-left font-medium text-[--muted-foreground]">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in request.items" :key="i" class="border-t border-[--border] hover:bg-[--surface-muted]">
              <td class="px-4 py-3 text-[--muted-foreground]">{{ i + 1 }}</td>
              <td class="px-4 py-3 font-medium text-[--text-main]">{{ item.itemName }}</td>
              <td class="px-4 py-3">{{ itemTypeLabel(item.itemType) }}</td>
              <td class="px-4 py-3">{{ item.spec || '—' }}<span class="text-[--muted-foreground]"> / {{ item.brand || '—' }}</span></td>
              <td class="px-4 py-3 font-mono">{{ item.catalogNo || item.casNo || '—' }}</td>
              <td class="px-4 py-3 text-center font-mono">{{ item.qty }}</td>
              <td class="px-4 py-3">{{ item.unit }}</td>
              <td class="px-4 py-3 text-center">
                <span class="text-[--success] font-semibold">{{ item.receivedQty }}</span>
              </td>
              <td class="px-4 py-3 text-center">
                <span class="font-mono">{{ item.pendingQty }}</span>
              </td>
              <td class="px-4 py-3">
                <button class="text-[--primary] hover:underline text-xs">查看</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import StatusTag from '@/components/procurement/StatusTag.vue';
import { procurementRequests } from '@/api/mock/warehouse';
import type { ProcurementRequest } from '@/api/mock/warehouse';

const route = useRoute();
const router = useRouter();

const requestId = computed(() => String(route.params.id));
const request = computed<ProcurementRequest | undefined>(() =>
  procurementRequests.find(r => r.id === requestId.value)
);

function categoryLabel(cat: string): string {
  const map: Record<string, string> = { office: '办公用品', chromatographyColumn: '色谱柱', reagent: '试剂', consumable: '耗材', equipment: '仪器设备', standard: '标准品', blankMatrix: '空白基质', other: '其他' };
  return map[cat] ?? cat;
}

function itemTypeLabel(type: string): string {
  const map: Record<string, string> = { office: '办公用品', chromatographyColumn: '色谱柱', reagent: '试剂', consumable: '耗材', equipment: '仪器设备', standard: '标准品', blankMatrix: '空白基质', other: '其他' };
  return map[type] ?? type;
}

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    draft: '草稿', submitted: '已提交', processing: '采购处理中', ordered: '已下单',
    accepted: '待仓库验收', stocked: '已入库', rejected: '已驳回', withdrawn: '已撤回',
  };
  return map[s] ?? s;
}

type WorkflowStep = {
  label: string;
  actor: string;
  time: string;
  done: boolean;
  current?: boolean;
  status: string;
  tone: 'success' | 'info' | 'warning' | 'danger' | 'neutral';
  remark?: string;
};

const workflowSteps = computed<WorkflowStep[]>(() => {
  if (!request.value) return [];
  const s = request.value.status;
  const steps: WorkflowStep[] = [
    { label: '提交申请', actor: '何晓明', time: request.value.date, done: true, status: '已通过', tone: 'success' as const },
  ];
  if (s !== 'draft') {
    steps.push({ label: '采购负责人处理', actor: request.value.processor ?? '待分配', time: request.value.processedAt ?? '', done: ['processing', 'ordered', 'accepted', 'stocked'].includes(s), current: s === 'submitted', status: s === 'submitted' ? '待处理' : '已处理', tone: s === 'submitted' ? 'warning' : 'info' });
  }
  if (['ordered', 'accepted', 'stocked'].includes(s)) {
    steps.push({ label: '采购下单', actor: request.value.processor ?? '采购负责人', time: request.value.processedAt ?? '', done: true, status: '已下单', tone: 'info' });
  }
  if (['accepted', 'stocked'].includes(s)) {
    steps.push({ label: '仓库验收', actor: '仓库管理员', time: request.value.warehouseAcceptanceNo ? '2026-09-10 09:00' : '', done: s === 'stocked', current: s === 'accepted', status: s === 'accepted' ? '验收中' : '已通过', tone: s === 'accepted' ? 'warning' : 'success' });
  }
  if (s === 'rejected') {
    steps.push({ label: '驳回', actor: '张主管', time: '2026-09-09 16:00', done: true, status: '已驳回', tone: 'danger', remark: '请补充采购规格说明' });
  }
  return steps;
});

const categoryFields = computed(() => {
  const item = request.value?.items[0];
  if (!item) return [];
  const common = [
    { label: '产品编号', value: item.productCode },
    { label: '产品类型', value: item.productType },
    { label: '规格参数', value: item.spec },
    { label: '品牌', value: item.brand },
    { label: '期望到货日期', value: request.value?.expectedArrivalDate },
  ];
  const extra: Record<string, { label: string; value?: string }[]> = {
    reagent: [{ label: 'CAS 号', value: item.casNo }, { label: '纯度 / 级别', value: item.purityLevel }, { label: '危险性分类', value: item.hazardClass }],
    standard: [{ label: 'CAS 号', value: item.casNo }, { label: '来源类型', value: item.sourceType }, { label: '是否冷链', value: item.coldChain }],
    chromatographyColumn: [{ label: '柱长 / 内径', value: item.columnSize }, { label: '填料粒径', value: item.particleSize }, { label: '孔径', value: item.poreSize }],
    equipment: [{ label: '安装地点', value: item.installLocation }, { label: '技术参数', value: item.technicalParams }],
    blankMatrix: [{ label: '基质类型', value: item.matrixType }, { label: '物种来源', value: item.species }, { label: '抗凝剂', value: item.anticoagulant }, { label: '是否冷链', value: item.coldChain }],
    consumable: [{ label: '材质', value: item.material }, { label: '洁净等级', value: item.cleanGrade }, { label: '货号', value: item.catalogNo }],
  };
  return [...common, ...(extra[request.value?.category ?? ''] ?? [])];
});

function goBack() { router.push('/procurement/requests'); }
function editRequest() { router.push(`/procurement/requests/${requestId.value}/edit`); }
function submitApproval() {
  if (request.value) {
    request.value.status = 'submitted';
    request.value.currentNode = '采购负责人处理';
  }
}
function withdrawRequest() {
  if (request.value) {
    request.value.status = 'withdrawn';
    request.value.currentNode = '—';
  }
}

function startPurchase() {
  if (!request.value) return;
  request.value.status = 'processing';
  request.value.currentNode = '采购负责人确认采购信息';
  request.value.processor = '采购负责人-刘敏';
  request.value.processedAt = '2026-09-11 10:20';
}

function placeOrder() {
  if (!request.value) return;
  request.value.status = 'ordered';
  request.value.currentNode = '待仓库验收';
  request.value.orderNo = `PO-${request.value.code.replace('PR-', '')}`;
}

function sendToWarehouse() {
  if (!request.value) return;
  request.value.status = 'accepted';
  request.value.currentNode = '仓库验收';
  request.value.warehouseAcceptanceNo = `ACC-${request.value.code.replace('PR-', '')}`;
}

function stockRequest() {
  if (!request.value) return;
  request.value.status = 'stocked';
  request.value.currentNode = '已入库';
  request.value.inboundNo = `IN-${request.value.code.replace('PR-', '')}`;
  request.value.items.forEach(item => {
    item.receivedQty = item.qty;
    item.pendingQty = 0;
    item.acceptanceStatus = 'passed';
    item.warehouseLocation = item.warehouseLocation || '待分配库位';
  });
}
function deleteRequest() {
  if (confirm('确认删除此采购申请？') && request.value) {
    const idx = procurementRequests.indexOf(request.value);
    if (idx >= 0) procurementRequests.splice(idx, 1);
    router.push('/procurement/requests');
  }
}
</script>
