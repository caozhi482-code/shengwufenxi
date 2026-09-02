<template>
  <div class="w-full overflow-x-auto">
    <table class="w-full min-w-[1360px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col class="w-[10%]" />
        <col class="w-[10%]" />
        <col class="w-[10%]" />
        <col class="w-[10%]" />
        <col class="w-[10%]" />
        <col class="w-[10%]" />
        <col class="w-[10%]" />
        <col class="w-[10%]" />
        <col class="w-[10%]" />
        <col class="w-[10%]" />
      </colgroup>
      <tbody>
        <tr>
          <td class="ms-cell ms-title" colspan="10">
            <div class="text-[26px] font-bold">提取回收率溶液（MS溶液）配制表</div>
          </td>
        </tr>
        <tr>
          <td class="ms-cell ms-context-label" colspan="2">项目编号</td>
          <td class="ms-cell" colspan="4">{{ model.context.projectCode || '继承自计划' }}</td>
          <td class="ms-cell ms-context-label" colspan="2">方法版本号</td>
          <td class="ms-cell" colspan="2">{{ model.context.methodVersion || '继承自计划' }}</td>
        </tr>
        <tr>
          <td class="ms-cell ms-context-label" colspan="2">文件编号</td>
          <td class="ms-cell" colspan="4">BA-SBR08</td>
          <td class="ms-cell ms-context-label" colspan="2">版本</td>
          <td class="ms-cell" colspan="2">2V</td>
        </tr>

        <tr>
          <td class="ms-section" colspan="10">主表格区</td>
        </tr>
        <tr>
          <td class="ms-head" rowspan="2">溶液编号</td>
          <td class="ms-head" colspan="3">源溶液信息</td>
          <td class="ms-head" rowspan="2">复溶液体积(μL)</td>
          <td class="ms-head" rowspan="2">终体积(μL)</td>
          <td class="ms-head" colspan="4">操作</td>
        </tr>
        <tr>
          <td class="ms-subhead">分析物工作溶液代码</td>
          <td class="ms-subhead">分析物工作溶液体积(μL)</td>
          <td class="ms-subhead">内标工作溶液体积(μL)</td>
          <td class="ms-subhead">配置</td>
          <td class="ms-subhead">状态</td>
          <td class="ms-subhead">删除</td>
          <td class="ms-subhead">复制</td>
        </tr>

        <tr v-for="(row, rowIndex) in model.rows" :key="rowIndex" class="h-[56px]">
          <td
            v-for="(cell, cellIndex) in rowCells(row)"
            :key="`${rowIndex}-${cellIndex}`"
            class="ms-cell align-top"
            :class="cellClass(rowIndex, cellIndex)"
            @click="handleCellClick(rowIndex, cellIndex)"
          >
            <div class="space-y-1">
              <div class="font-medium leading-5">{{ cell }}</div>
              <div v-if="editable && cellHasOps(rowIndex, cellIndex)" class="text-[10px] font-medium text-[--success]">已配置</div>
              <button
                v-if="editable"
                type="button"
                class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline"
                @click.stop="emit('configure-cell', rowIndex, cellIndex)"
              >
                <Settings2 class="h-3.5 w-3.5" />
                配置格子
              </button>
            </div>
          </td>
          <td class="ms-cell text-center align-top" :class="cellClass(rowIndex, 6)" @click="handleCellClick(rowIndex, 6)">
            <div class="space-y-1">
              <div class="font-medium leading-5">配置</div>
              <button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="emit('configure-cell', rowIndex, 6)">
                <Settings2 class="h-3.5 w-3.5" />
                配置格子
              </button>
            </div>
          </td>
          <td class="ms-cell text-center align-top" :class="cellClass(rowIndex, 7)" @click="handleCellClick(rowIndex, 7)">
            <div class="space-y-1">
              <div class="font-medium leading-5">{{ cellHasOps(rowIndex, 7) ? '已配置' : '未配置' }}</div>
              <div v-if="editable && cellHasOps(rowIndex, 7)" class="text-[10px] font-medium text-[--success]">配置完成</div>
            </div>
          </td>
          <td class="ms-cell text-center align-top">
            <button v-if="editable && model.rows.length > 1" class="text-[--danger] text-xs hover:underline" @click.stop="deleteRow(rowIndex)">删除</button>
          </td>
          <td class="ms-cell text-center align-top">
            <button v-if="editable" class="text-[--info] text-xs hover:underline" @click.stop="copyRow(rowIndex)">复制</button>
          </td>
        </tr>

        <tr v-if="model.rows.length === 0">
          <td class="ms-cell text-center text-[--muted-foreground]" colspan="10">暂无明细，点击新增行后填写 MS 溶液配制记录</td>
        </tr>
        <tr v-if="editable">
          <td class="ms-cell text-center" colspan="10">
            <button class="text-[--primary] text-xs font-medium hover:underline" @click="addRow">+ 新增 MS 溶液明细行</button>
          </td>
        </tr>

        <tr>
          <td class="ms-section" colspan="10">底部配制追溯区</td>
        </tr>
        <tr>
          <td class="ms-label">分析物工作液批号</td>
          <td class="ms-cell" colspan="2"><CellEditor :value="model.analyteBatch" :editable="editable" @update="updateField('analyteBatch', $event)" /></td>
          <td class="ms-label">内标工作液代码及批号</td>
          <td class="ms-cell" colspan="2"><CellEditor :value="model.isInfo" :editable="editable" @update="updateField('isInfo', $event)" /></td>
          <td class="ms-label">复溶液代码（名称）及批号</td>
          <td class="ms-cell" colspan="3"><CellEditor :value="model.reconstitutionInfo" :editable="editable" @update="updateField('reconstitutionInfo', $event)" /></td>
        </tr>
        <tr>
          <td class="ms-label">若是纯试剂则记录</td>
          <td class="ms-cell" colspan="9"><CellEditor :value="model.pureReagentInfo" :editable="editable" @update="updateField('pureReagentInfo', $event)" /></td>
        </tr>
        <tr>
          <td class="ms-label">移液器编号</td>
          <td class="ms-cell" colspan="2"><CellEditor :value="model.pipetteNo" :editable="editable" @update="updateField('pipetteNo', $event)" /></td>
          <td class="ms-label">容器材质</td>
          <td class="ms-cell" colspan="2"><CellEditor :value="model.containerMaterial" :editable="editable" @update="updateField('containerMaterial', $event)" /></td>
          <td class="ms-label">容器颜色</td>
          <td class="ms-cell" colspan="3"><CellEditor :value="model.containerColor" :editable="editable" @update="updateField('containerColor', $event)" /></td>
        </tr>
        <tr>
          <td class="ms-label">光照条件</td>
          <td class="ms-cell" colspan="2"><CellEditor :value="model.lightCondition" :editable="editable" @update="updateField('lightCondition', $event)" /></td>
          <td class="ms-label">该批溶液批号</td>
          <td class="ms-cell" colspan="2"><CellEditor :value="model.batchLabel" :editable="editable" @update="updateField('batchLabel', $event)" /></td>
          <td class="ms-label">配制完成时间</td>
          <td class="ms-cell" colspan="3"><CellEditor :value="model.completedAt" :editable="editable" @update="updateField('completedAt', $event)" /></td>
        </tr>
        <tr>
          <td class="ms-label">溶液储存位置/条件</td>
          <td class="ms-cell" colspan="9"><CellEditor :value="model.storageCondition" :editable="editable" @update="updateField('storageCondition', $event)" /></td>
        </tr>

        <tr>
          <td class="ms-section" colspan="10">签字区</td>
        </tr>
        <tr>
          <td class="ms-label">操作人 / 日期</td>
          <td class="ms-cell" colspan="2"><CellEditor :value="model.signatures.operator" :editable="editable" @update="updateSignature('operator', $event)" /></td>
          <td class="ms-label">现场复核人 / 日期</td>
          <td class="ms-cell" colspan="2"><CellEditor :value="model.signatures.reviewer" :editable="editable" @update="updateSignature('reviewer', $event)" /></td>
          <td class="ms-label">审核人 / 日期</td>
          <td class="ms-cell" colspan="3"><CellEditor :value="model.signatures.auditor" :editable="editable" @update="updateSignature('auditor', $event)" /></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue';
