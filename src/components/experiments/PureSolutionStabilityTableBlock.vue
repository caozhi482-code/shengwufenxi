<template>
  <div class="w-full overflow-x-auto">
    <table class="w-full min-w-[1100px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col class="w-[18%]" />
        <col class="w-[12%]" />
        <col class="w-[14%]" />
        <col class="w-[14%]" />
        <col class="w-[14%]" />
        <col class="w-[12%]" />
        <col class="w-[16%]" />
      </colgroup>
      <tbody>
        <!-- 标题行 -->
        <tr>
          <td class="stab-title" colspan="7">
            <div class="flex items-center justify-between gap-3">
              <div class="text-[26px] font-bold">纯溶液短期/长期放置稳定性考察记录表</div>
              <div class="text-[16px] font-medium">BA-SBR14 / 2V</div>
            </div>
          </td>
        </tr>

        <!-- 上下文区 -->
        <tr>
          <td class="stab-label" colspan="2">项目编号</td>
          <td class="stab-cell" colspan="5">
            <CellEditor :value="model.context.projectCode" :editable="editable" @update="updateContext('projectCode', $event)" />
          </td>
        </tr>

        <!-- 主表格 -->
        <tr>
          <td class="stab-section" colspan="7">稳定性考察记录</td>
        </tr>
        <tr>
          <td class="stab-head text-center">考察类别</td>
          <td class="stab-head text-center">样品代码</td>
          <td class="stab-head text-center">放置条件/位置</td>
          <td class="stab-head text-center">开始放置<br>人/日期时间</td>
          <td class="stab-head text-center">结束放置<br>人/日期时间</td>
          <td class="stab-head text-center">考察时长<br>（短期h/长期d）</td>
          <td class="stab-head text-center">所用分析批</td>
        </tr>

        <!-- 短期考察行 -->
        <tr>
          <td class="stab-cell bg-[#f0ebe0] font-semibold">{{ model.shortTerm.label }}</td>
          <td class="stab-cell"><CellEditor :value="model.shortTerm.rows[0]?.sampleCode || ''" :editable="editable" @update="updateShortTerm(0, 'sampleCode', $event)" /></td>
          <td class="stab-cell"><CellEditor :value="model.shortTerm.rows[0]?.position || ''" :editable="editable" @update="updateShortTerm(0, 'position', $event)" /></td>
          <td class="stab-cell"><CellEditor :value="model.shortTerm.rows[0]?.startTime || ''" :editable="editable" type="datetime-local" @update="updateShortTerm(0, 'startTime', $event)" /></td>
          <td class="stab-cell"><CellEditor :value="model.shortTerm.rows[0]?.endTime || ''" :editable="editable" type="datetime-local" @update="updateShortTerm(0, 'endTime', $event)" /></td>
          <td class="stab-cell"><CellEditor :value="String(model.shortTerm.rows[0]?.duration || '')" :editable="editable" type="number" @update="updateShortTerm(0, 'duration', Number($event) || 0)" /></td>
          <td class="stab-cell"><CellEditor :value="model.shortTerm.rows[0]?.analysisBatch || ''" :editable="editable" @update="updateShortTerm(0, 'analysisBatch', $event)" /></td>
        </tr>
        <tr v-for="(row, ri) in shortTermRows" :key="`st-${ri}`" class="h-[42px]">
          <td class="stab-cell bg-[#f3efe0]"><CellEditor :value="row.sampleCode" :editable="editable" @update="updateShortTerm(ri + 1, 'sampleCode', $event)" /></td>
          <td class="stab-cell"><CellEditor :value="row.position" :editable="editable" @update="updateShortTerm(ri + 1, 'position', $event)" /></td>
          <td class="stab-cell"><CellEditor :value="row.startTime" :editable="editable" type="datetime-local" @update="updateShortTerm(ri + 1, 'startTime', $event)" /></td>
          <td class="stab-cell"><CellEditor :value="row.endTime" :editable="editable" type="datetime-local" @update="updateShortTerm(ri + 1, 'endTime', $event)" /></td>
          <td class="stab-cell"><CellEditor :value="String(row.duration)" :editable="editable" type="number" @update="updateShortTerm(ri + 1, 'duration', Number($event) || 0)" /></td>
          <td class="stab-cell"><CellEditor :value="row.analysisBatch" :editable="editable" @update="updateShortTerm(ri + 1, 'analysisBatch', $event)" /></td>
        </tr>

        <!-- 长期考察行 -->
        <tr>
          <td class="stab-cell bg-[#f0ebe0] font-semibold">{{ model.longTerm.label }}</td>
          <td class="stab-cell"><CellEditor :value="model.longTerm.rows[0]?.sampleCode || ''" :editable="editable" @update="updateLongTerm(0, 'sampleCode', $event)" /></td>
          <td class="stab-cell"><CellEditor :value="model.longTerm.rows[0]?.position || ''" :editable="editable" @update="updateLongTerm(0, 'position', $event)" /></td>
          <td class="stab-cell"><CellEditor :value="model.longTerm.rows[0]?.startTime || ''" :editable="editable" type="datetime-local" @update="updateLongTerm(0, 'startTime', $event)" /></td>
          <td class="stab-cell"><CellEditor :value="model.longTerm.rows[0]?.endTime || ''" :editable="editable" type="datetime-local" @update="updateLongTerm(0, 'endTime', $event)" /></td>
          <td class="stab-cell"><CellEditor :value="String(model.longTerm.rows[0]?.duration || '')" :editable="editable" type="number" @update="updateLongTerm(0, 'duration', Number($event) || 0)" /></td>
          <td class="stab-cell"><CellEditor :value="model.longTerm.rows[0]?.analysisBatch || ''" :editable="editable" @update="updateLongTerm(0, 'analysisBatch', $event)" /></td>
        </tr>
        <tr v-for="(row, ri) in longTermRows" :key="`lt-${ri}`" class="h-[42px]">
          <td class="stab-cell bg-[#f3efe0]"><CellEditor :value="row.sampleCode" :editable="editable" @update="updateLongTerm(ri + 1, 'sampleCode', $event)" /></td>
          <td class="stab-cell"><CellEditor :value="row.position" :editable="editable" @update="updateLongTerm(ri + 1, 'position', $event)" /></td>
          <td class="stab-cell"><CellEditor :value="row.startTime" :editable="editable" type="datetime-local" @update="updateLongTerm(ri + 1, 'startTime', $event)" /></td>
          <td class="stab-cell"><CellEditor :value="row.endTime" :editable="editable" type="datetime-local" @update="updateLongTerm(ri + 1, 'endTime', $event)" /></td>
          <td class="stab-cell"><CellEditor :value="String(row.duration)" :editable="editable" type="number" @update="updateLongTerm(ri + 1, 'duration', Number($event) || 0)" /></td>
          <td class="stab-cell"><CellEditor :value="row.analysisBatch" :editable="editable" @update="updateLongTerm(ri + 1, 'analysisBatch', $event)" /></td>
        </tr>

        <!-- 空行占位 -->
        <tr v-if="model.longTerm.rows.length < 5"><td class="stab-cell" colspan="7">&nbsp;</td></tr>
      </tbody>
    </table>

    <!-- 新增行按钮 -->
    <div v-if="editable" class="mt-3 flex gap-4">
      <button class="text-[--primary] text-sm font-medium hover:underline" @click="addShortTermRow">+ 短期新增一行</button>
      <button class="text-[--primary] text-sm font-medium hover:underline" @click="addLongTermRow">+ 长期新增一行</button>
    </div>

    <!-- 签字区 -->
    <table class="mt-4 w-full min-w-[1100px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col class="w-[15%]" />
        <col class="w-[85%]" />
      </colgroup>
      <tbody>
        <tr>
          <td class="stab-section" colspan="2">签字区</td>
        </tr>
        <tr>
          <td class="stab-label">分装人 / 日期</td>
          <td class="stab-cell">
            <CellEditor :value="model.signatures.packager" :editable="editable" @update="updateSignature('packager', $event)" />
          </td>
        </tr>
        <tr>
          <td class="stab-label">审核人 / 日期</td>
          <td class="stab-cell">
            <CellEditor :value="model.signatures.auditor" :editable="editable" @update="updateSignature('auditor', $event)" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue';

