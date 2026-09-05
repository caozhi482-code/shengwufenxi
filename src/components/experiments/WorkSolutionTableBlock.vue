<template>
  <div class="w-full overflow-x-auto" @click="handleRootClick">
    <table class="w-full min-w-[1500px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col class="w-[12%]" />
        <col class="w-[10%]" />
        <col class="w-[9%]" />
        <col class="w-[9%]" />
        <col class="w-[10%]" />
        <col class="w-[12%]" />
        <col class="w-[10%]" />
        <col class="w-[12%]" />
        <col class="w-[8%]" />
        <col class="w-[8%]" />
      </colgroup>
      <tbody>
        <tr>
          <td class="ws-cell ws-title" colspan="10">
            <div class="flex items-center justify-between gap-3">
              <div class="text-[26px] font-bold">工作溶液配制表</div>
              <div class="text-[16px] font-medium">{{ titleTags.join(' / ') }}</div>
            </div>
          </td>
        </tr>
        <tr>
          <td class="ws-cell ws-context-label" colspan="2">上下文</td>
          <td class="ws-cell" colspan="4">
            <div class="flex flex-wrap gap-4 text-[13px]">
              <span>项目编号：{{ model.context.projectCode || '继承自计划' }}</span>
              <span>方法版本号：{{ model.context.methodVersion || '继承自计划' }}</span>
            </div>
          </td>
          <td class="ws-cell ws-context-label" colspan="2">文件编号 / 版本</td>
          <td class="ws-cell" colspan="2">BA-SBR03 / 2V</td>
        </tr>

        <tr>
          <td class="ws-section" colspan="10">主表格区</td>
        </tr>
        <tr>
          <td class="ws-head">工作溶液代码</td>
          <td class="ws-head" colspan="4">源溶液信息</td>
          <td class="ws-head">移取稀释液体积(μL)</td>
          <td class="ws-head">终体积(μL)</td>
          <td class="ws-head">工作溶液最终浓度(ng/mL)</td>
          <td class="ws-head">操作</td>
          <td class="ws-head">状态</td>
        </tr>
        <tr>
          <td class="ws-subhead">工作溶液代码</td>
          <td class="ws-subhead">代码</td>
          <td class="ws-subhead">浓度(ng/mL)</td>
          <td class="ws-subhead">移取源溶液体积(μL)</td>
          <td class="ws-subhead">合并</td>
          <td class="ws-subhead">稀释液体积(μL)</td>
          <td class="ws-subhead">终体积(μL)</td>
          <td class="ws-subhead">最终浓度(ng/mL)</td>
          <td class="ws-subhead">行号</td>
          <td class="ws-subhead">记录</td>
        </tr>
        <tr v-for="(row, rowIndex) in model.rows" :key="rowIndex" class="h-[56px]">
          <td
            v-for="(cell, cellIndex) in rowCells(row)"
            :key="`${rowIndex}-${cellIndex}`"
            class="ws-cell align-top"
            :data-cell-key="cellKey(rowIndex, cellIndex)"
            :class="props.executionMode ? cellClass(rowIndex, cellIndex) : ''"
            @click="handleCellClick(rowIndex, cellIndex)"
            @mouseenter="props.executionMode && showCellHover(rowIndex, cellIndex)"
            @mouseleave="props.executionMode && clearCellHover()"
          >
            <div class="space-y-1 relative">
              <CellEditor :value="cell" :editable="editable" @update="updateRow(rowIndex, rowKeys[cellIndex], $event)" />
              <div v-if="props.executionMode && isCellHovered(rowIndex, cellIndex) && getCellPlanText(rowIndex, cellIndex)" class="absolute left-0 top-full z-10 mt-2 w-[260px] rounded-md bg-[--foreground] px-3 py-2 text-[11px] text-white shadow-xl pointer-events-none">
                {{ getCellPlanText(rowIndex, cellIndex) }}
              </div>
            </div>
          </td>
          <td class="ws-cell text-center align-top" :data-cell-key="cellKey(rowIndex, 9)" :class="props.executionMode ? cellClass(rowIndex, 9) : ''" @click="handleCellClick(rowIndex, 9)" @mouseenter="props.executionMode && showCellHover(rowIndex, 9)" @mouseleave="props.executionMode && clearCellHover()">
            <div class="space-y-1 relative">
              <div class="font-medium leading-5">{{ props.executionMode ? '点击查看' : '配置' }}</div>
              <div v-if="props.executionMode && isCellHovered(rowIndex, 9) && getCellPlanText(rowIndex, 9)" class="absolute left-0 top-full z-10 mt-2 w-[260px] rounded-md bg-[--foreground] px-3 py-2 text-[11px] text-white shadow-xl pointer-events-none">
                {{ getCellPlanText(rowIndex, 9) }}
              </div>
            </div>
          </td>
          <td class="ws-cell text-center align-top">
            <div class="space-y-1">
              <div class="font-medium leading-5">{{ cellHasOps(rowIndex, 9) ? '已配置' : '未配置' }}</div>
              <div v-if="editable && cellHasOps(rowIndex, 9)" class="text-[10px] font-medium text-[--success]">配置完成</div>
            </div>
          </td>
          <td class="ws-cell text-center align-top">
            <button v-if="editable && !props.executionMode && model.rows.length > 1" class="text-[--danger] text-xs hover:underline" @click.stop="deleteRow(rowIndex)">删除</button>
          </td>
          <td class="ws-cell text-center align-top">
            <button v-if="editable && !props.executionMode" class="text-[--info] text-xs hover:underline" @click.stop="copyRow(rowIndex)">复制</button>
          </td>
        </tr>
        <tr v-if="model.rows.length === 0">
          <td class="ws-cell text-center text-[--muted-foreground]" colspan="10">暂无明细，点击新增行后填写工作溶液配制记录</td>
        </tr>

        <tr>
          <td class="ws-section" colspan="10">底部配制信息区</td>
        </tr>
        <tr>
          <td class="ws-label">源溶液批号</td>
          <td class="ws-cell" colspan="3"><CellEditor :value="model.sourceBatch" :editable="editable" @update="updateField('sourceBatch', $event)" /></td>
          <td class="ws-label">稀释液代码（名称）及批号</td>
          <td class="ws-cell" colspan="5"><CellEditor :value="model.diluentInfo" :editable="editable" @update="updateField('diluentInfo', $event)" /></td>
        </tr>
        <tr>
          <td class="ws-label">若是纯试剂则记录</td>
          <td class="ws-cell" colspan="9"><CellEditor :value="model.pureReagentInfo" :editable="editable" @update="updateField('pureReagentInfo', $event)" /></td>
        </tr>
        <tr>
          <td class="ws-label">移液器编号</td>
          <td class="ws-cell" colspan="2"><CellEditor :value="model.pipetteNo" :editable="editable" @update="updateField('pipetteNo', $event)" /></td>
          <td class="ws-label">容器材质</td>
          <td class="ws-cell" colspan="2"><CellEditor :value="model.containerMaterial" :editable="editable" @update="updateField('containerMaterial', $event)" /></td>
          <td class="ws-label">容器颜色</td>
          <td class="ws-cell" colspan="3"><CellEditor :value="model.containerColor" :editable="editable" @update="updateField('containerColor', $event)" /></td>
        </tr>
        <tr>
          <td class="ws-label">光照条件</td>
          <td class="ws-cell" colspan="3"><CellEditor :value="model.lightCondition" :editable="editable" @update="updateField('lightCondition', $event)" /></td>
          <td class="ws-label">该批溶液批号</td>
          <td class="ws-cell" colspan="2"><CellEditor :value="model.batchLabel" :editable="editable" @update="updateField('batchLabel', $event)" /></td>
          <td class="ws-label">配制完成时间</td>
          <td class="ws-cell" colspan="2"><CellEditor :value="model.completedAt" :editable="editable" @update="updateField('completedAt', $event)" /></td>
        </tr>
        <tr>
          <td class="ws-label">样品处置方式</td>
          <td class="ws-cell" colspan="9">
            <div class="flex flex-wrap items-center gap-4">
              <label v-for="option in disposalOptions" :key="option" class="inline-flex items-center gap-1 text-[13px]">
                <input
                  type="radio"
                  :value="option"
                  :checked="model.disposalMethod === option"
                  :disabled="!editable"
                  @change="updateField('disposalMethod', option)"
                />
                {{ option }}
              </label>
              <span v-if="model.disposalMethod === '进行分装后储存'" class="inline-flex items-center gap-2">
                <span>受控纸张号</span>
                <CellEditor :value="model.controlledPaperNo" :editable="editable" @update="updateField('controlledPaperNo', $event)" />
              </span>
              <span v-if="model.disposalMethod === '直接储存于冰箱'" class="inline-flex items-center gap-2">
                <span>冰箱编号</span>
                <CellEditor :value="model.refrigeratorNo" :editable="editable" @update="updateField('refrigeratorNo', $event)" />
              </span>
            </div>
          </td>
        </tr>

        <tr>
          <td class="ws-section" colspan="10">签字区</td>
        </tr>
        <tr>
          <td class="ws-label">操作人 / 日期</td>
          <td class="ws-cell" colspan="2"><CellEditor :value="model.signatures.operator" :editable="editable" @update="updateSignature('operator', $event)" /></td>
          <td class="ws-label">现场复核人 / 日期</td>
          <td class="ws-cell" colspan="2"><CellEditor :value="model.signatures.reviewer" :editable="editable" @update="updateSignature('reviewer', $event)" /></td>
          <td class="ws-label">审核人 / 日期</td>
          <td class="ws-cell" colspan="3"><CellEditor :value="model.signatures.auditor" :editable="editable" @update="updateSignature('auditor', $event)" /></td>
        </tr>
      </tbody>
    </table>
    <CellOpEditor
      v-if="drawerOpen && !props.executionMode"
      :open="drawerOpen"
      :read-only="!props.editable"
      :cell-row="String(activeCellRow)"
      :cell-col="activeCellCol"
      :operations="cellOperations"
      @close="drawerOpen = false"
      @save="saveDrawer"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue';
