<template>
  <div class="w-full overflow-x-auto">
    <table class="w-full min-w-[900px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col class="w-[20%]" />
        <col class="w-[20%]" />
        <col class="w-[20%]" />
        <col class="w-[20%]" />
        <col class="w-[20%]" />
      </colgroup>
      <tbody>
        <!-- 标题行 -->
        <tr>
          <td class="dil-title" colspan="5">
            <div class="flex items-center justify-between gap-3">
              <div class="text-[26px] font-bold">样品稀释过程记录表</div>
              <div class="text-[16px] font-medium">BA-SBR13 / 2V</div>
            </div>
          </td>
        </tr>

        <!-- 上下文区 -->
        <tr>
          <td class="dil-label" colspan="2">项目编号</td>
          <td class="dil-cell" colspan="3">
            <CellEditor :value="model.context.projectCode" :editable="editable" @update="updateContext('projectCode', $event)" />
          </td>
        </tr>
        <tr>
          <td class="dil-label" colspan="2">分析批编号</td>
          <td class="dil-cell" colspan="3">
            <CellEditor :value="model.context.analysisBatchNo" :editable="editable" @update="updateContext('analysisBatchNo', $event)" />
          </td>
        </tr>
        <tr>
          <td class="dil-label" colspan="2">Run ID</td>
          <td class="dil-cell" colspan="3">
            <CellEditor :value="model.context.runId" :editable="editable" @update="updateContext('runId', $event)" />
          </td>
        </tr>

        <!-- 主表格 -->
        <tr>
          <td class="dil-section" colspan="5">稀释记录明细</td>
        </tr>
        <tr>
          <td class="dil-head text-center">稀释样品编号</td>
          <td class="dil-head text-center">原样品体积(μL)</td>
          <td class="dil-head text-center">空白基质体积(μL)</td>
          <td class="dil-head text-center">总体积(μL)</td>
          <td class="dil-head text-center">稀释倍数</td>
        </tr>
        <tr v-for="(row, rowIndex) in model.rows" :key="row.id" class="h-[42px]">
          <td class="dil-cell bg-[#f3efe0]">
            <CellEditor :value="row.sampleId" :editable="editable" @update="updateRow(rowIndex, 'sampleId', $event)" />
          </td>
          <td class="dil-cell">
            <CellEditor :value="String(row.sourceVolume)" :editable="editable" type="number" @update="updateRow(rowIndex, 'sourceVolume', Number($event) || 0)" />
          </td>
          <td class="dil-cell">
            <CellEditor :value="String(row.blankMatrixVolume)" :editable="editable" type="number" @update="updateRow(rowIndex, 'blankMatrixVolume', Number($event) || 0)" />
          </td>
          <td class="dil-cell">
            <CellEditor :value="String(row.totalVolume)" :editable="editable" type="number" @update="updateRow(rowIndex, 'totalVolume', Number($event) || 0)" />
          </td>
          <td class="dil-cell">
            <CellEditor :value="String(row.dilutionFactor)" :editable="editable" type="number" @update="updateRow(rowIndex, 'dilutionFactor', Number($event) || 0)" />
          </td>
        </tr>
        <tr v-if="model.rows.length === 0">
          <td class="dil-cell text-center text-[--muted-foreground]" colspan="5">暂无明细，点击"新增稀释记录"后填写</td>
        </tr>
      </tbody>
    </table>

    <!-- 新增行按钮 -->
    <div v-if="editable" class="mt-3">
      <button class="text-[--primary] text-sm font-medium hover:underline" @click="addRow">+ 新增稀释记录</button>
    </div>

    <!-- 底部追溯区 -->
    <table class="mt-4 w-full min-w-[900px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col class="w-[15%]" />
        <col class="w-[85%]" />
      </colgroup>
      <tbody>
        <tr>
          <td class="dil-section" colspan="2">底部追溯信息</td>
        </tr>
        <tr>
          <td class="dil-label">空白基质编号</td>
          <td class="dil-cell">
            <CellEditor :value="model.blankMatrixCode" :editable="editable" @update="updateField('blankMatrixCode', $event)" />
          </td>
        </tr>
        <tr>
          <td class="dil-label">移液器编号</td>
          <td class="dil-cell">
            <CellEditor :value="model.pipetteNo" :editable="editable" @update="updateField('pipetteNo', $event)" />
          </td>
        </tr>
        <tr>
          <td class="dil-label">容器材质</td>
          <td class="dil-cell">
            <div v-if="editable" class="flex items-center gap-3">
              <label class="inline-flex items-center gap-1">
                <input type="radio" value="玻璃" v-model="model.containerMaterial" @change="updateField('containerMaterial', '玻璃')" />
                <span>玻璃</span>
              </label>
              <label class="inline-flex items-center gap-1">
                <input type="radio" value="聚丙烯" v-model="model.containerMaterial" @change="updateField('containerMaterial', '聚丙烯')" />
                <span>聚丙烯</span>
              </label>
            </div>
            <span v-else>{{ model.containerMaterial || '—' }}</span>
          </td>
        </tr>
        <tr>
          <td class="dil-label">颜色</td>
          <td class="dil-cell">
            <div v-if="editable" class="flex items-center gap-3 flex-wrap">
              <label class="inline-flex items-center gap-1">
                <input type="radio" value="透明" v-model="model.containerColor" @change="updateField('containerColor', '透明')" />
                <span>透明</span>
              </label>
              <label class="inline-flex items-center gap-1">
                <input type="radio" value="棕色" v-model="model.containerColor" @change="updateField('containerColor', '棕色')" />
                <span>棕色</span>
              </label>
              <label class="inline-flex items-center gap-1">
                <input type="radio" value="锡箔纸包裹" v-model="model.containerColor" @change="updateField('containerColor', '锡箔纸包裹')" />
                <span>锡箔纸包裹</span>
              </label>
            </div>
            <span v-else>{{ model.containerColor || '—' }}</span>
          </td>
        </tr>
        <tr>
          <td class="dil-label">光照条件</td>
          <td class="dil-cell">
            <div v-if="editable" class="flex items-center gap-3 flex-wrap">
              <label class="inline-flex items-center gap-1">
                <BaseCheckbox :checked="lightConditions.includes('黄光灯')" :disabled="!editable" @update:checked="toggleLightCondition('黄光灯')" />
                <span>黄光灯</span>
              </label>
              <label class="inline-flex items-center gap-1">
                <BaseCheckbox :checked="lightConditions.includes('白色荧光灯')" :disabled="!editable" @update:checked="toggleLightCondition('白色荧光灯')" />
                <span>白色荧光灯</span>
              </label>
            </div>
            <span v-else>{{ lightConditions.join(' / ') || '—' }}</span>
          </td>
        </tr>
        <tr>
          <td class="dil-label">温度条件</td>
          <td class="dil-cell">
            <div v-if="editable" class="flex items-center gap-3 flex-wrap">
              <label class="inline-flex items-center gap-1">
                <BaseCheckbox :checked="tempConditions.includes('RT')" :disabled="!editable" @update:checked="toggleTempCondition('RT')" />
                <span>RT</span>
              </label>
              <label class="inline-flex items-center gap-1">
                <BaseCheckbox :checked="tempConditions.includes('WI')" :disabled="!editable" @update:checked="toggleTempCondition('WI')" />
                <span>WI</span>
              </label>
            </div>
            <span v-else>{{ tempConditions.join(' / ') || '—' }}</span>
          </td>
        </tr>
        <tr>
          <td class="dil-label">稀释完成时间</td>
          <td class="dil-cell">
            <CellEditor :value="model.completionTime" :editable="editable" type="datetime-local" @update="updateField('completionTime', $event)" />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 签字区 -->
    <table class="mt-4 w-full min-w-[900px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col class="w-[15%]" />
        <col class="w-[85%]" />
      </colgroup>
      <tbody>
        <tr>
          <td class="dil-section" colspan="2">签字区</td>
        </tr>
        <tr>
          <td class="dil-label">操作人 / 日期</td>
          <td class="dil-cell">
            <CellEditor :value="model.signatures.operator" :editable="editable" @update="updateSignature('operator', $event)" />
          </td>
        </tr>
        <tr>
          <td class="dil-label">现场复核人 / 日期</td>
          <td class="dil-cell">
            <CellEditor :value="model.signatures.reviewer" :editable="editable" @update="updateSignature('reviewer', $event)" />
          </td>
        </tr>
        <tr>
          <td class="dil-label">审核人 / 日期</td>
          <td class="dil-cell">
            <CellEditor :value="model.signatures.auditor" :editable="editable" @update="updateSignature('auditor', $event)" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue';