import { Settings2 } from 'lucide-vue-next';
import type { SequenceOperation } from '@/types/experiments';

interface MSRow {
  solutionCode: string;
  analyteCode: string;
  analyteVolume: number;
  isVolume: number;
  reconstitutionVolume: number;
  finalVolume: number;
}

interface ModelValue {
  context: {
    projectCode?: string;
    methodVersion?: string;
  };
  rows: MSRow[];
  analyteBatch: string;
  isInfo: string;
  reconstitutionInfo: string;
  pureReagentInfo: string;
  pipetteNo: string;
  containerMaterial: string;
  containerColor: string;
  lightCondition: string;
  batchLabel: string;
  completedAt: string;
  storageCondition: string;
  signatures: { operator: string; reviewer: string; auditor: string };
  cellOperations?: Record<string, SequenceOperation[]>;
}

const props = withDefaults(defineProps<{
  modelValue: ModelValue;
  editable?: boolean;
}>(), {
  editable: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: ModelValue];
  'configure-cell': [rowIndex: number, colIndex: number];
}>();

const model = computed(() => props.modelValue);

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

function patch(next: Partial<ModelValue>) {
  emit('update:modelValue', { ...props.modelValue, ...next });
}

function updateField(key: keyof Omit<ModelValue, 'context' | 'rows' | 'signatures' | 'cellOperations'>, value: string) {
  patch({ [key]: value } as Partial<ModelValue>);
}

