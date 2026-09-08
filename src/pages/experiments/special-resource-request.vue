<template>
  <div class="space-y-5 pb-24">
    <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] px-5 py-4">
      <StepWizard :steps="steps" :current="4" />
    </div>

    <BasePageHeader
      title="特殊资源申请"
      subtitle="实验过程中发现调配资源池未覆盖的资源，向 SD 负责人提交申请"
    >
      <template #extra>
        <BaseButton variant="secondary" size="sm" @click="backToWorkspace">返回工作台</BaseButton>
      </template>
    </BasePageHeader>

    <div class="grid grid-cols-3 gap-5">
      <div class="col-span-2 space-y-5">
        <!-- 申请单列表 -->
        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <span class="text-base font-bold text-[--foreground]">申请单列表</span>
                <div class="text-xs text-[--muted-foreground] mt-0.5">当前计划的所有特殊资源申请记录</div>
              </div>
              <BaseButton variant="primary" size="sm" @click="openAddDialog">+ 新增申请</BaseButton>
            </div>
          </template>

          <div v-if="requests.length === 0" class="py-8 text-center text-sm text-[--muted-foreground]">
            暂无特殊资源申请，点击右上角新增申请
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="req in requests"
              :key="req.id"
              class="border border-[--border] rounded-lg p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm font-semibold text-[--text-main]">{{ req.resource.name }}</span>
                    <BaseTag :label="resourceTypeLabel(req.resource.type)" :tone="resourceTypeTone(req.resource.type)" />
                    <BaseTag :label="getRequestStatusLabel(req.status)" :tone="getRequestStatusTone(req.status)" />
                    <BaseTag
                      v-if="req.resource.isCritical"
                      label="关键"
                      tone="danger"
                    />
                  </div>
                  <div class="text-xs text-[--muted-foreground] mt-1">
                    {{ req.resource.materialCode }} · {{ req.resource.specification }} · 数量 {{ req.resource.plannedQty }}{{ req.resource.unit }} · 优先级 {{ priorityLabel(req.resource.priority) }}
                  </div>
                  <div class="text-xs text-[--muted-foreground] mt-1">
                    申请原因：{{ req.reason }}
                  </div>
                  <div v-if="req.rejectionReason" class="text-xs text-[--danger] mt-1">
                    驳回原因：{{ req.rejectionReason }}
                  </div>
                  <div class="text-xs text-[--muted-foreground] mt-1">
                    申请人：{{ req.applicant }} · 申请时间：{{ req.createdAt }}
                    <span v-if="req.approvedBy">· 审批人：{{ req.approvedBy }} · 审批时间：{{ req.approvedAt }}</span>
                  </div>
                </div>
                <div class="shrink-0">
                  <BaseButton
                    v-if="req.status === 'pending'"
                    variant="secondary"
                    size="sm"
                    @click="openAddDialog(req)"
                  >
                    编辑
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- 新增/编辑弹窗 -->
        <BaseCard v-if="dialogOpen">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-base font-bold text-[--foreground]">
                {{ editingReq ? '编辑申请' : '新增特殊资源申请' }}
              </span>
              <button class="text-[--muted-foreground] hover:text-[--text-main]" @click="dialogOpen = false">✕</button>
            </div>
          </template>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <BaseFormField v-model="form.name" label="资源名称" placeholder="如：甲酸（色谱纯）" />
              <BaseFormField v-model="form.materialCode" label="物料编码" placeholder="如：REG-FOR-001" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <BaseFormField v-model="form.type" label="资源类型" type="select" :options="resourceTypeOptions" />
              <BaseFormField v-model="form.priority" label="优先级" type="select" :options="priorityOptions" />
            </div>
            <div class="grid grid-cols-3 gap-3">
              <BaseFormField v-model="form.specification" label="规格" placeholder="如：500mL/瓶" />
              <BaseFormField v-model="form.unit" label="单位" placeholder="如：瓶" />
              <BaseFormField v-model="form.plannedQty" label="计划数量" type="number" placeholder="如：2" />
            </div>
            <BaseFormField v-model="form.brand" label="品牌/厂家" placeholder="如：Merck" />
            <BaseFormField v-model="form.expectedArrival" label="预计到货日期" type="date" />
            <BaseFormField v-model="form.reason" label="申请原因" type="textarea" placeholder="请说明为何该资源不在已调配资源池中，以及用途" />
            <BaseFormField v-model="form.remark" label="备注" type="textarea" placeholder="可选备注" />
          </div>

          <div class="flex justify-end gap-2 mt-4">
            <BaseButton variant="secondary" @click="dialogOpen = false">取消</BaseButton>
            <BaseButton variant="primary" @click="submitRequest">提交申请</BaseButton>
          </div>
        </BaseCard>
      </div>

      <div class="col-span-1 space-y-4">
        <BaseCard>
          <template #header>
            <span class="text-sm font-bold text-[--foreground]">申请统计</span>
          </template>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-[--muted-foreground]">待审批</span>
              <span class="font-semibold text-[--warning]">{{ statusCount('pending') }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[--muted-foreground]">已批准</span>
              <span class="font-semibold text-[--success]">{{ statusCount('approved') }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[--muted-foreground]">已驳回</span>
              <span class="font-semibold text-[--danger]">{{ statusCount('rejected') }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[--muted-foreground]">已补充</span>
              <span class="font-semibold text-[--info]">{{ statusCount('supplemented') }}</span>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <template #header>
            <span class="text-sm font-bold text-[--foreground]">提示信息</span>
          </template>
          <div class="space-y-2 text-xs text-[--muted-foreground]">
            <p>仅当资源不在 SD 已调配资源池中时，才需要通过本页面提交申请。</p>
            <p>申请提交后将由 SD 负责人审批，审批通过后资源将纳入调配资源池。</p>
            <p>关键资源（高风险）审批优先级更高，请关注审批进度。</p>
          </div>
        </BaseCard>

        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-[--foreground]">计划上下文</span>
            </div>
          </template>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-[--muted-foreground]">计划编号</span>
              <span class="font-mono text-xs text-[--primary]">{{ planCode }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[--muted-foreground]">项目名称</span>
              <span class="font-medium text-[--text-main] truncate">{{ selectedProject?.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[--muted-foreground]">已调配资源</span>
              <span class="font-medium text-[--text-main]">{{ allocationResources.length }} 项</span>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import StepWizard from '@/components/experiments/StepWizard.vue';
import { projects } from '@/api/mock/projects';
import { getSpecialRequests, getRequestStatusLabel, getRequestStatusTone } from '@/api/mock/specialRequests';
import { DEMO_PLAN_CODE } from '@/api/mock/demoContext';
import type { Project } from '@/api/mock/projects';
import type { SDResourceType, SDResourceSource } from '@/types/experiments';

const router = useRouter();
const route = useRoute();
const planCode = computed(() => String(route.query.planCode || DEMO_PLAN_CODE));
const projectId = computed(() => String(route.query.projectId || ''));

const selectedProject = computed<Project | null>(() => {
  const id = projectId.value;
  return id ? projects.find(p => p.id === id) ?? null : null;
});

// 已调配资源池数量（从 localStorage 读取）
const allocationResources = computed(() => {
  if (typeof window === 'undefined' || !projectId.value) return [];
  try {
    const raw = window.localStorage.getItem(`project-resource-allocation::${projectId.value}`);
    if (raw) {
      const state = JSON.parse(raw) as { resources?: unknown[] };
      return Array.isArray(state.resources) ? state.resources : [];
    }
  } catch { /* ignore */ }
  return [];
});

const requests = ref(getSpecialRequests(planCode.value, projectId.value));
const dialogOpen = ref(false);
const editingReq = ref<string | null>(null);

const form = ref({
  name: '', materialCode: '', type: 'reagent' as SDResourceType, priority: 'medium' as 'high' | 'medium' | 'low',
  specification: '', unit: '', plannedQty: 0, brand: '', expectedArrival: '', reason: '', remark: '',
});

const resourceTypeOptions = [
  { label: '试剂', value: 'reagent' }, { label: '耗材', value: 'consumable' },
  { label: '设备', value: 'equipment' }, { label: '标准品', value: 'standard' },
  { label: '对照品', value: 'control' }, { label: '其他', value: 'other' },
];
const priorityOptions = [
  { label: '高', value: 'high' }, { label: '中', value: 'medium' }, { label: '低', value: 'low' },
];

function resourceTypeLabel(t: SDResourceType): string {
  return { reagent: '试剂', consumable: '耗材', equipment: '设备', standard: '标准品', control: '对照品', other: '其他' }[t] ?? t;
}
function resourceTypeTone(t: SDResourceType): 'success' | 'info' | 'warning' | 'danger' | 'neutral' {
  return { reagent: 'info', consumable: 'neutral', equipment: 'warning', standard: 'success', control: 'success', other: 'neutral' }[t] ?? 'neutral';
}
function priorityLabel(p: string): string { return { high: '高', medium: '中', low: '低' }[p] ?? p; }
function statusCount(s: string): number { return requests.value.filter(r => r.status === s).length; }

function openAddDialog(existing?: { id?: string }) {
  if (existing?.id) {
    const req = requests.value.find(r => r.id === existing.id);
    if (req) {
      editingReq.value = req.id;
      form.value = { ...req.resource, reason: req.reason, remark: req.remark ?? '' };
    }
  } else {
    editingReq.value = null;
    form.value = {
      name: '', materialCode: '', type: 'reagent', priority: 'medium',
      specification: '', unit: '', plannedQty: 0, brand: '', expectedArrival: '', reason: '', remark: '',
    };
  }
  dialogOpen.value = true;
}

function submitRequest() {
  if (!form.value.name || !form.value.reason) {
    alert('请填写资源名称和申请原因');
    return;
  }
  dialogOpen.value = false;
  alert('申请已提交，等待 SD 负责人审批');
}

function backToWorkspace() {
  router.push({
    path: '/experiments/plans/new/forms',
    query: { planCode: planCode.value, projectId: projectId.value || 'PRJ001' },
  });
}

const steps = [
  { label: '选择项目', sub: '' },
  { label: '关联文件', sub: '' },
  { label: '选择考察项', sub: '' },
  { label: '表单编辑', sub: '' },
  { label: '特殊资源申请', sub: '资源不足时的补充申请' },
];
</script>
