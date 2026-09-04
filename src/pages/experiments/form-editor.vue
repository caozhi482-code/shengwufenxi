<template>
  <div class="space-y-5">
    <BasePageHeader :title="pageTitle" :subtitle="templateSubtitle">
      <template #extra>
        <BaseButton variant="secondary" @click="goBack">返回</BaseButton>
        <BaseButton variant="secondary" :disabled="!currentForm" @click="saveDraft">保存草稿</BaseButton>
        <BaseButton variant="primary" :disabled="!currentForm" @click="saveAndExit">保存并完成编辑</BaseButton>
      </template>
    </BasePageHeader>

    <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] p-4 flex items-center gap-6 flex-wrap">
      <div>
        <div class="text-xs text-[--muted-foreground] mb-0.5">表单模板</div>
        <div class="text-sm font-bold text-[--foreground]">{{ currentForm?.templateName ?? '模板不存在' }}</div>
      </div>
      <div class="w-px h-10 bg-[--border]" />
      <div>
        <div class="text-xs text-[--muted-foreground] mb-0.5">模板编号</div>
        <div class="text-sm font-mono text-[--primary]">{{ currentForm?.templateCode ?? '—' }}</div>
      </div>
      <div class="w-px h-10 bg-[--border]" />
      <div>
        <div class="text-xs text-[--muted-foreground] mb-0.5">版本</div>
        <div class="text-sm font-medium text-[--text-main]">{{ currentForm?.version ?? '—' }}</div>
      </div>
      <div class="w-px h-10 bg-[--border]" />
      <div>
        <div class="text-xs text-[--muted-foreground] mb-0.5">模板类型</div>
        <div class="text-sm font-medium text-[--text-main]">{{ templateKindLabel }}</div>
      </div>
      <div class="w-px h-10 bg-[--border]" />
      <div>
        <div class="text-xs text-[--muted-foreground] mb-0.5">状态</div>
        <div class="text-sm font-medium" :class="editing ? 'text-[--warning]' : 'text-[--success]'">
          {{ currentForm ? (editing ? '编辑中' : '已编辑') : '不可编辑' }}
        </div>
      </div>
    </div>

    <BaseCard v-if="!currentForm">
      <template #header>
        <span class="text-base font-bold text-[--foreground]">模板缺失</span>
      </template>
      <div class="py-12 text-center space-y-3">
        <div class="text-sm font-medium text-[--text-main]">未找到与当前模板 ID 匹配的模板</div>
        <div class="text-xs text-[--muted-foreground]">请返回模板选择页重新选择模板表单。</div>
        <BaseButton variant="primary" @click="goBack">返回</BaseButton>
      </div>
    </BaseCard>

    <template v-else>
      <BaseCard v-if="isPlateTemplate">
        <template #header>
          <span class="text-base font-bold text-[--foreground]">
            {{ currentForm.templateName }} — 格子编辑器
            <span class="text-xs font-normal text-[--muted-foreground] ml-2">
              点击格子编辑操作 · 每条操作可自由填写
            </span>
          </span>
        </template>
        <FormGridEditor
          :rows="plateRows"
          :cols="plateCols"
          :cells="currentCells"
          cell-label="well"
          @select-all="selectAll"
          @invert="invertSelect"
          @clear="clearSelect"
          @batch="batchEdit"
          @edit-cell="openCellEditor"
        />
      </BaseCard>

      <BaseCard v-else-if="isWorkSolutionTemplate">
        <template #header>
          <span class="text-base font-bold text-[--foreground]">
            {{ currentForm.templateName }} — 工作溶液配制记录
          </span>
        </template>
        <div class="overflow-x-auto">
          <WorkSolutionTableBlock v-model:model-value="workModel" editable @configure-demo-cell="openWorkSolutionDemoCell" />
        </div>
      </BaseCard>

      <BaseCard v-else>
        <template #header>
          <span class="text-base font-bold text-[--foreground]">
            {{ currentForm.templateName }} — 记录表编辑
            <span class="text-xs font-normal text-[--muted-foreground] ml-2">
              表格化记录区 · 直接编辑每个字段
            </span>
          </span>
        </template>

        <div class="overflow-x-auto rounded-xl border border-[--border] bg-white">
          <table class="min-w-full border-collapse text-sm">
            <thead class="bg-[--surface-muted]">
              <tr>
                <th v-for="field in tableFields" :key="field" class="border-b border-[--border] px-3 py-2 text-left text-xs font-semibold text-[--muted-foreground]">
                  {{ field }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in recordRows" :key="rowIndex" class="border-b border-[--border] last:border-b-0">
                <td v-for="(_, cellIndex) in tableFields" :key="cellIndex" class="border-r border-[--border] last:border-r-0 px-2 py-2 align-top">
                  <input
                    v-model="recordRows[rowIndex][cellIndex]"
                    type="text"
                    class="w-full rounded-md border border-[--border] bg-white px-2 py-2 text-sm text-[--text-main] outline-none transition focus:border-[--primary]"
                    :placeholder="`${currentForm.templateName} 第 ${rowIndex + 1} 行`"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div class="text-xs text-[--muted-foreground]">记录表模板不使用 96 孔格子布局。</div>
          <div class="flex gap-2">
            <BaseButton variant="secondary" size="sm" @click="addRecordRow">新增一行</BaseButton>
            <BaseButton variant="secondary" size="sm" :disabled="recordRows.length <= 1" @click="removeRecordRow">删除最后一行</BaseButton>
          </div>
        </div>
      </BaseCard>
    </template>

    <CellOpEditor
      v-if="currentForm && (isPlateTemplate || isWorkSolutionTemplate)"
      :open="cellEditorOpen"
      :cell-row="editingCell?.row ?? workSolutionDemoCell?.row ?? ''"
      :cell-col="editingCell?.col ?? workSolutionDemoCell?.col ?? 1"
      :operations="currentOps"
      @close="closeCellEditor"
      @save="saveCellOps"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import FormGridEditor from '@/components/experiments/FormGridEditor.vue';
import CellOpEditor from '@/components/experiments/CellOpEditor.vue';
import WorkSolutionTableBlock from '@/components/experiments/WorkSolutionTableBlock.vue';
import { formTemplates, getFormTemplateById } from '@/api/mock/form-templates';
import type { FormTemplateRecord } from '@/types/experiments';

interface FormCell {
  row: string;
  col: number;
  operations: CellOperation[];
  selected: boolean;
}

interface CellOperation {
  id: string;
  action: string;
  substance?: string;
  sampleId?: string;
  volume?: string;
  note?: string;
}

interface SequenceOperation {
  id: string;
  action: string;
  substance: string;
  sampleId: string;
  volume: number;
  unit: string;
  scanned: boolean;
  equipment?: string;
  scanObject?: string;
  required?: boolean;
  note?: string;
  step?: string;
}

const router = useRouter();
const route = useRoute();

const formTemplateId = route.params.formTemplateId as string;
const itemCode = route.query.itemCode as string;

const currentForm = computed<FormTemplateRecord | null>(() => {
  const byId = getFormTemplateById(formTemplateId);
  if (byId) return byId;
  return formTemplates.find(f => f.templateName === formTemplateId || f.templateCode === formTemplateId) ?? null;
});

const isPlateTemplate = computed(() =>
  currentForm.value?.previewMode === 'plate'
);

const isWorkSolutionTemplate = computed(() =>
  currentForm.value?.templateCode === 'BA-SBR03'
);

const plateRows = computed<string[]>(() =>
  currentForm.value?.structure.plate?.rows ?? ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
);

const plateCols = computed<number>(() =>
  currentForm.value?.structure.plate?.cols ?? 12
);

const tableFields = computed<string[]>(() =>
  currentForm.value?.structure.tableColumns ?? currentForm.value?.structure.fields ?? []
);

const templateKindLabel = computed(() => {
  if (!currentForm.value) return '—';
  if (isWorkSolutionTemplate.value) return '工作溶液配制表';
  return isPlateTemplate.value ? '96 孔板 / 格子布局' : '记录表布局';
});

const templateSubtitle = computed(() => {
  if (!currentForm.value) return '模板缺失 — 请返回模板选择页重新选择';
  if (isWorkSolutionTemplate.value) return '工作溶液配制表 — 任务级表单编辑器';
  return isPlateTemplate.value ? '格子编辑器 — 负责人配置操作' : '记录表编辑器 — 负责人配置操作';
});

const pageTitle = computed(() => `编辑表单 - ${currentForm.value?.templateName ?? '模板不存在'}`);

const cells = ref<FormCell[]>([]);
const recordRows = ref<string[][]>([]);
const workModel = ref({
  context: { projectCode: '', methodVersion: '' },
  rows: [
    { solutionCode: '', sourceCode: '', sourceConcentration: '', sourceVolume: '', sourceMerge: '', diluentVolume: '', finalVolume: '', finalConcentration: '' },
    { solutionCode: '', sourceCode: '', sourceConcentration: '', sourceVolume: '', sourceMerge: '', diluentVolume: '', finalVolume: '', finalConcentration: '' },
  ],
  sourceBatch: '', diluentInfo: '', pureReagentInfo: '', pipetteNo: '', containerMaterial: '', containerColor: '',
  lightCondition: '', batchLabel: '', completedAt: '', disposalMethod: '', controlledPaperNo: '', refrigeratorNo: '',
  signatures: { operator: '', reviewer: '', auditor: '' },
});
const workSolutionDemoCell = ref<{ row: string; col: number } | null>(null);
const editing = ref(false);
const editingCell = ref<{ row: string; col: number } | null>(null);
const cellEditorOpen = ref(false);

watch(currentForm, (form) => {
  editing.value = false;
  editingCell.value = null;
  workSolutionDemoCell.value = null;
  cellEditorOpen.value = false;

  if (!form) {
    cells.value = [];
    recordRows.value = [];
    return;
  }

  if (form.previewMode === 'plate') {
    cells.value = buildCells(form.structure.plate?.rows ?? ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], form.structure.plate?.cols ?? 12);
    recordRows.value = [];
    return;
  }

  cells.value = [];
  const fields = form.structure.tableColumns ?? form.structure.fields;
  const initialRows = form.structure.tableRows?.length ? form.structure.tableRows : buildRecordRows(fields, 3);
  recordRows.value = initialRows.map(row => [...row, ...Array(Math.max(0, fields.length - row.length)).fill('')].slice(0, fields.length));
}, { immediate: true });

