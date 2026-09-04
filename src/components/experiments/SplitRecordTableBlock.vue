<template>
  <div class="w-full overflow-x-auto">
    <div v-if="editable" class="mb-3 flex items-center justify-between gap-3">
      <div class="text-xs text-[--muted-foreground]">在表格内直接录入分装记录，支持新增、复制和删除。</div>
      <BaseButton size="sm" variant="primary" @click="addRow">新增记录行</BaseButton>
    </div>

    <table class="w-full min-w-[1420px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col class="w-[16%]" />
        <col class="w-[10%]" />
        <col class="w-[12%]" />
        <col class="w-[14%]" />
        <col class="w-[14%]" />
        <col class="w-[16%]" />
        <col class="w-[10%]" />
        <col class="w-[8%]" />
      </colgroup>
      <tbody>
        <tr>
          <td class="sp-title" colspan="8">
            <div class="flex items-center justify-between gap-3">
              <div class="text-[26px] font-bold">分装记录表</div>
              <div class="text-[16px] font-medium">BA-SBR04 / 1V</div>
            </div>
          </td>
        </tr>
        <tr>
          <td class="sp-label" colspan="2">项目编号</td>
          <td class="sp-cell" colspan="4">
            <CellEditor :value="model.context.projectCode" :editable="editable" @update="updateContext('projectCode', $event)" />
          </td>
          <td class="sp-label" colspan="1">文件编号 / 版本</td>
          <td class="sp-cell" colspan="1">BA-SBR04 / 1V</td>
        </tr>

        <tr>
          <td class="sp-section" colspan="8">分装记录明细</td>
        </tr>
        <tr>
          <td class="sp-label text-center">分装前代码</td>
          <td class="sp-label text-center">分装份数</td>
          <td class="sp-label text-center">分装后每份体积（mL）</td>
          <td class="sp-label text-center">分装后代码</td>
          <td class="sp-label text-center">分装人 / 日期</td>
          <td class="sp-label text-center">分装后储存位置</td>
          <td class="sp-label text-center">开始储存日期及时间</td>
          <td class="sp-label text-center">操作</td>
        </tr>
        <tr v-for="(row, rowIndex) in model.rows" :key="row.id" class="h-[58px]">
          <td class="sp-cell bg-[#f3efe0]">
            <div class="space-y-1"><CellEditor :value="row.sourceCode" :editable="editable" @update="updateRow(rowIndex, 'sourceCode', $event)" /><button v-if="editable && !row.sourceCode" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( rowIndex, 0)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
          <td class="sp-cell">
            <div class="space-y-1"><CellEditor :value="row.splitCount" :editable="editable" type="number" @update="updateRow(rowIndex, 'splitCount', $event)" /><button v-if="editable && !row.splitCount" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( rowIndex, 1)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
          <td class="sp-cell">
            <div class="space-y-1"><CellEditor :value="row.volumePerPortion" :editable="editable" type="number" @update="updateRow(rowIndex, 'volumePerPortion', $event)" /><button v-if="editable && !row.volumePerPortion" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( rowIndex, 2)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
          <td class="sp-cell">
            <div class="space-y-1"><CellEditor :value="row.splitCode" :editable="editable" @update="updateRow(rowIndex, 'splitCode', $event)" /><button v-if="editable && !row.splitCode" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( rowIndex, 3)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
          <td class="sp-cell">
            <div class="space-y-1"><CellEditor :value="row.splitBy" :editable="editable" @update="updateRow(rowIndex, 'splitBy', $event)" /><button v-if="editable && !row.splitBy" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( rowIndex, 4)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
          <td class="sp-cell">
            <div class="space-y-1"><CellEditor :value="row.storageLocation" :editable="editable" @update="updateRow(rowIndex, 'storageLocation', $event)" /><button v-if="editable && !row.storageLocation" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( rowIndex, 5)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
          <td class="sp-cell">
            <div class="space-y-1"><CellEditor :value="row.storageStartedAt" :editable="editable" type="datetime-local" @update="updateRow(rowIndex, 'storageStartedAt', $event)" /><button v-if="editable && !row.storageStartedAt" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( rowIndex, 6)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
          <td class="sp-cell">
            <div v-if="editable" class="flex flex-col items-center gap-1 text-[11px]">
              <button class="text-[--primary] hover:underline" @click="copyRow(rowIndex)">复制</button>
              <button class="text-[--danger] hover:underline" @click="removeRow(rowIndex)">删除</button>
            </div>
            <span v-else class="block text-center text-[--muted-foreground]">—</span>
          </td>
        </tr>
        <tr v-if="model.rows.length === 0">
          <td class="sp-cell text-center text-[--muted-foreground]" colspan="8">暂无分装记录，点击“新增记录行”后填写</td>
        </tr>
      </tbody>
    </table>

    <table class="mt-4 w-full min-w-[1280px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col v-for="n in 12" :key="n" class="w-[8.33%]" />
      </colgroup>
      <tbody>
        <tr>
          <td class="sp-section" colspan="12">说明</td>
        </tr>
        <tr>
          <td class="sp-label" colspan="2">注</td>
          <td class="sp-cell" colspan="10">本表用于记录校正标样等的分装过程。</td>
        </tr>
        <tr>
          <td class="sp-section" colspan="12">签字区</td>
        </tr>
        <tr>
          <td class="sp-label" colspan="2">分装人 / 日期</td>
          <td class="sp-cell" colspan="2"><CellEditor :value="model.signatures.packager" :editable="editable" @update="updateSignature('packager', $event)" /></td>
          <td class="sp-label" colspan="2">复核人 / 日期</td>
          <td class="sp-cell" colspan="2"><CellEditor :value="model.signatures.reviewer" :editable="editable" @update="updateSignature('reviewer', $event)" /></td>
          <td class="sp-label" colspan="2">审核人 / 日期</td>
          <td class="sp-cell" colspan="2"><CellEditor :value="model.signatures.auditor" :editable="editable" @update="updateSignature('auditor', $event)" /></td>
        </tr>
      </tbody>
    </table>
  </div>

  <CellOpEditor v-if="drawerOpen" :open="drawerOpen" :read-only="!props.editable" :cell-row="String(activeCellRow)" :cell-col="activeCellCol" :operations="cellOperations" @close="drawerOpen=false" @save="saveDrawer" />
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue';
import { Settings2 } from 'lucide-vue-next';
import CellOpEditor from './CellOpEditor.vue';
import type { SequenceOperation } from '@/types/experiments';
import BaseButton from '@/components/base/BaseButton.vue';