import BaseCheckbox from '@/components/base/BaseCheckbox.vue';

interface DilutionRow {
  id: string;
  sampleId: string;
  sourceVolume: number;
  blankMatrixVolume: number;
  totalVolume: number;
  dilutionFactor: number;
}

interface ModelValue {
  context: {
    projectCode?: string;
    analysisBatchNo?: string;
    runId?: string;
  };
  rows: DilutionRow[];
  blankMatrixCode: string;
  pipetteNo: string;
  containerMaterial: string;
  containerColor: string;
  lightConditions: string[];
  tempConditions: string[];
  completionTime: string;
  signatures: { operator: string; reviewer: string; auditor: string };
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

const lightConditions = computed(() => props.modelValue.lightConditions);
const tempConditions = computed(() => props.modelValue.tempConditions);

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

function updateField(key: string, value: any) {
  patch({ [key]: value } as Partial<ModelValue>);
}

function updateSignature(key: 'operator' | 'reviewer' | 'auditor', value: string) {
  patch({ signatures: { ...props.modelValue.signatures, [key]: value } });
}

function updateRow(rowIndex: number, key: keyof DilutionRow, value: any) {
  const nextRows = props.modelValue.rows.map((row, index) =>
    index === rowIndex ? { ...row, [key]: value } : row
  );
  patch({ rows: nextRows });
}

function addRow() {
  const newRow: DilutionRow = {
    id: `dil-${Date.now()}`,
    sampleId: '',
    sourceVolume: 0,
    blankMatrixVolume: 0,
    totalVolume: 0,
    dilutionFactor: 0,
  };
  patch({ rows: [...props.modelValue.rows, newRow] });
}

function toggleLightCondition(condition: string) {
  const current = [...props.modelValue.lightConditions];
  const index = current.indexOf(condition);
  if (index >= 0) current.splice(index, 1);
  else current.push(condition);
  patch({ lightConditions: current });
}

function toggleTempCondition(condition: string) {
  const current = [...props.modelValue.tempConditions];
  const index = current.indexOf(condition);
  if (index >= 0) current.splice(index, 1);
  else current.push(condition);
  patch({ tempConditions: current });
}
</script>

<style scoped>
.dil-cell,
.dil-label,
.dil-section,
.dil-title,
.dil-head {
  border: 1px solid #222;
  padding: 9px 10px;
  vertical-align: middle;
  background: #fff;
}

.dil-title {
  text-align: center;
  padding: 14px 10px;
}

.dil-section,
.dil-label,
.dil-head {
  font-weight: 600;
  background: #f7f5ee;
}

.dil-section {
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