const currentCells = computed(() => cells.value);
const currentOps = computed<SequenceOperation[]>(() => {
  if (!editingCell.value) return [];
  const operations = cells.value.find(c => c.row === editingCell.value!.row && c.col === editingCell.value!.col)?.operations ?? [];
  return operations.map(operation => cellOperationToSequenceOperation(operation));
});

function buildCells(rows: string[], cols: number, sampleData?: FormCell[]): FormCell[] {
  return rows.flatMap(row =>
    Array.from({ length: cols }, (_, col) => {
      const existing = sampleData?.find(cell => cell.row === row && cell.col === col + 1);
      return { row, col: col + 1, operations: existing?.operations ?? [], selected: false };
    })
  );
}

function buildRecordRows(fields: string[], rowCount: number): string[][] {
  return Array.from({ length: rowCount }, () => fields.map(() => ''));
}

function selectAll() {
  cells.value = cells.value.map(cell => ({ ...cell, selected: true }));
}

function invertSelect() {
  cells.value = cells.value.map(cell => ({ ...cell, selected: !cell.selected }));
}

function clearSelect() {
  cells.value = cells.value.map(cell => ({ ...cell, selected: false }));
}

function batchEdit() {
  const selected = cells.value.filter(cell => cell.selected);
  if (selected.length === 0) {
    alert('请先选择格子');
    return;
  }
  alert(`批量设置 ${selected.length} 个格子（模拟）`);
}