import CellOpEditor from './CellOpEditor.vue';
import type { SequenceOperation } from '@/types/experiments';

interface WorkRow {
  solutionCode: string;
  sourceCode: string;
  sourceConcentration: string;
  sourceVolume: string;
  sourceMerge: string;
  diluentVolume: string;
  finalVolume: string;
  finalConcentration: string;
}

interface ModelValue {
  context: {
    projectCode?: string;
    methodVersion?: string;
  };
  rows: WorkRow[];
  sourceBatch: string;
  diluentInfo: string;
  pureReagentInfo: string;
  pipetteNo: string;
  containerMaterial: string;
  containerColor: string;
  lightCondition: string;
  batchLabel: string;
  completedAt: string;
  disposalMethod: string;
  controlledPaperNo: string;
  refrigeratorNo: string;
  signatures: { operator: string; reviewer: string; auditor: string };
}

const props = withDefaults(defineProps<{
  modelValue: ModelValue;
  editable?: boolean;
  titleTags?: string[];
  demoCellConfigured?: boolean;
  executionMode?: boolean;
  activeCellKey?: string | null;
}>(), {
  editable: false,
  titleTags: () => [],
  demoCellConfigured: false,
  executionMode: false,
  activeCellKey: null,
});

const emit = defineEmits<{
  'update:modelValue': [value: ModelValue];
  'select-cell': [rowIndex: number, colIndex: number];
}>();