interface SplitRow {
  id: string;
  sourceCode: string;
  splitCount: string;
  volumePerPortion: string;
  splitCode: string;
  splitBy: string;
  storageLocation: string;
  storageStartedAt: string;
}

interface ModelValue {
  context: {
    projectCode?: string;
  };
  rows: SplitRow[];
  signatures: {
    packager: string;
    reviewer: string;
    auditor: string;
  };
}

const props = withDefaults(defineProps<{
  modelValue: ModelValue;
  editable?: boolean;
}>(), {
  editable: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: ModelValue];
}>();

const drawerOpen = ref(false);
const activeCellRow = ref(0);
const activeCellCol = ref(0);
const cellOperations = ref<SequenceOperation[]>([]);

function handleConfigureCell(rowIndex: number, colIndex: number) {
  activeCellRow.value = rowIndex;
  activeCellCol.value = colIndex;
  cellOperations.value = (props.modelValue as any).cellOperations || [];
  drawerOpen.value = true;
}

function saveDrawer(ops: SequenceOperation[]) {
  cellOperations.value = ops;
  (props.modelValue as any).cellOperations = ops;
  emit('update:modelValue', props.modelValue);
}

const model = computed(() => props.modelValue);

const CellEditor = defineComponent({
  props: {
    value: { type: String, default: '' },
    editable: { type: Boolean, default: false },
    type: { type: String, default: 'text' },
  },
  emits: ['update'],
  setup(componentProps, { emit: componentEmit }) {
    return () => componentProps.editable
      ? h('input', {
          value: componentProps.value,
          type: componentProps.type,
          class: 'cell-input',
          onInput: (event: Event) => componentEmit('update', (event.target as HTMLInputElement).value),
        })
      : h('span', { class: 'block min-h-6 whitespace-pre-wrap' }, componentProps.value || ' ');
  },
});

function patch(next: Partial<ModelValue>) {
  emit('update:modelValue', { ...props.modelValue, ...next });
}

function updateContext(key: keyof ModelValue['context'], value: string) {
  patch({ context: { ...props.modelValue.context, [key]: value } });
}

function updateSignature(key: keyof ModelValue['signatures'], value: string) {
  patch({ signatures: { ...props.modelValue.signatures, [key]: value } });
}

function updateRow(rowIndex: number, key: keyof SplitRow, value: string) {
  patch({ rows: props.modelValue.rows.map((row, index) => index === rowIndex ? { ...row, [key]: value } : { ...row }) });
}

function addRow() {
  patch({ rows: [...props.modelValue.rows, buildRow()] });
}

function copyRow(rowIndex: number) {
  const copiedRows = [...props.modelValue.rows];
  const currentRow = copiedRows[rowIndex];
  if (!currentRow) return;
  copiedRows.splice(rowIndex + 1, 0, { ...currentRow, id: `split-${Date.now()}` });
  patch({ rows: copiedRows });
}

function removeRow(rowIndex: number) {
  patch({ rows: props.modelValue.rows.filter((_, index) => index !== rowIndex) });
}

function buildRow(): SplitRow {
  return {
    id: `split-${Date.now()}`,
    sourceCode: '',
    splitCount: '',
    volumePerPortion: '',
    splitCode: '',
    splitBy: '',
    storageLocation: '',
    storageStartedAt: '',
  };
}
</script>

<style scoped>
.sp-cell,
.sp-label,
.sp-section,
.sp-title {
  border: 1px solid #222;
  padding: 9px 10px;
  vertical-align: middle;
  background: #fff;
}

.sp-title {
  background: #fff;
  text-align: center;
}

.sp-section,
.sp-label {
  font-weight: 600;
  background: #f7f5ee;
}

.sp-section {
  font-size: 16px;
  text-align: left;
}

.cell-input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: var(--text-main);
}
</style>
