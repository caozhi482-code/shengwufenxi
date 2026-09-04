<template>
  <div class="w-full overflow-x-auto">
    <table class="w-full min-w-[1480px] border-collapse table-fixed text-sm text-[--text-main]">
      <colgroup>
        <col v-for="n in 12" :key="n" class="w-[8.33%]" />
      </colgroup>
      <tbody>
        <tr>
          <td class="ref-cell text-center text-[26px] font-bold py-4" colspan="12">对照品称量及储备液配制记录表</td>
        </tr>
        <tr>
          <td class="ref-label text-center" colspan="2">记录类型</td>
          <td class="ref-cell text-center" colspan="5">
            <select v-if="editable" :value="model.basic.recordType" class="cell-input text-center" @change="updateBasic('recordType', ($event.target as HTMLSelectElement).value)">
              <option value="分析物">分析物</option>
              <option value="内标">内标</option>
            </select>
            <span v-else>{{ model.basic.recordType || '分析物 / 内标' }}</span>
          </td>
          <td class="ref-label text-center" colspan="2">文件编号 / 版本</td>
          <td class="ref-cell text-center" colspan="3">BA-SBR02 / 2V</td>
        </tr>

        <tr>
          <td class="ref-section" colspan="12">基本信息</td>
        </tr>
        <tr>
          <td class="ref-label" colspan="2">对照品编号</td>
          <td class="ref-cell" colspan="2"><CellEditor :value="model.basic.referenceCode" :editable="editable" @update="updateBasic('referenceCode', $event)" /></td>
          <td class="ref-label" colspan="2">对照品名称</td>
          <td class="ref-cell" colspan="2"><CellEditor :value="model.basic.referenceName" :editable="editable" @update="updateBasic('referenceName', $event)" /></td>
          <td class="ref-label" colspan="2">对照品批号</td>
          <td class="ref-cell" colspan="2"><CellEditor :value="model.basic.referenceBatch" :editable="editable" @update="updateBasic('referenceBatch', $event)" /></td>
        </tr>
        <tr>
          <td class="ref-label" colspan="2">对照品状态</td>
          <td class="ref-cell" colspan="2">
            <select v-if="editable" :value="model.basic.referenceState" class="cell-input" @change="updateBasic('referenceState', ($event.target as HTMLSelectElement).value)">
              <option value="粉末P">粉末 P</option>
              <option value="溶液S">溶液 S</option>
            </select>
            <span v-else>{{ model.basic.referenceState || ' ' }}</span>
          </td>
          <td class="ref-label" colspan="2">对照品有效期至</td>
          <td class="ref-cell" colspan="2"><CellEditor :value="model.basic.referenceExpiry" :editable="editable" @update="updateBasic('referenceExpiry', $event)" /></td>
          <td class="ref-label" colspan="2">对照品校正因子</td>
          <td class="ref-cell" colspan="2"><CellEditor :value="model.basic.correctionFactor" :editable="editable" @update="updateBasic('correctionFactor', $event)" /></td>
        </tr>
        <tr>
          <td class="ref-label" colspan="2">天平编号</td>
          <td class="ref-cell" colspan="4"><CellEditor :value="model.basic.balanceCode" :editable="editable" @update="updateBasic('balanceCode', $event)" /></td>
          <td class="ref-label" colspan="2">移液器编号</td>
          <td class="ref-cell" colspan="4"><CellEditor :value="model.basic.pipetteCode" :editable="editable" @update="updateBasic('pipetteCode', $event)" /></td>
        </tr>

        <tr>
          <td class="ref-section" colspan="12">储备液配制</td>
        </tr>
        <tr>
          <td class="ref-label text-center">组别</td>
          <td class="ref-label text-center" colspan="2">储备液编号</td>
          <td class="ref-label text-center">储备液浓度</td>
          <td class="ref-label text-center">称量重量</td>
          <td class="ref-label text-center">溶媒体积</td>
          <td class="ref-label text-center" colspan="2">计算过程</td>
          <td class="ref-label text-center" colspan="2">称量容器</td>
          <td class="ref-label text-center" colspan="2">配制完成时间</td>
        </tr>
        <tr v-for="(row, rowIndex) in model.rows" :key="rowIndex" class="h-[58px]">
          <td class="ref-cell bg-[#f3efe0] text-center">储备液{{ rowIndex + 1 }}</td>
          <td class="ref-cell">
            <div class="space-y-1">
              <CellEditor :value="row.stockCode" :editable="editable" @update="updateRow(rowIndex, 'stockCode', $event)" />
              <button v-if="editable && !row.stockCode" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( rowIndex, 0)"><Settings2 class="h-3.5 w-3.5" />配置格子</button>
            </div>
          </td>
          <td class="ref-cell">
            <div class="space-y-1">
              <CellEditor :value="row.concentration" :editable="editable" @update="updateRow(rowIndex, 'concentration', $event)" />
              <button v-if="editable && !row.concentration" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( rowIndex, 1)"><Settings2 class="h-3.5 w-3.5" />配置格子</button>
            </div>
          </td>
          <td class="ref-cell">
            <div class="space-y-1">
              <CellEditor :value="row.weight" :editable="editable" @update="updateRow(rowIndex, 'weight', $event)" />
              <button v-if="editable && !row.weight" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( rowIndex, 2)"><Settings2 class="h-3.5 w-3.5" />配置格子</button>
            </div>
          </td>
          <td class="ref-cell">
            <div class="space-y-1">
              <CellEditor :value="row.volume" :editable="editable" @update="updateRow(rowIndex, 'volume', $event)" />
              <button v-if="editable && !row.volume" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( rowIndex, 3)"><Settings2 class="h-3.5 w-3.5" />配置格子</button>
            </div>
          </td>
          <td class="ref-cell" colspan="2">
            <div class="space-y-1">
              <CellEditor :value="row.calc" :editable="editable" @update="updateRow(rowIndex, 'calc', $event)" />
              <button v-if="editable && !row.calc" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( rowIndex, 4)"><Settings2 class="h-3.5 w-3.5" />配置格子</button>
            </div>
          </td>
          <td class="ref-cell" colspan="2">
            <div class="space-y-1">
              <CellEditor :value="row.container" :editable="editable" @update="updateRow(rowIndex, 'container', $event)" />
              <button v-if="editable && !row.container" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( rowIndex, 5)"><Settings2 class="h-3.5 w-3.5" />配置格子</button>
            </div>
          </td>
          <td class="ref-cell" colspan="2">
            <div class="space-y-1">
              <CellEditor :value="row.finishedAt" :editable="editable" @update="updateRow(rowIndex, 'finishedAt', $event)" />
              <button v-if="editable && !row.finishedAt" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( rowIndex, 6)"><Settings2 class="h-3.5 w-3.5" />配置格子</button>
            </div>
          </td>
        </tr>

        <tr>
          <td class="ref-section" colspan="12">溶媒与容器信息</td>
        </tr>
        <tr>
          <td class="ref-label" colspan="2">溶媒代码</td>
          <td class="ref-cell" colspan="2"><CellEditor :value="model.solventCode" :editable="editable" @update="updateField('solventCode', $event)" /></td>
          <td class="ref-label" colspan="2">溶媒批号</td>
          <td class="ref-cell" colspan="2"><CellEditor :value="model.solventBatch" :editable="editable" @update="updateField('solventBatch', $event)" /></td>
          <td class="ref-label" colspan="2">稀释液名称</td>
          <td class="ref-cell" colspan="2"><CellEditor :value="model.diluentName" :editable="editable" @update="updateField('diluentName', $event)" /></td>
        </tr>
        <tr>
          <td class="ref-label" colspan="2">稀释液批号</td>
          <td class="ref-cell" colspan="2"><CellEditor :value="model.diluentBatch" :editable="editable" @update="updateField('diluentBatch', $event)" /></td>
          <td class="ref-label" colspan="2">稀释液厂家</td>
          <td class="ref-cell" colspan="2"><CellEditor :value="model.diluentManufacturer" :editable="editable" @update="updateField('diluentManufacturer', $event)" /></td>
          <td class="ref-label" colspan="2">稀释液失效期</td>
          <td class="ref-cell" colspan="2"><CellEditor :value="model.diluentExpiry" :editable="editable" @update="updateField('diluentExpiry', $event)" /></td>
        </tr>
        <tr>
          <td class="ref-label" colspan="2">储备液容器材质</td>
          <td class="ref-cell" colspan="2"><CellEditor :value="model.containerMaterial" :editable="editable" @update="updateField('containerMaterial', $event)" /></td>
          <td class="ref-label" colspan="2">颜色</td>
          <td class="ref-cell" colspan="2"><CellEditor :value="model.color" :editable="editable" @update="updateField('color', $event)" /></td>
          <td class="ref-label" colspan="2">配制光照条件</td>
          <td class="ref-cell" colspan="2"><CellEditor :value="model.lightCondition" :editable="editable" @update="updateField('lightCondition', $event)" /></td>
        </tr>
        <tr>
          <td class="ref-label" colspan="2">溶液处置方式</td>
          <td class="ref-cell" colspan="4"><CellEditor :value="model.disposalMethod" :editable="editable" @update="updateField('disposalMethod', $event)" /></td>
          <td class="ref-label" colspan="2">受控纸张号 / 冰箱编号</td>
          <td class="ref-cell" colspan="4"><CellEditor :value="model.storageRef" :editable="editable" @update="updateField('storageRef', $event)" /></td>
        </tr>

        <tr>
          <td class="ref-label" colspan="2">注意事项</td>
          <td class="ref-cell text-[18px]" colspan="10">称量条粘贴在本页记录后面并骑缝签字签日期</td>
        </tr>
        <tr>
          <td class="ref-label" colspan="2">该批溶液批号</td>
          <td class="ref-cell" colspan="10"><CellEditor :value="model.batchLabel" :editable="editable" @update="updateField('batchLabel', $event)" /></td>
        </tr>
        <tr>
          <td class="ref-label" colspan="2">操作人 / 日期</td>
          <td class="ref-cell" colspan="2"><CellEditor :value="model.signatures.operator" :editable="editable" @update="updateSignature('operator', $event)" /></td>
          <td class="ref-label" colspan="2">现场复核人 / 日期</td>
          <td class="ref-cell" colspan="2"><CellEditor :value="model.signatures.reviewer" :editable="editable" @update="updateSignature('reviewer', $event)" /></td>
          <td class="ref-label" colspan="2">审核人 / 日期</td>
          <td class="ref-cell" colspan="2"><CellEditor :value="model.signatures.auditor" :editable="editable" @update="updateSignature('auditor', $event)" /></td>
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

