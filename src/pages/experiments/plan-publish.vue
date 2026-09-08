<template>
  <div class="space-y-5 pb-24">
    <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] px-5 py-4">
      <StepWizard :steps="steps" :current="5" />
    </div>

    <BasePageHeader
      title="确认创建"
      :subtitle="`${selectedProject?.name ?? '—'} · ${planCode}`"
    >
      <template #extra>
        <BaseButton variant="secondary" size="sm" @click="backToWorkspace">上一步</BaseButton>
        <BaseButton variant="primary" size="sm" :disabled="!hasAnyForm" @click="goToTaskAssignment">下一步：任务分配</BaseButton>
      </template>
    </BasePageHeader>

    <div v-if="!canContinue" class="grid grid-cols-4 gap-5">
      <div class="col-span-3">
        <BaseCard>
          <template #header>
            <span class="text-base font-bold text-[--foreground]">无法创建实验计划</span>
          </template>
          <div class="py-12 text-center space-y-3">
            <div class="text-sm font-medium text-[--text-main]">{{ emptyReason }}</div>
            <div class="text-xs text-[--muted-foreground]">{{ emptyReasonDetail }}</div>
            <BaseButton variant="primary" @click="backToWorkspace">返回编辑表单</BaseButton>
          </div>
        </BaseCard>
      </div>
      <div class="col-span-1">
        <BaseCard>
          <template #header>
            <span class="text-sm font-bold text-[--foreground]">上下文摘要</span>
          </template>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">计划编号</span>
              <span class="font-mono text-xs font-medium text-[--primary]">{{ planCode }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">当前步骤</span>
              <span class="font-medium text-[--danger]">确认创建</span>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <template v-else>
      <div class="grid grid-cols-6 gap-5">
        <div class="col-span-2 space-y-4">
          <BaseCard>
            <template #header>
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold text-[--foreground]">计划信息</span>
                <BaseTag :label="`${allForms.length} 个实例`" tone="info" />
              </div>
            </template>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between gap-3">
                <span class="text-[--muted-foreground]">项目编号</span>
                <span class="font-mono text-xs font-medium text-[--primary]">{{ selectedProject?.code ?? '—' }}</span>
              </div>
              <div class="flex justify-between gap-3">
                <span class="text-[--muted-foreground]">项目名称</span>
                <span class="font-medium text-[--text-main]">{{ selectedProject?.name ?? '—' }}</span>
              </div>
              <div class="flex justify-between gap-3">
                <span class="text-[--muted-foreground]">关联文件</span>
                <span class="font-medium text-[--text-main]">{{ selectedFiles.length }} 份</span>
              </div>
              <div class="flex justify-between gap-3">
                <span class="text-[--muted-foreground]">考察项</span>
                <span class="font-medium text-[--text-main]">{{ selectedItems.length }} 项</span>
              </div>
              <div class="flex justify-between gap-3">
                <span class="text-[--muted-foreground]">模板实例</span>
                <span class="font-medium text-[--text-main]">{{ allForms.length }} 个</span>
              </div>
              <div v-if="currentBatch" class="flex justify-between gap-3 border-t border-[--border] pt-2 mt-1">
                <span class="text-[--muted-foreground]">分析批</span>
                <span class="font-medium text-[--text-main]">{{ currentBatch.id }} · {{ currentBatch.name }}</span>
              </div>
              <div class="border-t border-[--border] pt-2">
                <div class="text-xs text-[--muted-foreground] mb-2">关联文件清单</div>
                <div class="space-y-1">
                  <div v-for="f in selectedFiles" :key="f.id" class="flex items-center gap-2 text-xs">
                    <BaseTag :label="f.type === 'sop' ? 'SOP' : f.type === 'method' ? '方法' : '方案'" tone="neutral" />
                    <span class="text-[--text-main] truncate">{{ f.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>

          <BaseCard>
            <template #header>
              <span class="text-sm font-bold text-[--foreground]">考察项与模板实例</span>
            </template>
            <div class="space-y-3">
              <div
                v-for="group in itemFormGroups"
                :key="group.item.id"
                class="rounded-lg border border-[--border] overflow-hidden"
              >
                <div
                  class="flex items-center justify-between px-3 py-2 bg-[--surface-muted] cursor-pointer hover:bg-[--surface-muted]/70 transition-colors"
                  @click="group.collapsed = !group.collapsed"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="text-xs text-[--muted-foreground]">{{ group.item.id }}</span>
                    <span class="text-sm font-medium text-[--text-main] truncate">{{ group.item.name }}</span>
                  </div>
                  <span class="text-xs text-[--muted-foreground] shrink-0">{{ group.forms.length }} 个实例</span>
                </div>
                <div v-if="!group.collapsed" class="px-3 py-2 space-y-1.5 border-t border-[--border]">
                  <div
                    v-for="form in group.forms"
                    :key="form.instanceId"
                    class="flex items-center justify-between text-xs"
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <BaseTag :label="form.template.templateCode" tone="neutral" />
                      <span class="text-[--muted-foreground] truncate">{{ form.template.templateName }}</span>
                    </div>
                    <BaseTag :label="formStatusLabel(form.status)" :tone="formStatusTone(form.status)" />
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>

        <div class="col-span-4 space-y-4">
          <BaseCard>
            <template #header>
              <span class="text-sm font-bold text-[--foreground]">发布确认</span>
            </template>
            <div class="py-6 text-center space-y-3">
              <div class="text-3xl">📋</div>
              <div class="text-base font-semibold text-[--text-main]">确认创建实验计划</div>
              <div class="text-sm text-[--muted-foreground] max-w-md mx-auto">
                确认后将根据已编辑的 {{ allForms.length }} 个模板实例生成实验任务，分配给实验员执行。请确认以下信息无误后进入任务分配。
              </div>
              <div class="grid grid-cols-5 gap-3 max-w-lg mx-auto mt-4">
                <div class="bg-[--primary-soft] rounded-lg p-3 text-center">
                  <div class="text-xl font-bold text-[--primary]">{{ selectedItems.length }}</div>
                  <div class="text-[10px] text-[--muted-foreground] mt-0.5">考察项</div>
                </div>
                <div class="bg-[--info-soft] rounded-lg p-3 text-center">
                  <div class="text-xl font-bold text-[--info]">{{ allForms.length }}</div>
                  <div class="text-[10px] text-[--muted-foreground] mt-0.5">模板实例</div>
                </div>
                <div v-if="currentBatch" class="bg-[--warning-soft] rounded-lg p-3 text-center">
                  <div class="text-xl font-bold text-[--warning] font-mono text-xs">{{ currentBatch.id }}</div>
                  <div class="text-[10px] text-[--muted-foreground] mt-0.5">分析批</div>
                </div>
                <div class="bg-[--danger-soft] rounded-lg p-3 text-center">
                  <div class="text-xl font-bold text-[--danger]">{{ unfinishedForms }}</div>
                  <div class="text-[10px] text-[--muted-foreground] mt-0.5">未编辑实例</div>
                </div>
                <div class="bg-[--success-soft] rounded-lg p-3 text-center">
                  <div class="text-xl font-bold text-[--success]">{{ doneForms }}</div>
                  <div class="text-[10px] text-[--muted-foreground] mt-0.5">已完成实例</div>
                </div>
              </div>
              <div v-if="unfinishedForms > 0" class="text-xs text-[--warning] bg-[--warning-soft] rounded-lg px-4 py-2 inline-block mt-2">
                有 {{ unfinishedForms }} 个模板实例尚未编辑，进入任务分配后仍可以继续配置执行内容。
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import StepWizard from '@/components/experiments/StepWizard.vue';
import { evaluationItems } from '@/api/mock/evaluation';
import { files, getFilesByProject } from '@/api/mock/files';
import { projects } from '@/api/mock/projects';
import { formTemplates } from '@/api/mock/form-templates';
import { getBatchesByPlan } from '@/api/mock/batches';
import { DEMO_PLAN_CODE } from '@/api/mock/demoContext';
import type { EvaluationItem } from '@/api/mock/evaluation';
import type { FileItem } from '@/api/mock/files';
import type { FormTemplateRecord } from '@/types/experiments';
import type { AnalysisBatch } from '@/api/mock/batches';

type FormStatus = 'unedited' | 'editing' | 'done';

type WorkspaceForm = {
  itemId: string;
  templateId: string;
  instanceId: string;
  template: FormTemplateRecord;
  status: FormStatus;
};

const router = useRouter();
const route = useRoute();

const steps = [
  { label: '选择项目', sub: '确定计划所属项目' },
  { label: '选择关联文件', sub: '选择方法 / 方案 / SOP' },
  { label: '选择考察项', sub: '确定本次计划范围' },
  { label: '选择模板表单', sub: '为考察项绑定表单模板' },
  { label: '编辑模板内容', sub: '编辑计划下模板实例' },
  { label: '确认创建', sub: '确认并创建实验计划' },
  { label: '任务分配', sub: '为每个任务分配执行资源' },
];

const parseSingle = (value: unknown): string =>
  Array.isArray(value) ? value[0] ?? '' : typeof value === 'string' ? value : '';

const parseList = (value: unknown): string[] => {
  const raw = parseSingle(value);
  return raw ? raw.split(',').map(v => v.trim()).filter(Boolean) : [];
};

const parseTemplatePairs = (value: unknown): Array<{ itemId: string; templateId: string }> =>
  parseList(value).map(pair => {
    const [itemId, templateId] = pair.split(':');
    return { itemId: itemId?.trim() ?? '', templateId: templateId?.trim() ?? '' };
  }).filter(p => p.itemId && p.templateId);

const planCode = computed(() => parseSingle(route.query.planCode) || DEMO_PLAN_CODE);
const projectId = computed(() => parseSingle(route.query.projectId));
const fileIds = computed(() => parseList(route.query.fileIds));
const itemIds = computed(() => parseList(route.query.itemIds));
const batchId = computed(() => parseSingle(route.query.batchId));
const templateIds = computed(() => parseTemplatePairs(route.query.templateIds));
const activeItemId = computed(() => parseSingle(route.query.activeItemId));
const instanceId = computed(() => parseSingle(route.query.instanceId));
const currentTemplateId = computed(() => parseSingle(route.query.currentTemplateId));

const selectedProject = computed(() => {
  const id = projectId.value;
  return id ? projects.find(p => p.id === id) ?? null : null;
});

const selectedFiles = computed<FileItem[]>(() => {
  const ids = new Set(fileIds.value);
  const base = selectedProject.value ? getFilesByProject(selectedProject.value.id) : files;
  return base.filter(f => ids.has(f.id));
});

const selectedItems = computed<EvaluationItem[]>(() =>
  evaluationItems.filter(item => itemIds.value.includes(item.id))
);

const currentBatch = computed<AnalysisBatch | null>(() => {
  if (!batchId.value) return null;
  return getBatchesByPlan(planCode.value).find(b => b.id === batchId.value) ?? null;
});

const allForms = computed<WorkspaceForm[]>(() => {
  const result: WorkspaceForm[] = [];
  for (const pair of templateIds.value) {
    const template = formTemplates.find(t => t.id === pair.templateId);
    if (!template) continue;
    const instanceId = `${planCode.value}-${pair.itemId.replace(/\./g, '')}-${template.id}-INS`;
    result.push({ itemId: pair.itemId, templateId: pair.templateId, instanceId, template, status: 'unedited' });
  }
  return result;
});

const unfinishedForms = computed(() => allForms.value.length);
const doneForms = computed(() => 0);

const itemFormGroups = computed(() =>
  selectedItems.value.map(item => ({
    item,
    forms: allForms.value.filter(f => f.itemId === item.id),
    collapsed: false,
  }))
);

const hasAnyForm = computed(() => allForms.value.length > 0);

const canContinue = computed(() =>
  !!selectedProject.value &&
  selectedFiles.value.length > 0 &&
  selectedItems.value.length > 0
);

const emptyReason = computed(() => {
  if (!selectedProject.value) return '未选择项目';
  if (selectedFiles.value.length === 0) return '未选择关联文件';
  if (selectedItems.value.length === 0) return '未选择考察项';
  return '无模板表单选择';
});

const emptyReasonDetail = computed(() => '请返回上一步完成前置配置后再进行确认创建。');

function formStatusLabel(status: FormStatus): string {
  return { unedited: '未编辑', editing: '编辑中', done: '已完成' }[status] ?? status;
}

function formStatusTone(status: FormStatus): 'success' | 'warning' | 'danger' | 'neutral' {
  const map: Record<FormStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
    unedited: 'danger',
    editing: 'warning',
    done: 'success',
  };
  return map[status] ?? 'neutral';
}

function backToWorkspace() {
  const itemId = activeItemId.value || itemIds.value[0] || '';
  router.push({
    path: itemId
      ? `/experiments/plans/${encodeURIComponent(planCode.value)}/items/${encodeURIComponent(itemId)}/forms`
      : '/experiments/plans/new/forms',
    query: {
      planCode: planCode.value,
      projectId: projectId.value || 'PRJ001',
      fileIds: fileIds.value.join(','),
      itemIds: itemIds.value.join(','),
      batchId: batchId.value,
      ...(activeItemId.value ? { activeItemId: activeItemId.value } : {}),
      ...(instanceId.value ? { instanceId: instanceId.value } : {}),
      ...(currentTemplateId.value ? { currentTemplateId: currentTemplateId.value } : {}),
      ...(templateIds.value.length > 0 ? { templateIds: templateIds.value.map(p => `${p.itemId}:${p.templateId}`).join(',') } : {}),
    },
  });
}

function goToTaskAssignment() {
  router.push({
    path: '/experiments/plans/new/task-assignment',
    query: {
      planCode: planCode.value,
      projectId: projectId.value || 'PRJ001',
      fileIds: fileIds.value.join(','),
      itemIds: itemIds.value.join(','),
      batchId: batchId.value,
      ...(activeItemId.value ? { activeItemId: activeItemId.value } : {}),
      ...(instanceId.value ? { instanceId: instanceId.value } : {}),
      ...(currentTemplateId.value ? { currentTemplateId: currentTemplateId.value } : {}),
      ...(templateIds.value.length > 0 ? { templateIds: templateIds.value.map(p => `${p.itemId}:${p.templateId}`).join(',') } : {}),
    },
  });
}
</script>
