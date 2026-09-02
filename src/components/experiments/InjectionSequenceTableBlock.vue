<template>
  <div class="w-full overflow-x-auto">
    <table class="w-full min-w-[1280px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col class="w-[10%]" />
        <col class="w-[30%]" />
        <col class="w-[18%]" />
        <col class="w-[18%]" />
        <col class="w-[24%]" />
      </colgroup>
      <tbody>
        <tr>
          <td class="seq-title" colspan="5">
            <div class="flex items-center justify-between gap-3">
              <div class="text-[26px] font-bold">进样序列表</div>
              <div class="text-[16px] font-medium">BA-SBR09 / 2V</div>
            </div>
          </td>
        </tr>
        <tr>
          <td class="seq-label">项目编号</td>
          <td class="seq-cell" colspan="2"><CellEditor :value="model.context.projectCode" :editable="editable" @update="updateContext('projectCode', $event)" /></td>
          <td class="seq-label">方法版本号</td>
          <td class="seq-cell"><CellEditor :value="model.context.methodVersion" :editable="editable" @update="updateContext('methodVersion', $event)" /></td>
        </tr>
        <tr>
          <td class="seq-label">分析批编号</td>
          <td class="seq-cell" colspan="2"><CellEditor :value="model.context.analysisBatchNo" :editable="editable" @update="updateContext('analysisBatchNo', $event)" /></td>
          <td class="seq-label">Run ID</td>
          <td class="seq-cell"><CellEditor :value="model.context.runId" :editable="editable" @update="updateContext('runId', $event)" /></td>
        </tr>
        <tr>
          <td class="seq-label">操作人 / 日期</td>
          <td class="seq-cell" colspan="2"><CellEditor :value="model.context.operatorInfo" :editable="editable" @update="updateContext('operatorInfo', $event)" /></td>
          <td class="seq-label">现场审核人 / 日期</td>
          <td class="seq-cell"><CellEditor :value="model.context.reviewerInfo" :editable="editable" @update="updateContext('reviewerInfo', $event)" /></td>
        </tr>
        <tr>
          <td class="seq-section" colspan="5">进样序列表</td>
        </tr>
        <tr>
          <td class="seq-head text-center">序号</td>
          <td class="seq-head text-center">样品编号</td>
          <td class="seq-head text-center">稀释倍数</td>
          <td class="seq-head text-center">孔位号</td>
          <td class="seq-head text-center">备注</td>
        </tr>
        <tr v-for="(row, rowIndex) in model.rows" :key="rowIndex" class="h-[58px]">
          <td class="seq-cell bg-[#f3efe0]"><CellEditor :value="row.seq" :editable="editable" @update="updateRow(rowIndex, 'seq', $event)" /></td>
          <td class="seq-cell"><CellEditor :value="row.sampleId" :editable="editable" @update="updateRow(rowIndex, 'sampleId', $event)" /></td>
          <td class="seq-cell"><CellEditor :value="row.dilutionFactor" :editable="editable" @update="updateRow(rowIndex, 'dilutionFactor', $event)" /></td>
          <td class="seq-cell"><CellEditor :value="row.wellPosition" :editable="editable" @update="updateRow(rowIndex, 'wellPosition', $event)" /></td>
          <td class="seq-cell"><CellEditor :value="row.remark" :editable="editable" @update="updateRow(rowIndex, 'remark', $event)" /></td>
        </tr>
        <tr v-if="model.rows.length === 0">
          <td class="seq-cell text-center text-[--muted-foreground]" colspan="5">暂无序列数据</td>
        </tr>
      </tbody>
    </table>

    <table class="mt-4 w-full min-w-[1280px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col v-for="n in 6" :key="n" class="w-[16.66%]" />
      </colgroup>
      <tbody>
        <tr>
          <td class="seq-section" colspan="6">签字区</td>
        </tr>
        <tr>
          <td class="seq-label">操作人 / 日期</td>
          <td class="seq-cell"><CellEditor :value="model.context.operatorInfo" :editable="editable" @update="updateContext('operatorInfo', $event)" /></td>
          <td class="seq-label">现场审核人 / 日期</td>
          <td class="seq-cell"><CellEditor :value="model.context.reviewerInfo" :editable="editable" @update="updateContext('reviewerInfo', $event)" /></td>
          <td class="seq-label">审核人 / 日期</td>
          <td class="seq-cell"><CellEditor :value="model.context.auditorInfo" :editable="editable" @update="updateContext('auditorInfo', $event)" /></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue';

interface SequenceRow {
  seq: string;
  sampleId: string;
  dilutionFactor: string;
  wellPosition: string;
  remark: string;
}

interface ModelValue {
  context: {
    projectCode: string;
    methodVersion: string;
    analysisBatchNo: string;
    runId: string;
    operatorInfo: string;
    reviewerInfo: string;
    auditorInfo: string;
  };
  rows: SequenceRow[];
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

function updateContext(key: keyof ModelValue['context'], value: string) {
  patch({ context: { ...props.modelValue.context, [key]: value } });
}

function updateRow(rowIndex: number, key: keyof SequenceRow, value: string) {
  patch({ rows: props.modelValue.rows.map((row, index) => index === rowIndex ? { ...row, [key]: value } : { ...row }) });
}
</script>

<style scoped>
.seq-cell,
.seq-label,
.seq-head,
.seq-section,
.seq-title {
  border: 1px solid #222;
  padding: 9px 10px;
  vertical-align: middle;
  background: #fff;
}

.seq-title {
  text-align: center;
}

.seq-label,
.seq-head,
.seq-section {
  font-weight: 600;
  background: #f7f5ee;
}

.seq-section {
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