const model = computed(() => props.modelValue);
const disposalOptions = ['DAU', '进行分装后储存', '直接储存于冰箱'];
const drawerOpen = ref(false);
const activeCellRow = ref(0);
const activeCellCol = ref(0);
const cellOperations = ref<SequenceOperation[]>([]);
const hoveredCellKey = ref<string | null>(null);

function handleConfigureCell(rowIndex: number, colIndex: number) {
  if (props.executionMode) return;
  const key = `${rowIndex}-${colIndex}`;
  cellOperations.value = (props.modelValue as any).cellOperations?.[key] ?? [];
  activeCellRow.value = rowIndex;
  activeCellCol.value = colIndex;
  drawerOpen.value = true;
}

function handleCellClick(rowIndex: number, colIndex: number) {
  if (props.executionMode) {
    emit('select-cell', rowIndex, colIndex);
    return;
  }
  if (!props.editable) return;
  handleConfigureCell(rowIndex, colIndex);
}

function handleRootClick(event: MouseEvent) {
  if (!props.executionMode) return;
  const target = event.target as HTMLElement | null;
  const cell = target?.closest?.('[data-cell-key]') as HTMLElement | null;
  if (!cell) return;
  const key = cell.dataset.cellKey;
  if (!key) return;
  const [rowIndexStr, colIndexStr] = key.split('-');
  const rowIndex = Number(rowIndexStr);
  const colIndex = Number(colIndexStr);
  if (Number.isNaN(rowIndex) || Number.isNaN(colIndex)) return;
  emit('select-cell', rowIndex, colIndex);
}