function openCellEditor(row: string, col: number) {
  editingCell.value = { row, col };
  cellEditorOpen.value = true;
}

function closeCellEditor() {
  cellEditorOpen.value = false;
}

function openWorkSolutionDemoCell(row: string, col: number) {
  workSolutionDemoCell.value = { row, col };
  editingCell.value = null;
  cellEditorOpen.value = true;
}

function saveCellOps(ops: SequenceOperation[]) {
  if (!editingCell.value) return;
  const cell = cells.value.find(item => item.row === editingCell.value!.row && item.col === editingCell.value!.col);
  if (cell) {
    cell.operations = ops.map(sequenceOperationToCellOperation);
  }
  editing.value = true;
  cellEditorOpen.value = false;
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

function addRecordRow() {
  if (!currentForm.value) return;
  const width = tableFields.value.length || 1;
  recordRows.value.push(Array.from({ length: width }, () => ''));
  editing.value = true;
}

function removeRecordRow() {
  if (recordRows.value.length <= 1) return;
  recordRows.value.pop();
  editing.value = true;
}

function saveDraft() {
  if (!currentForm.value) return;
  editing.value = true;
  alert('草稿已保存');
  router.push('/experiments/form-templates');
}

function saveAndExit() {
  if (!currentForm.value) return;
  editing.value = true;
  alert('表单已保存');
  router.push('/experiments/form-templates');
}

function goBack() {
  router.push('/experiments/form-templates');
}
</script>