function updateSignature(key: keyof ModelValue['signatures'], value: string) {
  patch({ signatures: { ...props.modelValue.signatures, [key]: value } });
}

function updateRow(rowIndex: number, key: keyof MSRow, value: string) {
  const numericKeys: (keyof MSRow)[] = ['analyteVolume', 'isVolume', 'reconstitutionVolume', 'finalVolume'];
  const numeric = numericKeys.includes(key);
  patch({
    rows: props.modelValue.rows.map((row, index) => index === rowIndex ? { ...row, [key]: numeric ? Number(value) || 0 : value } : row),
  });
}

function addRow() {
  const newCode = `MS-${String(model.value.rows.length + 1).padStart(2, '0')}`;
  patch({
    rows: [...model.value.rows, {
      solutionCode: newCode,
      analyteCode: '',
      analyteVolume: 0,
      isVolume: 0,
      reconstitutionVolume: 0,
      finalVolume: 0,
    }],
  });
}

function deleteRow(rowIndex: number) {
  if (model.value.rows.length <= 1) return;
  patch({ rows: model.value.rows.filter((_, index) => index !== rowIndex) });
}

function copyRow(rowIndex: number) {
  const row = model.value.rows[rowIndex];
  if (!row) return;
  const newCode = `MS-${String(model.value.rows.length + 1).padStart(2, '0')}`;
  patch({ rows: [...model.value.rows, { ...row, solutionCode: newCode }] });
}

function rowCells(row: MSRow): string[] {
  return [
    row.solutionCode,
    row.analyteCode,
    String(row.analyteVolume || ''),
    String(row.isVolume || ''),
    String(row.reconstitutionVolume || ''),
    String(row.finalVolume || ''),
  ];
}

function cellKey(rowIndex: number, colIndex: number) {
  return `${rowIndex}-${colIndex}`;
}

function cellHasOps(rowIndex: number, colIndex: number) {
  return (props.modelValue.cellOperations?.[cellKey(rowIndex, colIndex)]?.length ?? 0) > 0;
}

function cellClass(rowIndex: number, colIndex: number) {
  if (!props.editable) return 'bg-[#f3efe0]';
  return cellHasOps(rowIndex, colIndex)
    ? 'bg-[--primary-soft] cursor-pointer hover:bg-[--primary-soft]'
    : 'bg-white cursor-pointer hover:bg-[--surface-muted]';
}

function handleCellClick(rowIndex: number, colIndex: number) {
  if (!props.editable) return;
  emit('configure-cell', rowIndex, colIndex);
}
</script>

<style scoped>
.ms-cell,
.ms-label,
.ms-head,
.ms-subhead,
.ms-section,
.ms-title {
  border: 1px solid #222;
  padding: 9px 10px;
  vertical-align: middle;
  background: #fff;
}

.ms-title {
  text-align: center;
  font-size: 26px;
  font-weight: 700;
  padding: 16px 10px;
}

.ms-context-label {
  background: #f0f0f0;
  font-weight: 600;
  text-align: center;
  font-size: 12px;
}

.ms-section,
.ms-head,
.ms-subhead,
.ms-label {
  font-weight: 600;
  background: #f7f5ee;
  text-align: center;
}

.ms-section {
  font-size: 16px;
  text-align: left;
}

.ms-head {
  font-size: 14px;
}

.ms-subhead {
  font-size: 12px;
}

.ms-label {
  font-size: 13px;
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