interface RowModel {
  stockCode: string;
  concentration: string;
  weight: string;
  volume: string;
  calc: string;
  container: string;
  finishedAt: string;
  remark?: string;
}

interface ModelValue {
  basic: {
    recordType: string;
    referenceCode: string;
    referenceName: string;
    referenceBatch: string;
    referenceState: string;
    referenceExpiry: string;
    correctionFactor: string;
    balanceCode: string;
    pipetteCode: string;
  };
  rows: RowModel[];
  solventCode: string;
  solventBatch: string;
  diluentName: string;
  diluentBatch: string;
  diluentManufacturer: string;
  diluentExpiry: string;
  containerMaterial: string;
  color: string;
  lightCondition: string;
  disposalMethod: string;
  storageRef: string;
  batchLabel: string;
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

function updateBasic(key: keyof ModelValue['basic'], value: string) {
  patch({ basic: { ...props.modelValue.basic, [key]: value } });
}

function updateField(key: keyof Omit<ModelValue, 'basic' | 'rows' | 'signatures'>, value: string) {
  patch({ [key]: value } as Partial<ModelValue>);
}

function updateSignature(key: keyof ModelValue['signatures'], value: string) {
  patch({ signatures: { ...props.modelValue.signatures, [key]: value } });
}

function updateRow(rowIndex: number, key: keyof RowModel, value: string) {
  patch({ rows: props.modelValue.rows.map((row, index) => index === rowIndex ? { ...row, [key]: value } : { ...row }) });
}
</script>

<style scoped>
.ref-cell,
.ref-label,
.ref-section {
  border: 1px solid #222;
  min-height: 44px;
  padding: 10px 12px;
  vertical-align: middle;
}

.ref-label,
.ref-section {
  font-weight: 600;
  background: #f7f5ee;
}

.ref-section {
  font-size: 17px;
  text-align: left;
}

.cell-input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--text-main);
}
</style>
