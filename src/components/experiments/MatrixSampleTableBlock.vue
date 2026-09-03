<template>
  <div class="w-full overflow-x-auto">
    <!-- 主表格 -->
    <table class="w-full min-w-[1360px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col class="w-[12%]" />
        <col class="w-[12%]" />
        <col class="w-[10%]" />
        <col class="w-[10%]" />
        <col class="w-[12%]" />
        <col class="w-[10%]" />
        <col class="w-[12%]" />
        <col class="w-[12%]" />
        <col class="w-[10%]" />
      </colgroup>
      <tbody>
        <!-- 标题行 -->
        <tr>
          <td class="mx-title" colspan="9">
            <div class="flex items-center justify-between gap-3">
              <div class="text-[26px] font-bold">含基质样品配制表</div>
              <div class="text-[16px] font-medium">BA-SBR06 / 3V</div>
            </div>
          </td>
        </tr>

        <!-- 上下文区 -->
        <tr>
          <td class="mx-label" colspan="2">项目编号</td>
          <td class="mx-cell" colspan="3">
            <CellEditor :value="model.context.projectCode" :editable="editable" @update="updateContext('projectCode', $event)" />
          </td>
          <td class="mx-label" colspan="2">方法版本号</td>
          <td class="mx-cell" colspan="2">
            <CellEditor :value="model.context.methodVersion" :editable="editable" @update="updateContext('methodVersion', $event)" />
          </td>
        </tr>

        <!-- 主表格区 -->
        <tr>
          <td class="mx-section" colspan="9">主表格区</td>
        </tr>
        <tr>
          <td class="mx-label text-center">样品代码</td>
          <td class="mx-label text-center" colspan="3">源溶液信息</td>
          <td class="mx-label text-center">空白基质体积(μL)</td>
          <td class="mx-label text-center">终体积(μL)</td>
          <td class="mx-label text-center">空白基质编号</td>
          <td class="mx-label text-center">最终浓度(ng/mL)</td>
          <td class="mx-label text-center">操作</td>
        </tr>
        <tr>
          <td class="mx-subhead">样品代码</td>
          <td class="mx-subhead">代码</td>
          <td class="mx-subhead">浓度(ng/mL)</td>
          <td class="mx-subhead">体积(μL)</td>
          <td class="mx-subhead">空白基质体积(μL)</td>
          <td class="mx-subhead">终体积(μL)</td>
          <td class="mx-subhead">空白基质编号</td>
          <td class="mx-subhead">最终浓度(ng/mL)</td>
          <td class="mx-subhead">记录</td>
        </tr>
        <tr v-for="(row, rowIndex) in model.rows" :key="row.id" class="h-[58px]">
          <td class="mx-cell bg-[#f3efe0]">
            <CellEditor :value="row.sampleCode" :editable="editable" @update="updateRow(rowIndex, 'sampleCode', $event)" />
          </td>
          <td class="mx-cell">
            <CellEditor :value="row.sourceCode" :editable="editable" @update="updateRow(rowIndex, 'sourceCode', $event)" />
          </td>
          <td class="mx-cell">
            <CellEditor :value="row.sourceConcentration" :editable="editable" @update="updateRow(rowIndex, 'sourceConcentration', $event)" />
          </td>
          <td class="mx-cell">
            <CellEditor :value="String(row.sourceVolume)" :editable="editable" type="number" @update="updateRow(rowIndex, 'sourceVolume', Number($event) || 0)" />
          </td>
          <td class="mx-cell">
            <CellEditor :value="String(row.blankMatrixVolume)" :editable="editable" type="number" @update="updateRow(rowIndex, 'blankMatrixVolume', Number($event) || 0)" />
          </td>
          <td class="mx-cell">
            <CellEditor :value="String(row.finalVolume)" :editable="editable" type="number" @update="updateRow(rowIndex, 'finalVolume', Number($event) || 0)" />
          </td>
          <td class="mx-cell">
            <CellEditor :value="row.blankMatrixCode" :editable="editable" @update="updateRow(rowIndex, 'blankMatrixCode', $event)" />
          </td>
          <td class="mx-cell">
            <CellEditor :value="row.finalConcentration" :editable="editable" @update="updateRow(rowIndex, 'finalConcentration', $event)" />
          </td>
          <td class="mx-cell">
            <div v-if="editable" class="flex flex-col items-center gap-1 text-[11px]">
              <button class="text-[--primary] hover:underline" @click="copyRow(rowIndex)">复制</button>
              <button class="text-[--danger] hover:underline" @click="removeRow(rowIndex)">删除</button>
            </div>
            <span v-else class="block text-center text-[--muted-foreground]">—</span>
          </td>
        </tr>
        <tr v-if="model.rows.length === 0">
          <td class="mx-cell text-center text-[--muted-foreground]" colspan="9">暂无明细，点击"新增样品配制记录"后填写</td>
        </tr>
      </tbody>
    </table>

    <!-- 新增行按钮 -->
    <div v-if="editable" class="mt-3">
      <button class="text-[--primary] text-sm font-medium hover:underline" @click="addRow">+ 新增样品配制记录</button>
    </div>

    <!-- 底部配制追溯区 -->
    <table class="mt-4 w-full min-w-[1360px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col v-for="n in 9" :key="n" class="w-[11.11%]" />
      </colgroup>
      <tbody>
        <tr>
          <td class="mx-section" colspan="9">底部配制追溯区</td>
        </tr>
        <tr>
          <td class="mx-label" colspan="2">源溶液批号</td>
          <td class="mx-cell" colspan="3">
            <CellEditor :value="model.sourceBatch" :editable="editable" @update="updateField('sourceBatch', $event)" />
          </td>
          <td class="mx-label" colspan="2">剩余空白基质</td>
          <td class="mx-cell" colspan="2">
            <div v-if="editable" class="flex items-center gap-2 flex-wrap">
              <label class="inline-flex items-center gap-1">
                <input type="radio" value="next" v-model="model.blankMatrixDisposition" @change="updateField('blankMatrixDisposition', 'next')" />
                <span>进行下一步试验</span>
              </label>
              <label class="inline-flex items-center gap-1">
                <input type="radio" value="return" v-model="model.blankMatrixDisposition" @change="updateField('blankMatrixDisposition', 'return')" />
                <span>归还冰箱编号</span>
              </label>
              <template v-if="model.blankMatrixDisposition === 'return'">
                <CellEditor :value="model.blankMatrixFridgeNo" :editable="editable" @update="updateField('blankMatrixFridgeNo', $event)" />
              </template>
            </div>
            <span v-else class="block">{{ model.blankMatrixDisposition === 'return' ? `归还冰箱编号：${model.blankMatrixFridgeNo || '—'}` : (model.blankMatrixDisposition || '进行下一步试验') }}</span>
          </td>
        </tr>
        <tr>
          <td class="mx-label" colspan="2">移液器编号</td>
          <td class="mx-cell" colspan="3">
            <CellEditor :value="model.pipetteNo" :editable="editable" @update="updateField('pipetteNo', $event)" />
          </td>
          <td class="mx-label" colspan="2">容器材质</td>
          <td class="mx-cell" colspan="2">
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
          <td class="mx-label" colspan="2">容器颜色</td>
          <td class="mx-cell" colspan="3">
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
          <td class="mx-label" colspan="2">光照条件</td>
          <td class="mx-cell" colspan="2">
            <div v-if="editable" class="flex items-center gap-3 flex-wrap">
              <label class="inline-flex items-center gap-1">
                <BaseCheckbox :checked="props.modelValue.lightConditions.includes('黄光灯')" :disabled="!editable" @update:checked="toggleLightCondition('黄光灯')" />
                <span>黄光灯</span>
              </label>
              <label class="inline-flex items-center gap-1">
                <BaseCheckbox :checked="props.modelValue.lightConditions.includes('白色荧光灯')" :disabled="!editable" @update:checked="toggleLightCondition('白色荧光灯')" />
                <span>白色荧光灯</span>
              </label>
            </div>
            <span v-else>{{ props.modelValue.lightConditions.join(' / ') || '—' }}</span>
          </td>
        </tr>
        <tr>
          <td class="mx-label" colspan="2">温度条件</td>
          <td class="mx-cell" colspan="7">
            <div v-if="editable" class="flex items-center gap-3 flex-wrap">
              <label class="inline-flex items-center gap-1">
                <BaseCheckbox :checked="props.modelValue.tempConditions.includes('RT')" :disabled="!editable" @update:checked="toggleTempCondition('RT')" />
                <span>RT</span>
              </label>
              <label class="inline-flex items-center gap-1">
                <BaseCheckbox :checked="props.modelValue.tempConditions.includes('WI')" :disabled="!editable" @update:checked="toggleTempCondition('WI')" />
                <span>WI</span>
              </label>
            </div>
            <span v-else>{{ props.modelValue.tempConditions.join(' / ') || '—' }}</span>
          </td>
        </tr>
        <tr>
          <td class="mx-label" colspan="2">该批样品批号</td>
          <td class="mx-cell" colspan="3">
            <CellEditor :value="model.batchLabel" :editable="editable" @update="updateField('batchLabel', $event)" />
          </td>
          <td class="mx-label" colspan="2">配制完成时间</td>
          <td class="mx-cell" colspan="2">
            <CellEditor :value="model.completedAt" :editable="editable" type="datetime-local" @update="updateField('completedAt', $event)" />
          </td>
        </tr>
        <tr>
          <td class="mx-label" colspan="2">样品处置方式</td>
          <td class="mx-cell" colspan="7">
            <div v-if="editable" class="flex flex-col gap-2">
              <label class="inline-flex items-center gap-2">
                <input type="radio" value="DAU" v-model="model.disposalMethod" @change="updateField('disposalMethod', 'DAU')" />
                <span>DAU</span>
              </label>
              <label class="inline-flex items-center gap-2">
                <input type="radio" value="分装储存" v-model="model.disposalMethod" @change="updateField('disposalMethod', '分装储存')" />
                <span>进行分装后储存，各储存位置详见"分装记录表（受控纸张号：</span>
                <input v-if="model.disposalMethod === '分装储存'" type="text" class="border border-[--border] rounded px-1.5 py-0.5 text-xs w-24 outline-none focus:border-[--primary]" placeholder="受控纸张号" @input="updateField('controlledPaperNo', ($event.target as HTMLInputElement).value)" />
                <span>）"</span>
              </label>
              <label class="inline-flex items-center gap-2">
                <input type="radio" value="直接储存" v-model="model.disposalMethod" @change="updateField('disposalMethod', '直接储存')" />
                <span>直接储存于（冰箱编号：</span>
                <input v-if="model.disposalMethod === '直接储存'" type="text" class="border border-[--border] rounded px-1.5 py-0.5 text-xs w-24 outline-none focus:border-[--primary]" placeholder="冰箱编号" @input="updateField('refrigeratorNo', ($event.target as HTMLInputElement).value)" />
                <span>）中。</span>
              </label>
            </div>
            <span v-else class="block">
              <template v-if="model.disposalMethod === '分装储存'">进行分装后储存，各储存位置详见"分装记录表（受控纸张号：{{ model.controlledPaperNo || '—' }}）"
              </template>
              <template v-else-if="model.disposalMethod === '直接储存'">直接储存于（冰箱编号：{{ model.refrigeratorNo || '—' }}）中。
              </template>
              <template v-else>{{ model.disposalMethod || '—' }}</template>
            </span>
          </td>
        </tr>
        <tr>
          <td class="mx-note" colspan="9">&nbsp;</td>
        </tr>
      </tbody>
    </table>

    <!-- 签字区 -->
    <table class="mt-4 w-full min-w-[1360px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col v-for="n in 9" :key="n" class="w-[11.11%]" />
      </colgroup>
      <tbody>
        <tr>
          <td class="mx-section" colspan="9">签字区</td>
        </tr>
        <tr>
          <td class="mx-label" colspan="3">操作人 / 日期</td>
          <td class="mx-cell" colspan="2">
            <CellEditor :value="model.signatures.operator" :editable="editable" @update="updateSignature('operator', $event)" />
          </td>
          <td class="mx-label" colspan="2">现场复核人 / 日期</td>
          <td class="mx-cell" colspan="2">
            <CellEditor :value="model.signatures.reviewer" :editable="editable" @update="updateSignature('reviewer', $event)" />
          </td>
        </tr>
        <tr>
          <td class="mx-label" colspan="3">审核人 / 日期</td>
          <td class="mx-cell" colspan="6">
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

