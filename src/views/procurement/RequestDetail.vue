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
        <BaseButton v-if="request.status === 'draft'" variant="primary" size="sm" @click="submitApproval">提交审批</BaseButton>
        <BaseButton v-if="request.status === 'pending'" variant="secondary" size="sm" @click="withdrawRequest">撤回</BaseButton>
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
          <div class="text-[--muted-foreground] text-xs mb-1">采购用途</div>
          <div class="font-medium text-[--text-main]">{{ request.purpose || '—' }}</div>
        </div>
        <div>
          <div class="text-[--muted-foreground] text-xs mb-1">申请日期</div>
          <div class="font-medium text-[--text-main]">{{ request.date }}</div>
        </div>
        <div>
          <div class="text-[--muted-foreground] text-xs mb-1">当前审批节点</div>
          <div class="font-medium text-[--text-main]">{{ request.currentNode || '—' }}</div>
        </div>
        <div>
          <div class="text-[--muted-foreground] text-xs mb-1">版本</div>
          <div class="font-mono text-xs text-[--text-main]">v1.0</div>
        </div>
        <div class="col-span-3">
          <div class="text-[--muted-foreground] text-xs mb-1">备注</div>
          <div class="font-medium text-[--text-main]">{{ request.notes || '—' }}</div>
        </div>
      </div>
    </BaseCard>

    <!-- 审批时间线 -->
    <BaseCard>
      <template #header>
        <span class="text-base font-bold text-[--foreground]">审批流程</span>
      </template>
      <div class="space-y-0">
        <div v-for="(step, i) in approvalSteps" :key="i" class="flex gap-4">
          <div class="flex flex-col items-center">
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold', step.done ? 'bg-[--primary] text-white' : step.current ? 'bg-[--warning] text-white' : 'bg-[--surface-muted] text-[--muted-foreground] border border-[--border]']">
              {{ step.done || step.current ? '✓' : i + 1 }}
            </div>
            <div v-if="i < approvalSteps.length - 1" :class="['w-px flex-1', step.done ? 'bg-[--primary]' : 'bg-[--border]']" />
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
  const map: Record<string, string> = { reagent: '试剂', consumable: '耗材', equipment: '设备', standard: '标准品', other: '其他' };
  return map[cat] ?? cat;
}

function itemTypeLabel(type: string): string {
  const map: Record<string, string> = { reagent: '试剂', consumable: '耗材', equipment: '设备', standard: '标准品' };
  return map[type] ?? type;
}

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    draft: '草稿', pending: '审批中', approved: '已审批', rejected: '已驳回',
    withdrawn: '已撤回', purchasing: '待采购', received: '处理中', completed: '已完成',
  };
  return map[s] ?? s;
}

const approvalSteps = computed(() => {
  if (!request.value) return [];
  const s = request.value.status;
  const steps = [
    { label: '提交申请', actor: '何晓明', time: request.value.date, done: true, status: '已通过', tone: 'success' as const },
  ];
  if (['pending', 'approved', 'rejected'].includes(s)) {
    steps.push({ label: '部门主管审批', actor: '张主管', time: '2026-09-08 10:30', done: s !== 'draft', current: s === 'pending', status: s === 'approved' ? '已通过' : s === 'rejected' ? '已驳回' : '审批中', tone: s === 'approved' ? 'success' : s === 'rejected' ? 'danger' : 'warning' });
  }
  if (['purchasing', 'received', 'completed'].includes(s)) {
    steps.push({ label: '采购执行', actor: '采购部', time: '2026-09-09 14:00', done: true, status: '已执行', tone: 'info' });
  }
  if (s === 'completed') {
    steps.push({ label: '验收入库', actor: '仓库管理员', time: '2026-09-10 09:00', done: true, status: '已完成', tone: 'success' });
  }
  if (s === 'rejected') {
    steps.push({ label: '驳回', actor: '张主管', time: '2026-09-09 16:00', done: true, status: '已驳回', tone: 'danger', remark: '请补充采购规格说明' });
  }
  return steps;
});

function goBack() { router.push('/procurement/requests'); }
function editRequest() { router.push(`/procurement/requests/${requestId.value}/edit`); }
function submitApproval() {
  if (request.value) {
    request.value.status = 'pending';
    request.value.currentNode = '部门主管审批';
  }
}
function withdrawRequest() {
  if (request.value) {
    request.value.status = 'withdrawn';
    request.value.currentNode = '—';
  }
}
function deleteRequest() {
  if (confirm('确认删除此采购申请？') && request.value) {
    const idx = procurementRequests.indexOf(request.value);
    if (idx >= 0) procurementRequests.splice(idx, 1);
    router.push('/procurement/requests');
  }
}
</script>