function cellKey(rowIndex: number, colIndex: number) {
  return `${rowIndex}-${colIndex}`;
}

function isCellHovered(rowIndex: number, colIndex: number) {
  return hoveredCellKey.value === cellKey(rowIndex, colIndex);
}

function showCellHover(rowIndex: number, colIndex: number) {
  hoveredCellKey.value = cellKey(rowIndex, colIndex);
}

function clearCellHover() {
  hoveredCellKey.value = null;
}

function getCellPlanText(rowIndex: number, colIndex: number) {
  const ops = (props.modelValue as any).cellOperations?.[cellKey(rowIndex, colIndex)] ?? [];
  if (!ops.length) return '';
  return ops.map((op: SequenceOperation) => [op.action || op.substance, op.sampleId, op.volume !== undefined ? `${op.volume}${op.unit}` : '', op.equipment].filter(Boolean).join(' · ')).join('；');
}

function saveDrawer(ops: SequenceOperation[]) {
  const cellOps = (props.modelValue as any).cellOperations ?? {};
  const key = `${activeCellRow.value}-${activeCellCol.value}`;
  patch({ ...(props.modelValue as any), cellOperations: { ...cellOps, [key]: ops } });
}

const CellEditor = defineComponent({
  props: {
    value: { type: String, default: '' },
    editable: { type: Boolean, default: false },
  },
  emits: ['update'],
  setup(componentProps, { emit: componentEmit }) {
    return () => componentProps.editable
      ? h('input', {
          value: componentProps.value,
          class: 'cell-input',
          onInput: (event: Event) => componentEmit('update', (event.target as HTMLInputElement).value),
        })
      : h('span', { class: 'block min-h-6 whitespace-pre-wrap' }, componentProps.value || ' ');
  },
});

function patch(next: Partial<ModelValue> & Record<string, any>) {
  emit('update:modelValue', { ...props.modelValue, ...next });
}

function updateField(key: keyof Omit<ModelValue, 'context' | 'rows' | 'signatures'>, value: string) {
  patch({ [key]: value } as Partial<ModelValue>);
}

function updateSignature(key: keyof ModelValue['signatures'], value: string) {
  patch({ signatures: { ...props.modelValue.signatures, [key]: value } });
}

function updateRow(rowIndex: number, key: keyof WorkRow, value: string) {
  patch({ rows: props.modelValue.rows.map((row, index) => index === rowIndex ? { ...row, [key]: value } : { ...row }) });
}

const rowKeys: (keyof WorkRow)[] = ['solutionCode', 'sourceCode', 'sourceConcentration', 'sourceVolume', 'sourceMerge', 'diluentVolume', 'finalVolume', 'finalConcentration'];

function rowCells(row: WorkRow) {
  return rowKeys.map((key) => row[key]);
}

function cellHasOps(rowIndex: number, colIndex: number) {
  return (props.modelValue as any).cellOperations?.[`${rowIndex}-${colIndex}`]?.length > 0;
}

function cellClass(rowIndex: number, colIndex: number) {
  if (props.executionMode) {
    return props.activeCellKey === cellKey(rowIndex, colIndex)
      ? 'cursor-pointer bg-[--primary-soft] ring-2 ring-[--primary-border]'
      : 'cursor-pointer bg-white hover:bg-[--surface-muted]';
  }
  return '';
}

function deleteRow(rowIndex: number) {
  if (model.value.rows.length <= 1) return;
  patch({ rows: model.value.rows.filter((_, index) => index !== rowIndex) });
}

function copyRow(rowIndex: number) {
  const row = model.value.rows[rowIndex];
  if (!row) return;
  patch({ rows: [...model.value.rows, { ...row }] });
}
</script>

<style scoped>
.ws-cell,
.ws-label,
.ws-head,
.ws-subhead,
.ws-section,
.ws-title {
  border: 1px solid #222;
  padding: 9px 10px;
  vertical-align: middle;
  background: #fff;
}

.ws-title {
  background: #fff;
  text-align: center;
}

.ws-section,
.ws-head,
.ws-subhead,
.ws-label {
  font-weight: 600;
  background: #f7f5ee;
  text-align: center;
}

.ws-section {
  font-size: 16px;
  text-align: left;
}

.ws-head {
  font-size: 14px;
}

.ws-subhead {
  font-size: 12px;
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
