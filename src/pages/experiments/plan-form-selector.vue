<template>
  <div class="space-y-5 pb-24">
    <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] px-5 py-4">
      <StepWizard :steps="steps" :current="3" />
    </div>

    <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] p-4 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="text-sm font-bold text-[--foreground]">为已选考察项选择模板表单</div>
          <div class="text-xs text-[--muted-foreground] mt-1">模板来自表单模板中心；每个考察项至少选择一个模板，可同时选择多个模板并生成计划下的模板实例。</div>
        </div>
        <div class="flex flex-wrap gap-2">
          <BaseButton variant="secondary" size="sm" @click="goTemplateCenter">打开模板中心</BaseButton>
          <BaseButton variant="secondary" size="sm" @click="backToItems">上一步</BaseButton>
          <BaseButton variant="secondary" size="sm" @click="useRecommendedForAll">全部使用推荐模板</BaseButton>
          <BaseButton variant="secondary" size="sm" @click="clearCurrentSelection">清空当前考察项</BaseButton>
          <BaseButton variant="primary" size="sm" :disabled="!canContinue" @click="openTemplateEditor">下一步：编辑模版表单内容</BaseButton>
          <BaseButton variant="secondary" size="sm" @click="selectAllTemplates">全选当前考察项</BaseButton>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-3 text-sm">
        <div class="rounded-lg border border-[--border] bg-[--surface-muted] p-3">
          <div class="text-xs text-[--muted-foreground]">项目编号</div>
          <div class="font-mono text-xs font-semibold text-[--primary] mt-1 truncate">{{ selectedProject?.code ?? '—' }}</div>
        </div>
        <div class="rounded-lg border border-[--border] bg-[--surface-muted] p-3">
          <div class="text-xs text-[--muted-foreground]">关联文件</div>
          <div class="font-semibold text-[--text-main] mt-1">{{ selectedFiles.length }} 份</div>
        </div>
        <div class="rounded-lg border border-[--border] bg-[--surface-muted] p-3">
          <div class="text-xs text-[--muted-foreground]">已选考察项</div>
          <div class="font-semibold text-[--text-main] mt-1">{{ selectedItems.length }} 项</div>
        </div>
        <div class="rounded-lg border border-[--border] bg-[--surface-muted] p-3">
          <div class="text-xs text-[--muted-foreground]">模板实例</div>
          <div class="font-semibold text-[--text-main] mt-1">{{ selectedTemplateCount }} 个</div>
        </div>
      </div>
    </div>

    <div v-if="!selectedProject || selectedFiles.length === 0 || selectedItems.length === 0" class="grid grid-cols-4 gap-5">
      <div class="col-span-3">
        <BaseCard>
          <template #header>
            <span class="text-base font-bold text-[--foreground]">无法继续</span>
          </template>
          <div class="py-12 text-center space-y-3">
            <div class="text-sm font-medium text-[--text-main]">请先完成项目、关联文件和考察项选择</div>
            <div class="text-xs text-[--muted-foreground]">模板表单选择依赖上一步传入的计划上下文。</div>
            <BaseButton variant="primary" @click="backToItems">返回考察项选择</BaseButton>
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
              <span class="font-medium text-[--danger]">模板表单选择</span>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <div v-else class="grid grid-cols-4 gap-5">
      <div class="col-span-1 space-y-4">
        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-bold text-[--foreground]">已选考察项</span>
              <span class="text-xs text-[--muted-foreground]">{{ completedItemCount }} / {{ selectedItems.length }} 已完成</span>
            </div>
          </template>

          <div class="space-y-2">
            <button
              v-for="item in selectedItems"
              :key="item.id"
              type="button"
              class="w-full rounded-lg border p-3 text-left transition-all"
              :class="currentItem?.id === item.id ? 'border-[--primary] bg-[--primary-soft]' : itemSelectionCount(item.id) > 0 ? 'border-[--border] bg-white hover:border-[--primary-border]' : 'border-[--danger-border] bg-[--danger-soft]'"
              @click="currentItemId = item.id"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <div class="truncate text-sm font-semibold text-[--text-main]">{{ item.name }}</div>
                  <div class="mt-1 font-mono text-[10px] text-[--primary]">{{ item.id }}</div>
                </div>
                <BaseTag :label="itemSelectionCount(item.id) > 0 ? '已选' : '未完成'" :tone="itemSelectionCount(item.id) > 0 ? 'success' : 'danger'" />
              </div>
              <div class="mt-2 text-xs text-[--muted-foreground]">已生成 {{ itemSelectionCount(item.id) }} 个模板实例</div>
            </button>
          </div>
        </BaseCard>

        <BaseCard>
          <template #header>
            <span class="text-sm font-bold text-[--foreground]">下一步校验</span>
          </template>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">未选模板考察项</span>
              <span class="font-semibold" :class="missingItemCount > 0 ? 'text-[--danger]' : 'text-[--primary]'">{{ missingItemCount }}</span>
            </div>
            <div class="text-xs text-[--muted-foreground]">所有考察项都至少选择一个模板表单后，才能进入模板实例内容编辑。</div>
          </div>
        </BaseCard>
      </div>

      <div class="col-span-3 space-y-4">
        <BaseCard>
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div class="text-base font-bold text-[--foreground]">{{ currentItem?.name ?? '当前考察项' }} 可选模板表单</div>
                <div class="text-xs text-[--muted-foreground] mt-0.5">右侧模板均来自表单模板中心，可预览、选择、取消选择或进入模板实例编辑。</div>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <BaseFormField v-model="keyword" label="搜索模板" placeholder="模板名称 / 编号 / 场景" class="min-w-[260px]" />
                <BaseButton variant="secondary" size="sm" @click="useRecommendedForCurrent">使用推荐模板</BaseButton>
                <BaseButton variant="secondary" size="sm" @click="selectAllTemplates">全选模板</BaseButton>
              </div>
            </div>
          </template>

          <div class="mb-4 rounded-lg border border-[--border] bg-[--surface-muted] p-3 text-xs text-[--muted-foreground]">
            当前考察项：<span class="font-semibold text-[--text-main]">{{ currentItem?.id }} · {{ currentItem?.name }}</span>
            <span class="mx-2">|</span>
            系统推荐：<span class="font-semibold text-[--primary]">{{ recommendedTemplatesForCurrent.map(t => t.templateName).join(' / ') || '无' }}</span>
          </div>

          <div v-if="filteredTemplates.length === 0" class="py-14 text-center text-[--muted-foreground] text-sm">
            没有匹配的模板表单
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="template in filteredTemplates"
              :key="template.id"
              class="rounded-xl border p-4 transition-all"
              :class="isSelected(template.id) ? 'border-[--primary] bg-[--primary-soft]' : 'border-[--border] bg-white hover:border-[--primary-border]'"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <label class="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    class="mt-1 h-4 w-4 accent-[--primary]"
                    :checked="isSelected(template.id)"
                    @change="toggleTemplate(template.id)"
                  />
                  <div class="min-w-0 space-y-2">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="font-semibold text-[--text-main]">{{ template.templateName }}</span>
                      <BaseTag :label="template.templateCode" tone="neutral" />
                      <BaseTag :label="template.version" tone="info" />
                      <BaseTag v-if="isRecommended(template)" label="默认推荐" tone="success" />
                      <BaseTag :label="statusLabel(template.status)" :tone="statusTone(template.status)" />
                    </div>
                    <div class="text-xs text-[--muted-foreground]">适用场景：{{ template.description }}</div>
                    <div class="flex flex-wrap gap-1.5">
                      <BaseTag v-for="name in template.itemNames" :key="name" :label="name" tone="neutral" />
                    </div>
                  </div>
                </label>

                <div class="flex shrink-0 flex-wrap gap-2 text-xs">
                  <button type="button" class="text-[--primary] hover:underline" @click="openPreview(template)">预览</button>
                  <button type="button" class="text-[--info] hover:underline" @click="editTemplateInstance(template)">编辑</button>
                  <button
                    type="button"
                    class="hover:underline"
                    :class="isSelected(template.id) ? 'text-[--danger]' : 'text-[--primary]'"
                    @click="toggleTemplate(template.id)"
                  >
                    {{ isSelected(template.id) ? '取消选择' : '选择' }}
                  </button>
                </div>
              </div>

              <div v-if="isSelected(template.id)" class="mt-3 rounded-lg border border-[--primary-border] bg-white p-3 text-xs">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <span class="font-semibold text-[--text-main]">已生成计划模板实例</span>
                  <span class="font-mono text-[--primary]">{{ instanceCode(currentItem?.id ?? '', template.id) }}</span>
                </div>
                <div class="mt-1 text-[--muted-foreground]">负责人下一步编辑的是该实例内容，不会直接改动表单模板中心原模板。</div>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <template #header>
            <span class="text-sm font-bold text-[--foreground]">已选模板实例汇总</span>
          </template>
          <div v-if="selectedTemplateCount === 0" class="py-6 text-center text-sm text-[--muted-foreground]">尚未选择模板表单</div>
          <div v-else class="grid grid-cols-2 gap-3 text-xs">
            <div v-for="instance in templateInstances" :key="instance.code" class="rounded-lg border border-[--border] bg-[--surface-muted] p-3">
              <div class="font-semibold text-[--text-main]">{{ instance.itemName }} · {{ instance.templateName }}</div>
              <div class="mt-1 font-mono text-[--primary]">{{ instance.code }}</div>
              <div class="mt-1 text-[--muted-foreground]">{{ instance.templateCode }} / {{ instance.version }}</div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <BaseDrawer v-if="previewTemplate" :open="!!previewTemplate" title="模板样式预览" @close="previewTemplate = null">
      <div class="space-y-4">
        <div class="rounded-lg border border-[--border] bg-[--surface-muted] p-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm font-bold text-[--text-main]">{{ previewTemplate.templateName }}</span>
            <BaseTag :label="previewTemplate.templateCode" tone="neutral" />
            <BaseTag :label="previewTemplate.version" tone="info" />
          </div>
          <div class="mt-2 text-xs text-[--muted-foreground]">{{ previewTemplate.structure.summary }}</div>
        </div>

        <div class="space-y-2">
          <div class="text-xs font-semibold text-[--muted-foreground]">模板区块</div>
          <div class="flex flex-wrap gap-2">
            <BaseTag v-for="section in previewTemplate.structure.sections" :key="section" :label="section" tone="neutral" />
          </div>
        </div>

        <div v-if="previewTemplate.structure.plate" class="rounded-xl border border-[--border] bg-white p-4 overflow-x-auto">
          <div class="min-w-[560px] space-y-1">
            <div class="flex gap-1">
              <div class="w-8" />
              <div v-for="col in previewTemplate.structure.plate.cols" :key="col" class="flex-1 text-center text-[10px] font-semibold text-[--muted-foreground]">{{ col }}</div>
            </div>
            <div v-for="row in previewTemplate.structure.plate.rows" :key="row" class="flex gap-1">
              <div class="w-8 text-center text-[10px] font-semibold text-[--muted-foreground]">{{ row }}</div>
              <div v-for="col in previewTemplate.structure.plate.cols" :key="col" class="h-8 flex-1 rounded border text-center text-[10px] leading-8" :class="previewTemplate.structure.highlights.includes(`${row}${col}`) ? 'border-[--primary] bg-[--primary-soft] text-[--primary]' : 'border-[--border] bg-[--surface-muted] text-[--muted-foreground]'">
                {{ row }}{{ col }}
              </div>
            </div>
          </div>
        </div>

        <div v-else class="rounded-xl border border-[--border] bg-white p-4">
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div v-for="field in previewTemplate.structure.fields" :key="field" class="rounded border border-[--border] bg-[--surface-muted] px-3 py-2">
              {{ field }}
            </div>
          </div>
          <div v-if="previewTemplate.structure.tableColumns" class="mt-4 overflow-x-auto">
            <table class="w-full min-w-[560px] border-collapse text-xs">
              <thead>
                <tr>
                  <th v-for="col in previewTemplate.structure.tableColumns" :key="col" class="border border-[--border] bg-[--surface-muted] px-2 py-2 text-left">{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rowIndex) in previewTemplate.structure.tableRows ?? []" :key="rowIndex">
                  <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="border border-[--border] px-2 py-2">{{ cell }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="previewTemplate = null">关闭</BaseButton>
        <BaseButton v-if="previewTemplate" variant="primary" @click="selectFromPreview(previewTemplate)">选择此模板</BaseButton>
      </template>
    </BaseDrawer>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import BaseDrawer from '@/components/base/BaseDrawer.vue';
import StepWizard from '@/components/experiments/StepWizard.vue';
import { evaluationItems } from '@/api/mock/evaluation';
import { files, getFilesByProject } from '@/api/mock/files';
import { projects } from '@/api/mock/projects';
import { formTemplates } from '@/api/mock/form-templates';
import type { EvaluationItem } from '@/api/mock/evaluation';
import type { FileItem } from '@/api/mock/files';
import type { Project } from '@/api/mock/projects';
import type { FormTemplateRecord, FormTemplateStatus } from '@/types/experiments';

const router = useRouter();
const route = useRoute();

const steps = [
  { label: '选择项目', sub: '确定计划所属项目' },
  { label: '选择关联文件', sub: '选择方法 / 方案 / SOP' },
  { label: '选择考察项', sub: '确定本次计划范围' },
  { label: '选择模板表单', sub: '每个考察项选择模板' },
  { label: '编辑模板内容', sub: '编辑计划下模板实例' },
  { label: '确认创建', sub: '确认并创建实验计划' },
];

const keyword = ref('');
const currentItemId = ref('');
const previewTemplate = ref<FormTemplateRecord | null>(null);
const selectedTemplateIds = reactive<Record<string, string[]>>({});

const projectId = computed(() => parseSingle(route.query.projectId));
const fileIds = computed(() => parseList(route.query.fileIds));
const itemIds = computed(() => parseList(route.query.itemIds));
const planCode = computed(() => parseSingle(route.query.planCode) || (selectedProject.value ? `PLAN-${selectedProject.value.code}-DRAFT` : 'PLAN-DRAFT'));

const selectedProject = computed<Project | null>(() => {
  const id = projectId.value;
  return id ? projects.find(p => p.id === id) ?? null : null;
});

const selectedFiles = computed<FileItem[]>(() => {
  const ids = new Set(fileIds.value);
  const base = selectedProject.value ? getFilesByProject(selectedProject.value.id) : files;
  return base.filter(file => ids.has(file.id));
});

const selectedItems = computed<EvaluationItem[]>(() => evaluationItems.filter(item => itemIds.value.includes(item.id)));
const currentItem = computed<EvaluationItem | null>(() => selectedItems.value.find(item => item.id === currentItemId.value) ?? selectedItems.value[0] ?? null);

const initialTemplateIds = computed(() => parseTemplatePairs(route.query.templateIds));
const initialTemplateMap = computed(() => {
  const map: Record<string, string[]> = {};
  initialTemplateIds.value.forEach(({ itemId, templateId }) => {
    if (!map[itemId]) map[itemId] = [];
    if (!map[itemId].includes(templateId)) map[itemId].push(templateId);
  });
  return map;
});
const currentSelections = computed(() => currentItem.value ? selectedTemplateIds[currentItem.value.id] ?? [] : []);
const selectedTemplateCount = computed(() => selectedItems.value.reduce((total, item) => total + itemSelectionCount(item.id), 0));
const missingItemCount = computed(() => selectedItems.value.filter(item => itemSelectionCount(item.id) === 0).length);
const completedItemCount = computed(() => selectedItems.value.length - missingItemCount.value);
const canContinue = computed(() => !!selectedProject.value && selectedFiles.value.length > 0 && selectedItems.value.length > 0 && missingItemCount.value === 0);

const recommendedTemplatesForCurrent = computed(() => currentItem.value ? recommendedTemplates(currentItem.value) : []);

const filteredTemplates = computed(() => {
  const item = currentItem.value;
  if (!item) return [];
  const q = keyword.value.trim().toLowerCase();
  return availableTemplatesForItem(item).filter((template) => {
    if (!q) return true;
    return [template.templateName, template.templateCode, template.version, template.description, template.itemNames.join(' / ')]
      .some(text => text.toLowerCase().includes(q));
  });
});

const templateInstances = computed(() => selectedItems.value.flatMap((item) => {
  const ids = selectedTemplateIds[item.id] ?? [];
  return ids.map((templateId) => {
    const template = formTemplates.find(t => t.id === templateId);
    return {
      itemId: item.id,
      itemName: item.name,
      templateId,
      templateName: template?.templateName ?? templateId,
      templateCode: template?.templateCode ?? templateId,
      version: template?.version ?? '—',
      code: instanceCode(item.id, templateId),
    };
  });
}));

watch(selectedItems, (items) => {
  if (!currentItemId.value && items.length > 0) currentItemId.value = items[0].id;
  items.forEach((item) => {
    if (!selectedTemplateIds[item.id]) selectedTemplateIds[item.id] = initialTemplateMap.value[item.id] ? [...initialTemplateMap.value[item.id]] : [];
  });
}, { immediate: true });

function parseSingle(value: unknown): string {
  return Array.isArray(value) ? value[0] ?? '' : typeof value === 'string' ? value : '';
}

function parseList(value: unknown): string[] {
  const raw = parseSingle(value);
  return raw ? raw.split(',').map(v => v.trim()).filter(Boolean) : [];
}

function parseTemplatePairs(value: unknown): Array<{ itemId: string; templateId: string }> {
  return parseList(value).map((pair) => {
    const [itemId, templateId] = pair.split(':');
    return { itemId: itemId?.trim() ?? '', templateId: templateId?.trim() ?? '' };
  }).filter(pair => pair.itemId && pair.templateId);
}

function itemSelectionCount(itemId: string): number {
  return selectedTemplateIds[itemId]?.length ?? 0;
}

function availableTemplatesForItem(item: EvaluationItem): FormTemplateRecord[] {
  const byName = formTemplates.filter(template => template.itemNames.includes(item.name));
  const byLegacyName = formTemplates.filter(template => item.formTemplates.includes(template.templateName) || item.formTemplate === template.templateName);
  const byDefault = formTemplates.filter(template => template.isDefault || template.status === 'enabled');
  return uniqueTemplates([...byName, ...byLegacyName, ...byDefault]).filter(template => template.status !== 'disabled');
}

function recommendedTemplates(item: EvaluationItem): FormTemplateRecord[] {
  const exact = formTemplates.filter(template => template.itemNames.includes(item.name) || item.formTemplates.includes(template.templateName) || item.formTemplate === template.templateName);
  const defaults = formTemplates.filter(template => template.isDefault);
  return uniqueTemplates([...exact, ...defaults]).filter(template => template.status === 'enabled').slice(0, 2);
}

function uniqueTemplates(list: FormTemplateRecord[]): FormTemplateRecord[] {
  const seen = new Set<string>();
  return list.filter((template) => {
    if (seen.has(template.id)) return false;
    seen.add(template.id);
    return true;
  });
}

function isSelected(templateId: string): boolean {
  return currentSelections.value.includes(templateId);
}

function isRecommended(template: FormTemplateRecord): boolean {
  return recommendedTemplatesForCurrent.value.some(item => item.id === template.id);
}

function toggleTemplate(templateId: string) {
  const item = currentItem.value;
  if (!item) return;
  const selections = selectedTemplateIds[item.id] ?? [];
  selectedTemplateIds[item.id] = selections.includes(templateId)
    ? selections.filter(id => id !== templateId)
    : [...selections, templateId];
}

function useRecommendedForCurrent() {
  const item = currentItem.value;
  if (!item) return;
  selectedTemplateIds[item.id] = recommendedTemplates(item).map(template => template.id);
}

function useRecommendedForAll() {
  selectedItems.value.forEach((item) => {
    selectedTemplateIds[item.id] = recommendedTemplates(item).map(template => template.id);
  });
}

function clearCurrentSelection() {
  const item = currentItem.value;
  if (!item) return;
  selectedTemplateIds[item.id] = [];
}

function selectAllTemplates() {
  const item = currentItem.value;
  if (!item) return;
  selectedTemplateIds[item.id] = filteredTemplates.value.map(t => t.id);
}

function openPreview(template: FormTemplateRecord) {
  previewTemplate.value = template;
}

function selectFromPreview(template: FormTemplateRecord) {
  if (!isSelected(template.id)) toggleTemplate(template.id);
  previewTemplate.value = null;
}

function editTemplateInstance(template: FormTemplateRecord) {
  if (!isSelected(template.id)) toggleTemplate(template.id);
  goToTemplateEditor(template.id);
}

function instanceCode(itemId: string, templateId: string): string {
  return `${planCode.value}-${itemId.replace('.', '')}-${templateId}-INS`;
}

function statusLabel(status: FormTemplateStatus): string {
  const map: Record<FormTemplateStatus, string> = { enabled: '启用', disabled: '停用', draft: '草稿' };
  return map[status];
}

function statusTone(status: FormTemplateStatus): 'success' | 'danger' | 'warning' | 'neutral' {
  const map: Record<FormTemplateStatus, 'success' | 'danger' | 'warning' | 'neutral'> = { enabled: 'success', disabled: 'danger', draft: 'warning' };
  return map[status] ?? 'neutral';
}

function selectedTemplateIdsQuery(): string {
  return templateInstances.value.map(instance => `${instance.itemId}:${instance.templateId}`).join(',');
}

function backToItems() {
  router.push({
    path: '/experiments/plans/new/items',
    query: {
      projectId: selectedProject.value?.id ?? '',
      fileIds: fileIds.value.join(','),
      itemIds: itemIds.value.join(','),
      planCode: planCode.value,
      ...(selectedTemplateCount.value > 0 ? { templateIds: selectedTemplateIdsQuery() } : {}),
      ...(currentItem.value?.id ? { activeItemId: currentItem.value.id } : {}),
    },
  });
}

function goToTemplateEditor(preferredTemplateId?: string) {
  if (!canContinue.value && !preferredTemplateId) return;
  const item = currentItem.value ?? selectedItems.value[0];
  if (!item) return;
  const templateId = preferredTemplateId ?? selectedTemplateIds[item.id]?.[0] ?? '';
  router.push({
    path: `/experiments/plans/${encodeURIComponent(planCode.value)}/items/${encodeURIComponent(item.id)}/forms`,
    query: {
      planCode: planCode.value,
      projectId: selectedProject.value?.id ?? '',
      fileIds: fileIds.value.join(','),
      itemIds: itemIds.value.join(','),
      templateIds: selectedTemplateIdsQuery(),
      currentTemplateId: templateId,
      activeItemId: item.id,
      instanceId: templateId ? instanceCode(item.id, templateId) : '',
      mode: 'edit',
    },
  });
}

function openTemplateEditor() {
  goToTemplateEditor();
}

function goTemplateCenter() {
  router.push({
    path: '/experiments/form-templates',
    query: {
      from: 'plan-flow',
      projectId: selectedProject.value?.id ?? '',
      fileIds: fileIds.value.join(','),
      itemIds: itemIds.value.join(','),
      planCode: planCode.value,
    },
  });
}
</script>