interface MatrixSampleRow {
  id: string;
  sampleCode: string;
  sourceCode: string;
  sourceConcentration: string;
  sourceVolume: number;
  blankMatrixVolume: number;
  finalVolume: number;
  blankMatrixCode: string;
  finalConcentration: string;
}

interface ModelValue {
  context: {
    projectCode?: string;
    methodVersion?: string;
  };
  rows: MatrixSampleRow[];
  sourceBatch: string;
  blankMatrixDisposition: 'next' | 'return' | '';
  blankMatrixFridgeNo: string;
  pipetteNo: string;
  containerMaterial: string;
  containerColor: string;
  lightConditions: string[];
  tempConditions: string[];
  batchLabel: string;
  completedAt: string;
  disposalMethod: 'DAU' | '分装储存' | '直接储存' | '';
  controlledPaperNo: string;
  refrigeratorNo: string;
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

function updateField(key: keyof Omit<ModelValue, 'context' | 'rows' | 'signatures'>, value: any) {
  patch({ [key]: value } as Partial<ModelValue>);
}

function updateSignature(key: keyof ModelValue['signatures'], value: string) {
  patch({ signatures: { ...props.modelValue.signatures, [key]: value } });
}

function updateRow(rowIndex: number, key: keyof MatrixSampleRow, value: any) {
  const nextRows = props.modelValue.rows.map((row, index) =>
    index === rowIndex ? { ...row, [key]: value } : row
  );
  patch({ rows: nextRows });
}

function addRow() {
  const newRow: MatrixSampleRow = {
    id: `mx-${Date.now()}`,
    sampleCode: '',
    sourceCode: '',
    sourceConcentration: '',
    sourceVolume: 0,
    blankMatrixVolume: 0,
    finalVolume: 0,
    blankMatrixCode: '',
    finalConcentration: '',
  };
  patch({ rows: [...props.modelValue.rows, newRow] });
}

function copyRow(rowIndex: number) {
  const row = props.modelValue.rows[rowIndex];
  if (!row) return;
  const newRow: MatrixSampleRow = { ...row, id: `mx-${Date.now()}` };
  const nextRows = [...props.modelValue.rows];
  nextRows.splice(rowIndex + 1, 0, newRow);
  patch({ rows: nextRows });
}

function removeRow(rowIndex: number) {
  const nextRows = props.modelValue.rows.filter((_, index) => index !== rowIndex);
  patch({ rows: nextRows });
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
.mx-cell,
.mx-label,
.mx-section,
.mx-title,
.mx-subhead,
.mx-note {
  border: 1px solid #222;
  padding: 9px 10px;
  vertical-align: middle;
  background: #fff;
}

.mx-title {
  text-align: center;
}

.mx-section,
.mx-label,
.mx-subhead {
  font-weight: 600;
  background: #f7f5ee;
}

.mx-section {
  font-size: 16px;
  text-align: left;
}

.mx-note {
  min-height: 52px;
  background: #fffdf6;
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