interface StabilityRow {
  sampleCode: string;
  position: string;
  startTime: string;
  endTime: string;
  duration: number;
  analysisBatch: string;
}

interface ModelValue {
  context: { projectCode?: string };
  shortTerm: { label: string; rows: StabilityRow[] };
  longTerm: { label: string; rows: StabilityRow[] };
  signatures: { packager: string; auditor: string };
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

const model = computed(() => props.modelValue);

const shortTermRows = computed(() => props.modelValue.shortTerm.rows.slice(1));
const longTermRows = computed(() => props.modelValue.longTerm.rows.slice(1));

const CellEditor = defineComponent({
  props: {
    value: { type: [String, Number], default: '' },
    editable: { type: Boolean, default: false },
    type: { type: String, default: 'text' },
  },
  emits: ['update'],
  setup(componentProps, { emit: componentEmit }) {
    return () => componentProps.editable
      ? h('input', {
          value: componentProps.value,
          type: componentProps.type === 'number' ? 'number' : componentProps.type === 'datetime-local' ? 'datetime-local' : 'text',
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

function updateSignature(key: 'packager' | 'auditor', value: string) {
  patch({ signatures: { ...props.modelValue.signatures, [key]: value } });
}

function updateShortTerm(index: number, key: keyof StabilityRow, value: any) {
  const rows = [...props.modelValue.shortTerm.rows];
  rows[index] = { ...rows[index], [key]: value };
  patch({ shortTerm: { ...props.modelValue.shortTerm, rows } });
}

function updateLongTerm(index: number, key: keyof StabilityRow, value: any) {
  const rows = [...props.modelValue.longTerm.rows];
  rows[index] = { ...rows[index], [key]: value };
  patch({ longTerm: { ...props.modelValue.longTerm, rows } });
}

function newStabilityRow(): StabilityRow {
  return { sampleCode: '', position: '', startTime: '', endTime: '', duration: 0, analysisBatch: '' };
}

function addShortTermRow() {
  patch({ shortTerm: { ...props.modelValue.shortTerm, rows: [...props.modelValue.shortTerm.rows, newStabilityRow()] } });
}

function addLongTermRow() {
  patch({ longTerm: { ...props.modelValue.longTerm, rows: [...props.modelValue.longTerm.rows, newStabilityRow()] } });
}
</script>

<style scoped>
.stab-cell,
.stab-label,
.stab-section,
.stab-title,
.stab-head {
  border: 1px solid #222;
  padding: 9px 10px;
  vertical-align: middle;
  background: #fff;
}

.stab-title {
  text-align: center;
  padding: 14px 10px;
}

.stab-section,
.stab-label,
.stab-head {
  font-weight: 600;
  background: #f7f5ee;
}

.stab-section {
  font-size: 16px;
  text-align: left;
}

.stab-head {
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
