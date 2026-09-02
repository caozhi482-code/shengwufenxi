<template>
  <div class="space-y-5 pb-24">
    <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] px-5 py-4">
      <StepWizard :steps="steps" :current="3" />
    </div>

    <BasePageHeader :title="pageTitle" :subtitle="pageSubtitle">
      <template #extra>
        <BaseButton variant="secondary" size="sm" @click="switchMode(mode === 'view' ? 'edit' : 'view')">
          {{ mode === 'view' ? '切换查看模式' : '切换经理模式' }}
        </BaseButton>
        <BaseButton variant="secondary" size="sm" @click="backToItems">返回考察项</BaseButton>
        <BaseButton variant="secondary" size="sm" @click="goToForms">下一步：表单模板</BaseButton>
      </template>
    </BasePageHeader>

    <div class="grid grid-cols-4 gap-5">
      <div class="col-span-3 space-y-4">
        <BaseCard>
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div class="text-sm font-bold text-[--foreground]">继承上下文</div>
                <div class="text-xs text-[--muted-foreground] mt-0.5">当前页按模板 ID 精确渲染；模板缺失时不会回退到加样序列表。</div>
              </div>
              <BaseTag :label="mode === 'view' ? '只读' : '可编辑'" :tone="mode === 'view' ? 'neutral' : 'success'" />
            </div>
          </template>

          <div class="grid grid-cols-3 gap-3 text-sm">
            <div class="rounded-lg border border-[--border] bg-[--surface-muted] p-3">
              <div class="text-xs text-[--muted-foreground]">项目名称</div>
              <div class="font-semibold text-[--text-main] mt-1 truncate">{{ selectedProject?.name ?? '—' }}</div>
            </div>
            <div class="rounded-lg border border-[--border] bg-[--surface-muted] p-3">
              <div class="text-xs text-[--muted-foreground]">项目编号</div>
              <div class="font-mono text-xs font-semibold text-[--primary] mt-1 truncate">{{ selectedProject?.code ?? '—' }}</div>
            </div>
            <div class="rounded-lg border border-[--border] bg-[--surface-muted] p-3">
              <div class="text-xs text-[--muted-foreground]">计划编号</div>
              <div class="font-mono text-xs font-semibold text-[--primary] mt-1 truncate">{{ planCode }}</div>
            </div>
            <div class="rounded-lg border border-[--border] bg-[--surface-muted] p-3">
              <div class="text-xs text-[--muted-foreground]">文件编号</div>
              <div class="font-semibold text-[--text-main] mt-1">{{ selectedFiles.length }} 份</div>
            </div>
            <div class="rounded-lg border border-[--border] bg-[--surface-muted] p-3">
              <div class="text-xs text-[--muted-foreground]">模板类型</div>
              <div class="font-semibold text-[--text-main] mt-1">{{ templateKindLabel }}</div>
            </div>
            <div class="rounded-lg border border-[--border] bg-[--surface-muted] p-3">
              <div class="text-xs text-[--muted-foreground]">方案版本</div>
              <div class="font-semibold text-[--text-main] mt-1 truncate">{{ protocolVersion }}</div>
            </div>
          </div>

          <div class="mt-3 flex flex-wrap gap-2 text-xs">
            <BaseTag v-for="file in selectedFiles" :key="file.id" :label="`${file.code} · ${file.version}`" tone="neutral" />
          </div>
        </BaseCard>

        <BaseCard v-if="!currentTemplate">
          <template #header>
            <span class="text-base font-bold text-[--foreground]">模板缺失</span>
          </template>
          <div class="py-12 text-center space-y-3">
            <div class="text-sm font-medium text-[--text-main]">未找到与当前模板 ID 匹配的模板</div>
            <div class="text-xs text-[--muted-foreground]">请返回模板选择页重新选择模板表单，不要使用默认模板兜底。</div>
            <BaseButton variant="primary" @click="goToForms">返回模板选择页</BaseButton>
          </div>
        </BaseCard>

        <template v-else>
          <BaseCard v-if="isPlateTemplate">
            <template #header>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div class="text-sm font-bold text-[--foreground]">{{ currentTemplate.templateName }} — 96 孔模板</div>
                  <div class="text-xs text-[--muted-foreground] mt-0.5">{{ currentTemplate.templateCode }} · {{ currentTemplate.version }} · {{ mode === 'view' ? '只读' : '经理配置' }}</div>
                </div>
                <BaseTag :label="templateStatusLabel" :tone="templateStatusTone" />
              </div>
            </template>

            <SequenceGrid
              :cells="grid"
              :read-only="mode === 'view'"
              :footer="footer"
              :active-key="activeKey"
              @edit-cell="openCellEditor"
              @select-all="selectAll"
              @invert="invert"
              @clear="clear"
              @batch="batchPanelOpen = !batchPanelOpen"
              @import="fillRecommended"
              @update:footer="footer = $event"
            />
          </BaseCard>

          <BaseCard v-else>
            <template #header>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div class="text-sm font-bold text-[--foreground]">{{ currentTemplate.templateName }} — 记录表模板</div>
                  <div class="text-xs text-[--muted-foreground] mt-0.5">{{ currentTemplate.templateCode }} · {{ currentTemplate.version }} · {{ mode === 'view' ? '只读' : '经理配置' }}</div>
                </div>
                <BaseTag :label="templateStatusLabel" :tone="templateStatusTone" />
              </div>
            </template>

            <div class="overflow-x-auto rounded-xl border border-[--border] bg-white">
              <table class="min-w-full border-collapse text-sm">
                <thead class="bg-[--surface-muted]">
                  <tr>
                    <th v-for="field in currentTemplate.structure.fields" :key="field" class="border-b border-[--border] px-3 py-2 text-left text-xs font-semibold text-[--muted-foreground]">{{ field }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIndex) in recordRows" :key="rowIndex" class="border-b border-[--border] last:border-b-0">
                    <td v-for="(_, cellIndex) in currentTemplate.structure.fields" :key="cellIndex" class="border-r border-[--border] last:border-r-0 px-2 py-2 align-top">
                      <input
                        v-model="recordRows[rowIndex][cellIndex]"
                        :readonly="mode === 'view'"
                        type="text"
                        class="w-full rounded-md border border-[--border] bg-white px-2 py-2 text-sm text-[--text-main] outline-none transition focus:border-[--primary] disabled:bg-[--surface-muted]"
                        :placeholder="`${currentTemplate.templateName} 第 ${rowIndex + 1} 行`"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div class="text-xs text-[--muted-foreground]">记录表模板使用表格化布局，不显示 96 孔格子。</div>
              <div class="flex gap-2">
                <BaseButton variant="secondary" size="sm" :disabled="mode === 'view'" @click="addRecordRow">新增一行</BaseButton>
                <BaseButton variant="secondary" size="sm" :disabled="mode === 'view' || recordRows.length <= 1" @click="removeRecordRow">删除最后一行</BaseButton>
              </div>
            </div>
          </BaseCard>

          <BaseCard v-if="mode === 'edit' && isPlateTemplate">
            <template #header>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div class="text-sm font-bold text-[--foreground]">批量编辑</div>
                  <div class="text-xs text-[--muted-foreground] mt-0.5">对已选格子统一覆盖执行说明。</div>
                </div>
                <BaseButton variant="secondary" size="sm" @click="batchPanelOpen = !batchPanelOpen">
                  {{ batchPanelOpen ? '收起' : '展开' }}
                </BaseButton>
              </div>
            </template>

            <div v-if="batchPanelOpen" class="space-y-4">
              <div class="grid grid-cols-4 gap-3">
                <BaseFormField v-model="batchForm.action" label="执行说明" placeholder="如：加内标工作液" />
                <BaseFormField v-model="batchForm.substance" label="样品 / 溶液" placeholder="如：IS-WS" />
                <BaseFormField v-model="batchForm.sampleId" label="样品编号" placeholder="如：STD8" />
                <BaseFormField v-model="batchForm.equipment" label="设备" placeholder="如：移液器-001" />
                <BaseFormField v-model="batchForm.volume" label="加入量" type="number" placeholder="如：50" />
                <BaseFormField v-model="batchForm.unit" label="单位" placeholder="如：μL" />
                <BaseFormField v-model="batchForm.scanObject" label="扫码对象" type="select" :options="scanObjectOptions" />
                <BaseFormField v-model="batchForm.required" label="是否必填" type="select" :options="requiredOptions" />
                <BaseFormField v-model="batchForm.step" label="关联步骤" placeholder="如：第 1 步" class="col-span-2" />
                <BaseFormField v-model="batchForm.note" label="备注" type="textarea" placeholder="批量备注" class="col-span-2" />
              </div>
              <div class="flex items-center justify-between gap-3">
                <div class="text-xs text-[--muted-foreground]">当前已选 {{ selectedCount }} 个格子。</div>
                <div class="flex gap-2">
                  <BaseButton variant="secondary" size="sm" @click="batchPanelOpen = false">取消</BaseButton>
                  <BaseButton variant="primary" size="sm" :disabled="selectedCount === 0" @click="applyBatch">应用到已选格子</BaseButton>
                </div>
              </div>
            </div>
            <div v-else class="text-sm text-[--muted-foreground]">展开后可对多个格子统一编辑。</div>
          </BaseCard>
        </template>

        <div class="flex justify-between items-center">
          <BaseButton variant="secondary" @click="goToPreviousItem">上一项</BaseButton>
          <div class="ml-auto flex gap-2">
            <BaseButton variant="secondary" @click="saveDraft">保存草稿</BaseButton>
            <BaseButton variant="primary" :disabled="mode === 'view' || !currentTemplate" @click="saveAndPublish">保存并发布</BaseButton>
          </div>
        </div>
      </div>

      <div class="col-span-1 space-y-4">
        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-bold text-[--foreground]">当前模板</span>
              <BaseTag :label="mode === 'view' ? '只读' : '可编辑'" :tone="mode === 'view' ? 'neutral' : 'success'" />
            </div>
          </template>
          <div v-if="currentTemplate" class="space-y-2 text-sm">
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">名称</span>
              <span class="font-medium text-[--text-main]">{{ currentTemplate.templateName }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">编号</span>
              <span class="font-mono text-xs font-semibold text-[--primary]">{{ currentTemplate.templateCode }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">版本</span>
              <span class="font-mono text-xs font-semibold text-[--primary]">{{ currentTemplate.version }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">类型</span>
              <span class="font-medium text-[--text-main]">{{ templateKindLabel }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">状态</span>
              <span class="font-medium text-[--text-main]">{{ templateStatusLabel }}</span>
            </div>
          </div>
          <div v-else class="text-sm text-[--muted-foreground]">未找到当前模板，无法继续编辑。</div>
        </BaseCard>

        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-bold text-[--foreground]">当前格子</span>
              <BaseTag :label="mode === 'view' ? '只读' : '可编辑'" :tone="mode === 'view' ? 'neutral' : 'success'" />
            </div>
          </template>
          <div v-if="isPlateTemplate && activeCell" class="space-y-2 text-sm">
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">位置</span>
              <span class="font-mono text-xs font-semibold text-[--primary]">{{ activeCell.row }}{{ activeCell.col }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">状态</span>
              <span class="font-medium text-[--text-main]">{{ activeCell.operations.length ? '已配置' : '未配置' }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">操作数</span>
              <span class="font-medium text-[--text-main]">{{ activeCell.operations.length }}</span>
            </div>
            <div class="rounded-lg border border-[--border] bg-[--surface-muted] p-3 space-y-2 text-xs">
              <div class="font-semibold text-[--text-main]">摘要</div>
              <div v-if="activeCell.operations.length === 0" class="text-[--danger]">该格子尚未配置执行说明。</div>
              <div v-for="op in activeCell.operations.slice(0, 3)" :key="op.id" class="rounded-md bg-white px-2 py-2 space-y-1">
                <div class="font-semibold text-[--text-main]">{{ op.action || op.substance || '未命名步骤' }}</div>
                <div class="text-[--muted-foreground]">{{ op.substance || '—' }} · {{ op.equipment || '—' }} · {{ op.volume ?? '—' }}{{ op.unit || '' }}</div>
                <div v-if="op.step || op.note" class="text-[--muted-foreground]">{{ op.step || '—' }}{{ op.note ? ` · ${op.note}` : '' }}</div>
              </div>
            </div>
          </div>
          <div v-else-if="!currentTemplate" class="text-sm text-[--muted-foreground]">模板缺失时不可编辑。</div>
          <div v-else class="text-sm text-[--muted-foreground]">记录表模板不使用单格编辑区。</div>
        </BaseCard>

        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-bold text-[--foreground]">模板状态</span>
              <BaseTag :label="templateStatusLabel" :tone="templateStatusTone" />
            </div>
          </template>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">已选格子</span>
              <span class="font-medium text-[--text-main]">{{ selectedCount }} / 96</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">编辑模式</span>
              <span class="font-medium text-[--text-main]">{{ mode === 'view' ? '查看' : '经理配置' }}</span>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <template #header>
            <span class="text-sm font-bold text-[--foreground]">文件追溯</span>
          </template>
          <div class="space-y-3 text-xs">
            <div v-for="group in fileGroups" :key="group.type" class="rounded-lg border border-[--border] bg-[--surface-muted] p-3 space-y-2">
              <div class="flex items-center justify-between gap-2">
                <BaseTag :label="group.label" tone="neutral" />
                <span class="text-[--muted-foreground]">{{ group.files.length }} 份</span>
              </div>
              <div v-for="file in group.files" :key="file.id" class="space-y-1 rounded-md bg-white px-2 py-2">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-mono font-semibold text-[--primary]">{{ file.code }}</span>
                  <BaseTag :label="file.version" tone="success" />
                </div>
                <div class="text-[--text-main] font-medium truncate">{{ file.name }}</div>
                <div class="text-[--muted-foreground]">{{ file.publishDate }}</div>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <CellOpEditor
      v-if="currentTemplate && isPlateTemplate"
      :open="cellEditorOpen"
      :read-only="mode === 'view'"
      :cell-row="editingCell?.row ?? ''"
      :cell-col="editingCell?.col ?? 1"
      :operations="currentOps"
      @close="closeCellEditor"
      @save="saveCellOps"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import StepWizard from '@/components/experiments/StepWizard.vue';
import SequenceGrid from '@/components/experiments/SequenceGrid.vue';
import CellOpEditor from '@/components/experiments/CellOpEditor.vue';
import { evaluationItems } from '@/api/mock/evaluation';
import { files, getFilesByProject, getFileTypeLabel } from '@/api/mock/files';
import { projects } from '@/api/mock/projects';
import { formTemplates } from '@/api/mock/form-templates';
import type { EvaluationItem } from '@/api/mock/evaluation';
import type { FileItem, FileType } from '@/api/mock/files';
import type { SequenceCell, SequenceOperation, FormTemplateRecord, CellOperation } from '@/types/experiments';

const router = useRouter();
const route = useRoute();

type TemplateFooter = { location?: string; time?: string; owner?: string; reviewer?: string };
type TemplateState = { cells: SequenceCell[]; footer: TemplateFooter; version: string; status: 'editing' | 'published' };

const templateStateStore = new Map<string, TemplateState>();

const steps = [
  { label: '选择管理项目', sub: '先选择计划所属项目' },
  { label: '选择关联文件', sub: '按项目选择 SOP / 方法 / 方案' },
  { label: '选择考察项', sub: '基于文件推荐并补选考察项' },
  { label: '选择模板表单', sub: '按模板类型渲染内容' },
  { label: '确认创建', sub: '确认并创建实验计划' },
];

const mode = ref<'edit' | 'view'>(parseMode(route.query.mode));
const batchPanelOpen = ref(false);
const editingCell = ref<{ row: string; col: number } | null>(null);
const cellEditorOpen = ref(false);
const selectedIds = computed(() => parseList(route.query.itemIds));
const projectId = computed(() => parseSingle(route.query.projectId));
const fileIds = computed(() => parseList(route.query.fileIds));
const planCode = computed(() => parseSingle(route.query.planCode) || 'PLAN-DRAFT');

const selectedProject = computed(() => {
  const id = projectId.value;
  return id ? projects.find(p => p.id === id) ?? null : null;
});

const selectedFiles = computed<FileItem[]>(() => {
  const ids = new Set(fileIds.value);
  const base = selectedProject.value ? getFilesByProject(selectedProject.value.id) : files;
  return base.filter(file => ids.has(file.id));
});

const selectedItems = computed(() => evaluationItems.filter(item => selectedIds.value.includes(item.id)));
const currentItem = computed<EvaluationItem | null>(() => {
  const id = parseSingle(route.params.itemId);
  return evaluationItems.find(item => item.id === id) ?? selectedItems.value[0] ?? null;
});
const currentTemplate = computed<FormTemplateRecord | null>(() => {
  const id = parseSingle(route.params.formTemplateId);
  return id ? formTemplates.find(template => template.id === id) ?? null : null;
});
const isPlateTemplate = computed(() => currentTemplate.value?.previewMode === 'plate');
const templateKindLabel = computed(() => {
  if (!currentTemplate.value) return '—';
  return currentTemplate.value.previewMode === 'plate' ? '96 孔板 / 格子布局' : '记录表布局';
});
const pageTitle = computed(() => `编辑表单 - ${currentTemplate.value?.templateName ?? '模板不存在'}`);
const pageSubtitle = computed(() => {
  if (!currentTemplate.value) return '模板缺失 — 请返回模板选择页重新选择';
  return `${selectedProject.value?.name ?? '—'} · ${planCode.value} · ${currentItem.value?.id ?? '—'}`;
});

const grid = ref<SequenceCell[]>([]);
const recordRows = ref<string[][]>([]);
const footer = ref<TemplateFooter>({ location: '', time: '', owner: '', reviewer: '' });
const templateVersion = ref('V1.0.0');
const templateStatus = ref<'editing' | 'published'>('editing');
const batchForm = reactive({
  action: '',
  substance: '',
  sampleId: '',
  equipment: '',
  volume: 0,
  unit: 'μL',
  scanObject: '',
  required: 'true',
  step: '',
  note: '',
});

const scanObjectOptions = [
  { label: '设备', value: 'device' },
  { label: '试剂', value: 'reagent' },
  { label: '样品', value: 'sample' },
  { label: '耗材', value: 'consumable' },
];
const requiredOptions = [
  { label: '必填', value: 'true' },
  { label: '选填', value: 'false' },
];

const activeKey = computed(() => editingCell.value ? `${editingCell.value.row}-${editingCell.value.col}` : null);
const activeCell = computed(() => editingCell.value ? getCell(editingCell.value.row, editingCell.value.col) : null);
const currentOps = computed(() => activeCell.value?.operations ?? []);
const selectedCount = computed(() => grid.value.filter(cell => cell.selected).length);
const methodFile = computed(() => selectedFiles.value.find(file => file.type === 'method') ?? null);
const protocolFile = computed(() => selectedFiles.value.find(file => file.type === 'protocol') ?? null);
const methodVersion = computed(() => methodFile.value?.version ?? '—');
const protocolVersion = computed(() => protocolFile.value?.version ?? '—');
const templateStatusLabel = computed(() => templateStatus.value === 'published' ? '已发布' : '编辑中');
const templateStatusTone = computed<'success' | 'warning'>(() => templateStatus.value === 'published' ? 'success' : 'warning');

const fileGroups = computed(() => {
  const groups: { type: FileType; label: string; files: FileItem[] }[] = [];
  ['protocol', 'method', 'sop'].forEach((type) => {
    const typedFiles = selectedFiles.value.filter(file => file.type === type);
    if (typedFiles.length > 0) groups.push({ type: type as FileType, label: getFileTypeLabel(type as FileType), files: typedFiles });
  });
  return groups;
});

watch(
  [currentTemplate, currentItem],
  () => {
    loadState();
  },
  { immediate: true },
);

watch(
  () => route.query.mode,
  (value) => {
    mode.value = parseMode(value);
  },
  { immediate: true },
);

function parseSingle(value: unknown): string {
  return Array.isArray(value) ? value[0] ?? '' : typeof value === 'string' ? value : '';
}

function parseList(value: unknown): string[] {
  const raw = parseSingle(value);
  return raw ? raw.split(',').map(v => v.trim()).filter(Boolean) : [];
}

function parseMode(value: unknown): 'edit' | 'view' {
  return parseSingle(value) === 'view' ? 'view' : 'edit';
}

function cloneCells(source: SequenceCell[]): SequenceCell[] {
  return JSON.parse(JSON.stringify(source));
}

function cloneFooter(source: TemplateFooter): TemplateFooter {
  return { location: source.location ?? '', time: source.time ?? '', owner: source.owner ?? '', reviewer: source.reviewer ?? '' };
}

function cloneOperations(source: SequenceOperation[]): SequenceOperation[] {
  return source.map(op => ({ ...op }));
}

function getCell(row: string, col: number): SequenceCell {
  return grid.value.find(cell => cell.row === row && cell.col === col) ?? { row, col, operations: [], selected: false };
}

function loadState() {
  if (!currentTemplate.value) {
    grid.value = [];
    recordRows.value = [];
    templateVersion.value = '—';
    templateStatus.value = 'editing';
    editingCell.value = null;
    cellEditorOpen.value = false;
    return;
  }

  const cached = templateStateStore.get(templateKey());
  if (cached) {
    grid.value = cloneCells(cached.cells);
    footer.value = cloneFooter(cached.footer);
    templateVersion.value = cached.version;
    templateStatus.value = cached.status;
  } else {
    if (currentTemplate.value.previewMode === 'plate') {
      grid.value = buildPlateCells(currentTemplate.value);
      footer.value = { location: '', time: '', owner: '', reviewer: '' };
      templateVersion.value = `V1.${Math.max(selectedItems.value.findIndex(item => item.id === currentItem.value?.id), 0) + 1}.0`;
      templateStatus.value = 'editing';
    } else {
      recordRows.value = buildRecordRows(currentTemplate.value);
      templateVersion.value = currentTemplate.value.version;
      templateStatus.value = 'editing';
    }
  }

  if (currentTemplate.value.previewMode === 'plate') {
    editingCell.value = firstConfiguredCell() ?? grid.value[0] ?? null;
  } else {
    editingCell.value = null;
    cellEditorOpen.value = false;
  }
}

function buildPlateCells(template: FormTemplateRecord): SequenceCell[] {
  return template.structure.plate
    ? template.structure.plate.rows.flatMap(row => Array.from({ length: template.structure.plate?.cols ?? 0 }, (_, index) => ({ row, col: index + 1, operations: [], selected: false })))
    : [];
}

function buildRecordRows(template: FormTemplateRecord): string[][] {
  const columns = template.structure.tableColumns?.length || template.structure.fields.length || 1;
  const rows = template.structure.tableRows?.length || 3;
  const data = template.structure.tableRows?.map(row => [...row]) ?? [];
  while (data.length < rows) {
    data.push(Array.from({ length: columns }, () => ''));
  }
  return data.map(row => {
    if (row.length >= columns) return row.slice(0, columns);
    return [...row, ...Array.from({ length: columns - row.length }, () => '')];
  });
}

function firstConfiguredCell() {
  return grid.value.find(cell => cell.operations.length > 0) ?? null;
}

function templateKey() {
  return [planCode.value, currentItem.value?.id ?? '', currentTemplate.value?.id ?? ''].join('::');
}

function persistState(nextStatus: 'editing' | 'published' = templateStatus.value) {
  if (!currentTemplate.value) return;
  templateStateStore.set(templateKey(), {
    cells: cloneCells(grid.value),
    footer: cloneFooter(footer.value),
    version: templateVersion.value,
    status: nextStatus,
  });
  templateStatus.value = nextStatus;
}

function openCellEditor(row: string, col: number) {
  if (!isPlateTemplate.value || mode.value === 'view') return;
  editingCell.value = { row, col };
  cellEditorOpen.value = true;
}

function closeCellEditor() {
  cellEditorOpen.value = false;
}

function selectAll() {
  if (!isPlateTemplate.value || mode.value === 'view') return;
  grid.value = grid.value.map(cell => ({ ...cell, selected: true }));
}

function invert() {
  if (!isPlateTemplate.value || mode.value === 'view') return;
  grid.value = grid.value.map(cell => ({ ...cell, selected: !cell.selected }));
}

function clear() {
  if (!isPlateTemplate.value || mode.value === 'view') return;
  grid.value = grid.value.map(cell => ({ ...cell, selected: false }));
}

function buildOperationFromBatch(): SequenceOperation {
  return {
    id: `batch-${Date.now()}`,
    action: batchForm.action.trim() || batchForm.substance.trim() || '执行步骤',
    substance: batchForm.substance.trim(),
    sampleId: batchForm.sampleId.trim(),
    equipment: batchForm.equipment.trim(),
    volume: Number.isFinite(Number(batchForm.volume)) ? Number(batchForm.volume) : 0,
    unit: batchForm.unit.trim() || 'μL',
    scanObject: batchForm.scanObject.trim(),
    required: batchForm.required === 'true',
    step: batchForm.step.trim(),
    note: batchForm.note.trim(),
    scanned: false,
  };
}

function applyBatch() {
  if (!isPlateTemplate.value || mode.value === 'view') return;
  const selected = grid.value.filter(cell => cell.selected);
  if (selected.length === 0) {
    alert('请先选择格子');
    return;
  }
  const op = buildOperationFromBatch();
  selected.forEach((cell) => {
    cell.operations = cloneOperations([{ ...op, id: `${op.id}-${cell.row}${cell.col}` }]);
  });
  templateStatus.value = 'editing';
  persistState('editing');
}

function fillRecommended() {
  if (!isPlateTemplate.value || mode.value === 'view' || !currentTemplate.value) return;
  grid.value = grid.value.map((cell, index) => {
    if (index % 12 === 0 || index === 1) {
      return {
        ...cell,
        operations: [{
          id: `rec-${cell.row}${cell.col}`,
          action: `${currentTemplate.value?.templateName} 执行说明`,
          substance: currentItem.value?.name ?? '样品/溶液',
          sampleId: currentItem.value?.id ?? 'ITEM',
          volume: 50,
          unit: 'μL',
          scanned: false,
          equipment: '移液器-001',
          scanObject: 'sample',
          required: true,
          step: '第 1 步',
          note: '推荐模板示例',
        }],
        selected: true,
      };
    }
    return cell;
  });
  persistState('editing');
}

function addRecordRow() {
  if (!currentTemplate.value || mode.value === 'view') return;
  recordRows.value.push(Array.from({ length: currentTemplate.value.structure.tableColumns?.length || currentTemplate.value.structure.fields.length || 1 }, () => ''));
  templateStatus.value = 'editing';
}

function removeRecordRow() {
  if (mode.value === 'view' || recordRows.value.length <= 1) return;
  recordRows.value.pop();
  templateStatus.value = 'editing';
}

function saveDraft() {
  if (!currentTemplate.value) return;
  persistState('editing');
  alert('草稿已保存');
  router.push(`/experiments/plans/${planCode.value}/tasks`);
}

function saveAndPublish() {
  if (!currentTemplate.value) return;
  persistState('published');
  alert('表单已保存，返回任务创建页');
  router.push(`/experiments/plans/${planCode.value}/tasks`);
}

function goToPreviousItem() {
  router.push('/experiments/plans/new/forms');
}

function backToItems() {
  router.push('/experiments/plans/new/items');
}

function goToForms() {
  router.push('/experiments/plans/new/forms');
}

function switchMode(next: 'edit' | 'view') {
  mode.value = next;
}

function sequenceOperationToCellOperation(operation: SequenceOperation): CellOperation {
  return {
    id: operation.id,
    action: operation.action,
    substance: operation.substance || undefined,
    sampleId: operation.sampleId || undefined,
    volume: formatVolume(operation.volume, operation.unit),
    note: operation.note || undefined,
  };
}

function cellOperationToSequenceOperation(operation: CellOperation): SequenceOperation {
  return {
    id: operation.id,
    action: operation.action,
    substance: operation.substance ?? '',
    sampleId: operation.sampleId ?? '',
    volume: parseNumericVolume(operation.volume),
    unit: parseVolumeUnit(operation.volume),
    scanned: false,
    note: operation.note ?? '',
  };
}

function saveCellOps(ops: SequenceOperation[]) {
  if (!editingCell.value || !isPlateTemplate.value) return;
  const cell = grid.value.find(item => item.row === editingCell.value!.row && item.col === editingCell.value!.col);
  if (cell) {
    cell.operations = ops;
  }
  templateStatus.value = 'editing';
  persistState('editing');
  cellEditorOpen.value = false;
}

function parseNumericVolume(volume?: string) {
  if (!volume) return 0;
  const parsed = Number.parseFloat(volume);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function parseVolumeUnit(volume?: string) {
  if (!volume) return 'μL';
  const match = volume.trim().match(/\d+(?:\.\d+)?\s*(.*)$/);
  return match?.[1]?.trim() || 'μL';
}

function formatVolume(volume: number, unit?: string) {
  return `${volume}${unit ? ` ${unit}` : ''}`.trim();
}
</script>
