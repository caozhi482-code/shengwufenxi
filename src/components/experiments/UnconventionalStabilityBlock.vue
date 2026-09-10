<template>
  <div class="w-full overflow-x-auto">
    <table class="us-table">
      <colgroup>
        <col class="us-col-1" />
        <col class="us-col-2" />
        <col class="us-col-3" />
        <col class="us-col-4" />
        <col class="us-col-5" />
        <col class="us-col-6" />
        <col class="us-col-7" />
        <col class="us-col-8" />
      </colgroup>
      <tbody>
        <tr>
          <td class="us-title" colspan="8">
            <div class="us-title-wrap">
              <div class="us-title-main">非常规项目采集稳定性样品制备表</div>
              <div class="us-title-code">BA-SBR23 / 2V</div>
            </div>
          </td>
        </tr>

        <tr>
          <td class="us-label" colspan="2">项目编号</td>
          <td class="us-blank" colspan="2"><div class="space-y-1"><CellEditor :value="model.context.projectCode" :editable="editable" @update="updateContext('projectCode', $event)" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-1')">配置格子</button></div></td>
          <td class="us-label" colspan="2">方法版本号</td>
          <td class="us-blank" colspan="2"><div class="space-y-1"><CellEditor :value="model.context.methodVersion" :editable="editable" @update="updateContext('methodVersion', $event)" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-2')">配置格子</button></div></td>
        </tr>
        <tr>
          <td class="us-label" colspan="2">恒温箱编号</td>
          <td class="us-blank" colspan="2"><div class="space-y-1"><CellEditor :value="model.equipment.incubatorId" :editable="editable" @update="updateEquipment('incubatorId', $event)" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-3')">配置格子</button></div></td>
          <td class="us-label" colspan="2">离心机编号</td>
          <td class="us-blank" colspan="2"><div class="space-y-1"><CellEditor :value="model.equipment.centrifugeId" :editable="editable" @update="updateEquipment('centrifugeId', $event)" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-4')">配置格子</button></div></td>
        </tr>
        <tr>
          <td class="us-label" colspan="2">移液器编号</td>
          <td class="us-blank" colspan="6"><div class="space-y-1"><CellEditor :value="model.equipment.pipetteId" :editable="editable" @update="updateEquipment('pipetteId', $event)" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-5')">配置格子</button></div></td>
        </tr>

        <tr><td class="us-section" colspan="8">一、全血样品的配制</td></tr>
        <tr>
          <td class="us-head">样品代码</td>
          <td class="us-head">源溶液编号</td>
          <td class="us-head">源溶液体积(μL)</td>
          <td class="us-head">空白全血体积(μL)</td>
          <td class="us-head">最终样品总体积(μL)</td>
          <td class="us-head" colspan="3"></td>
        </tr>
        <tr v-for="(row, index) in model.blood.rows" :key="row.id" class="us-row">
          <td class="us-data light-bg"><div class="space-y-1"><CellEditor :value="row.sampleCode" :editable="editable" @update="updateBloodRow(index, 'sampleCode', $event)" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-6')">配置格子</button></div></td>
          <td class="us-data"><div class="space-y-1"><CellEditor :value="row.sourceCode" :editable="editable" @update="updateBloodRow(index, 'sourceCode', $event)" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-7')">配置格子</button></div></td>
          <td class="us-data"><div class="space-y-1"><CellEditor :value="displayNumber(row.sourceVolume)" :editable="editable" type="number" @update="updateBloodRow(index, 'sourceVolume', parseNumber($event))" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-8')">配置格子</button></div></td>
          <td class="us-data"><div class="space-y-1"><CellEditor :value="displayNumber(row.blankBloodVolume)" :editable="editable" type="number" @update="updateBloodRow(index, 'blankBloodVolume', parseNumber($event))" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-9')">配置格子</button></div></td>
          <td class="us-data"><div class="space-y-1"><CellEditor :value="displayNumber(row.finalVolume)" :editable="editable" type="number" @update="updateBloodRow(index, 'finalVolume', parseNumber($event))" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-10')">配置格子</button></div></td>
          <td class="us-data" colspan="3"></td>
        </tr>
        <tr>
          <td class="us-label">源溶液批号：</td>
          <td class="us-blank" colspan="3"><div class="space-y-1"><CellEditor :value="model.blood.sourceBatch" :editable="editable" @update="updateBloodModel('sourceBatch', $event)" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-11')">配置格子</button></div></td>
          <td class="us-label">空白全血编号：</td>
          <td class="us-blank" colspan="3"><div class="space-y-1"><CellEditor :value="model.blood.blankBloodCode" :editable="editable" @update="updateBloodModel('blankBloodCode', $event)" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-12')">配置格子</button></div></td>
        </tr>
        <tr>
          <td class="us-label">样品配制过程在：</td>
          <td class="us-blank" colspan="7">
            <div v-if="editable" class="condition-line wrap">
              <label class="inline-flex items-center gap-1"><BaseCheckbox :checked="model.blood.lightConditions.includes('黄光灯')" @update:checked="toggleBloodLight('黄光灯')" /><span>黄光灯</span></label>
              <span>/</span>
              <label class="inline-flex items-center gap-1"><BaseCheckbox :checked="model.blood.lightConditions.includes('白色荧光灯')" @update:checked="toggleBloodLight('白色荧光灯')" /><span>白色荧光灯</span></label>
              <span>；</span>
              <label class="inline-flex items-center gap-1"><BaseCheckbox :checked="model.blood.tempConditions.includes('RT')" @update:checked="toggleBloodTemp('RT')" /><span>RT</span></label>
              <span>/</span>
              <label class="inline-flex items-center gap-1"><BaseCheckbox :checked="model.blood.tempConditions.includes('WI')" @update:checked="toggleBloodTemp('WI')" /><span>WI</span></label>
            </div>
            <span v-else>{{ bloodConditionDisplay }}</span>
          </td>
        </tr>

        <tr><td class="us-section" colspan="8">二、全血样品的孵育及分装</td></tr>
        <tr>
          <td class="us-label">开始孵育时间</td>
          <td class="us-blank"><div class="space-y-1"><CellEditor :value="model.incubation.startTime" :editable="editable" @update="updateIncubation('startTime', $event)" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-13')">配置格子</button></div></td>
          <td class="us-label">孵育时间(min)</td>
          <td class="us-blank"><div class="space-y-1"><CellEditor :value="displayNumber(model.incubation.duration)" :editable="editable" type="number" @update="updateIncubation('duration', parseNumber($event))" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-14')">配置格子</button></div></td>
          <td class="us-label">结束时间</td>
          <td class="us-blank"><div class="space-y-1"><CellEditor :value="model.incubation.endTime" :editable="editable" @update="updateIncubation('endTime', $event)" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-15')">配置格子</button></div></td>
          <td class="us-label">分装份数</td>
          <td class="us-blank"><div class="space-y-1"><CellEditor :value="displayNumber(model.incubation.aliquotCount)" :editable="editable" type="number" @update="updateIncubation('aliquotCount', parseNumber($event))" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-16')">配置格子</button></div></td>
        </tr>
        <tr>
          <td class="us-label">分装容器材质</td>
          <td class="us-blank">
            <div v-if="editable" class="choice-line">
              <label class="inline-flex items-center gap-1"><input type="radio" value="玻璃" :checked="model.incubation.containerMaterial === '玻璃'" @change="updateIncubation('containerMaterial', '玻璃')" /><span>玻璃</span></label>
              <label class="inline-flex items-center gap-1"><input type="radio" value="聚丙烯" :checked="model.incubation.containerMaterial === '聚丙烯'" @change="updateIncubation('containerMaterial', '聚丙烯')" /><span>聚丙烯</span></label>
            </div>
            <span v-else>{{ model.incubation.containerMaterial || '—' }}</span>
          </td>
          <td class="us-label">颜色</td>
          <td class="us-blank" colspan="5">
            <div v-if="editable" class="choice-line wrap">
              <label class="inline-flex items-center gap-1"><input type="radio" value="透明" :checked="model.incubation.color === '透明'" @change="updateIncubation('color', '透明')" /><span>透明</span></label>
              <label class="inline-flex items-center gap-1"><input type="radio" value="棕色" :checked="model.incubation.color === '棕色'" @change="updateIncubation('color', '棕色')" /><span>棕色</span></label>
              <label class="inline-flex items-center gap-1"><input type="radio" value="锡箔纸包裹" :checked="model.incubation.color === '锡箔纸包裹'" @change="updateIncubation('color', '锡箔纸包裹')" /><span>锡箔纸包裹</span></label>
            </div>
            <span v-else>{{ model.incubation.color || '—' }}</span>
          </td>
        </tr>

        <tr><td class="us-section" colspan="8">三、稳定性考察样品的放置</td></tr>
        <tr>
          <td class="us-label">具体过程描述：</td>
          <td class="us-blank" colspan="7"><div class="space-y-1"><CellEditor :value="model.stability.description" :editable="editable" @update="updateStability('description', $event)" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-17')">配置格子</button></div></td>
        </tr>
        <tr>
          <td class="us-head">样品代码</td>
          <td class="us-head">稳定性考察样品代码</td>
          <td class="us-head">开始放置时间</td>
          <td class="us-head">放置条件</td>
          <td class="us-head">放置结束时间</td>
          <td class="us-head" colspan="3"></td>
        </tr>
        <tr v-for="(row, index) in model.stability.rows" :key="row.id" class="us-row">
          <td class="us-data light-bg"><div class="space-y-1"><CellEditor :value="row.sampleCode" :editable="editable" @update="updateStabilityRow(index, 'sampleCode', $event)" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-18')">配置格子</button></div></td>
          <td class="us-data"><div class="space-y-1"><CellEditor :value="row.stabilityCode" :editable="editable" @update="updateStabilityRow(index, 'stabilityCode', $event)" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-19')">配置格子</button></div></td>
          <td class="us-data"><div class="space-y-1"><CellEditor :value="row.startTime" :editable="editable" @update="updateStabilityRow(index, 'startTime', $event)" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-20')">配置格子</button></div></td>
          <td class="us-data">
            <div v-if="editable" class="condition-stack">
              <label class="inline-flex items-center gap-1"><BaseCheckbox :checked="row.conditions.includes('黄光灯')" @update:checked="toggleStabLight(index, '黄光灯')" /><span>黄光灯</span></label>
              <label class="inline-flex items-center gap-1"><BaseCheckbox :checked="row.conditions.includes('白色荧光灯')" @update:checked="toggleStabLight(index, '白色荧光灯')" /><span>白色荧光灯</span></label>
              <label class="inline-flex items-center gap-1"><BaseCheckbox :checked="row.conditions.includes('RT')" @update:checked="toggleStabTemp(index, 'RT')" /><span>RT</span></label>
              <label class="inline-flex items-center gap-1"><BaseCheckbox :checked="row.conditions.includes('WI')" @update:checked="toggleStabTemp(index, 'WI')" /><span>WI</span></label>
            </div>
            <span v-else>{{ row.conditions.length ? row.conditions.join(' / ') : '—' }}</span>
          </td>
          <td class="us-data"><div class="space-y-1"><CellEditor :value="row.endTime" :editable="editable" @update="updateStabilityRow(index, 'endTime', $event)" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-21')">配置格子</button></div></td>
          <td class="us-data" colspan="3"></td>
        </tr>
        <tr>
          <td class="us-label">离心后容器材质：</td>
          <td class="us-blank">
            <div v-if="editable" class="choice-line">
              <label class="inline-flex items-center gap-1"><input type="radio" value="玻璃" :checked="model.stability.containerMaterial === '玻璃'" @change="updateStability('containerMaterial', '玻璃')" /><span>玻璃</span></label>
              <label class="inline-flex items-center gap-1"><input type="radio" value="聚丙烯" :checked="model.stability.containerMaterial === '聚丙烯'" @change="updateStability('containerMaterial', '聚丙烯')" /><span>聚丙烯</span></label>
            </div>
            <span v-else>{{ model.stability.containerMaterial || '—' }}</span>
          </td>
          <td class="us-label">颜色：</td>
          <td class="us-blank">
            <div v-if="editable" class="choice-line wrap">
              <label class="inline-flex items-center gap-1"><input type="radio" value="透明" :checked="model.stability.color === '透明'" @change="updateStability('color', '透明')" /><span>透明</span></label>
              <label class="inline-flex items-center gap-1"><input type="radio" value="棕色" :checked="model.stability.color === '棕色'" @change="updateStability('color', '棕色')" /><span>棕色</span></label>
              <label class="inline-flex items-center gap-1"><input type="radio" value="锡箔纸包裹" :checked="model.stability.color === '锡箔纸包裹'" @change="updateStability('color', '锡箔纸包裹')" /><span>锡箔纸包裹</span></label>
            </div>
            <span v-else>{{ model.stability.color || '—' }}</span>
          </td>
          <td class="us-label">储存条件：</td>
          <td class="us-blank" colspan="4"><div class="space-y-1"><CellEditor :value="model.stability.storageCondition" :editable="editable" @update="updateStability('storageCondition', $event)" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-22')">配置格子</button></div></td>
        </tr>

        <tr><td class="us-section" colspan="8">签字区</td></tr>
        <tr>
          <td class="us-label">操作人/日期：</td>
          <td class="us-blank" colspan="7"><div class="space-y-1"><CellEditor :value="model.signatures.operator" :editable="editable" @update="updateSignature('operator', $event)" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-23')">配置格子</button></div></td>
        </tr>
        <tr>
          <td class="us-label">现场复核人/日期：</td>
          <td class="us-blank" colspan="7"><div class="space-y-1"><CellEditor :value="model.signatures.reviewer" :editable="editable" @update="updateSignature('reviewer', $event)" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-24')">配置格子</button></div></td>
        </tr>
        <tr>
          <td class="us-label">审核人/日期：</td>
          <td class="us-blank" colspan="7"><div class="space-y-1"><CellEditor :value="model.signatures.auditor" :editable="editable" @update="updateSignature('auditor', $event)" /><button v-if="editable" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCellByKey('us-25')">配置格子</button></div></td>
        </tr>
      </tbody>
    </table>
    <CellOpEditor
      v-if="drawerOpen"
      :open="drawerOpen"
      :read-only="!props.editable"
      :cell-row="activeCellRow"
      :cell-col="activeCellCol"
      :operations="cellOperations"
      @close="drawerOpen = false"
      @save="saveDrawer"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue';
import BaseCheckbox from '@/components/base/BaseCheckbox.vue';
import CellOpEditor from './CellOpEditor.vue';
import type { SequenceOperation } from '@/types/experiments';

interface BloodRow {
  id: string;
  sampleCode: string;
  sourceCode: string;
  sourceVolume: number;
  blankBloodVolume: number;
  finalVolume: number;
}

interface StabilityRow {
  id: string;
  sampleCode: string;
  stabilityCode: string;
  startTime: string;
  conditions: string[];
  endTime: string;
}

interface ModelValue {
  context: { projectCode?: string; methodVersion?: string };
  equipment: { incubatorId: string; centrifugeId: string; pipetteId: string };
  blood: {
    rows: BloodRow[];
    sourceBatch: string;
    blankBloodCode: string;
    lightConditions: string[];
    tempConditions: string[];
  };
  incubation: {
    startTime: string;
    duration: number;
    endTime: string;
    aliquotCount: number;
    containerMaterial: string;
    color: string;
  };
  stability: {
    rows: StabilityRow[];
    description: string;
    containerMaterial: string;
    color: string;
    storageCondition: string;
  };
  signatures: { operator: string; reviewer: string; auditor: string };
}

const props = withDefaults(defineProps<{ modelValue: ModelValue; editable?: boolean }>(), { editable: false });
const emit = defineEmits<{ 'update:modelValue': [value: ModelValue] }>();
const model = computed(() => props.modelValue);
const drawerOpen = ref(false);
const activeCellRow = ref<string | number>('');
const activeCellCol = ref(0);
const cellOperations = ref<SequenceOperation[]>([]);

const bloodConditionDisplay = computed(() => {
  const light = model.value.blood.lightConditions.length ? model.value.blood.lightConditions.join(' / ') : '—';
  const temp = model.value.blood.tempConditions.length ? model.value.blood.tempConditions.join(' / ') : '—';
  return `□ ${light} / □ ${temp}`;
});

const CellEditor = defineComponent({
  props: { value: { type: [String, Number], default: '' }, editable: { type: Boolean, default: false }, type: { type: String, default: 'text' } },
  emits: ['update'],
  setup(componentProps, { emit: componentEmit }) {
    return () => componentProps.editable
      ? h('input', {
          value: componentProps.value,
          type: componentProps.type === 'number' ? 'number' : 'text',
          class: 'cell-input',
          onInput: (event: Event) => componentEmit('update', (event.target as HTMLInputElement).value),
        })
      : h('span', { class: 'cell-text' }, componentProps.value ? String(componentProps.value) : '');
  },
});

function handleConfigureCellByKey(key: string) {
  activeCellRow.value = key;
  activeCellCol.value = 0;
  cellOperations.value = (props.modelValue as any).cellOperations?.[key] ?? [];
  drawerOpen.value = true;
}
function saveDrawer(ops: SequenceOperation[]) {
  const key = String(activeCellRow.value);
  emit('update:modelValue', { ...props.modelValue, cellOperations: { ...(props.modelValue as any).cellOperations ?? {}, [key]: ops } } as any);
  drawerOpen.value = false;
}
function parseNumber(value: string | number) {
  if (value === '' || value === null || value === undefined) return 0;
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
}

function displayNumber(value: number) {
  return value === 0 ? '' : String(value);
}

function patch(next: Partial<ModelValue>) {
  emit('update:modelValue', { ...props.modelValue, ...next });
}

function updateContext(key: 'projectCode' | 'methodVersion', value: string) {
  patch({ context: { ...props.modelValue.context, [key]: value } });
}
function updateEquipment(key: 'incubatorId' | 'centrifugeId' | 'pipetteId', value: string) {
  patch({ equipment: { ...props.modelValue.equipment, [key]: value } });
}
function updateBloodRow(index: number, key: keyof BloodRow, value: string | number) {
  const rows = props.modelValue.blood.rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row));
  patch({ blood: { ...props.modelValue.blood, rows } });
}
function updateBloodModel(key: 'sourceBatch' | 'blankBloodCode', value: string) {
  patch({ blood: { ...props.modelValue.blood, [key]: value } });
}
function toggleBloodLight(value: '黄光灯' | '白色荧光灯') {
  const next = new Set(props.modelValue.blood.lightConditions);
  next.has(value) ? next.delete(value) : next.add(value);
  patch({ blood: { ...props.modelValue.blood, lightConditions: Array.from(next) } });
}
function toggleBloodTemp(value: 'RT' | 'WI') {
  const next = new Set(props.modelValue.blood.tempConditions);
  next.has(value) ? next.delete(value) : next.add(value);
  patch({ blood: { ...props.modelValue.blood, tempConditions: Array.from(next) } });
}
function updateIncubation(key: 'startTime' | 'duration' | 'endTime' | 'aliquotCount' | 'containerMaterial' | 'color', value: string | number) {
  patch({ incubation: { ...props.modelValue.incubation, [key]: value } });
}
function updateStability(key: 'description' | 'containerMaterial' | 'color' | 'storageCondition', value: string) {
  patch({ stability: { ...props.modelValue.stability, [key]: value } });
}
function updateStabilityRow(index: number, key: keyof StabilityRow, value: string) {
  const rows = props.modelValue.stability.rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row));
  patch({ stability: { ...props.modelValue.stability, rows } });
}
function toggleStabLight(index: number, value: '黄光灯' | '白色荧光灯') {
  const rows = props.modelValue.stability.rows.map((row, rowIndex) => {
    if (rowIndex !== index) return row;
    const next = new Set(row.conditions);
    next.has(value) ? next.delete(value) : next.add(value);
    return { ...row, conditions: Array.from(next) };
  });
  patch({ stability: { ...props.modelValue.stability, rows } });
}
function toggleStabTemp(index: number, value: 'RT' | 'WI') {
  const rows = props.modelValue.stability.rows.map((row, rowIndex) => {
    if (rowIndex !== index) return row;
    const next = new Set(row.conditions);
    next.has(value) ? next.delete(value) : next.add(value);
    return { ...row, conditions: Array.from(next) };
  });
  patch({ stability: { ...props.modelValue.stability, rows } });
}
function updateSignature(key: 'operator' | 'reviewer' | 'auditor', value: string) {
  patch({ signatures: { ...props.modelValue.signatures, [key]: value } });
}
</script>

<style scoped>
.us-table {
  width: 100%;
  min-width: 1320px;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 13px;
  color: var(--text-main);
}

.us-col-1 { width: 13%; }
.us-col-2 { width: 12%; }
.us-col-3 { width: 14%; }
.us-col-4 { width: 14%; }
.us-col-5 { width: 13%; }
.us-col-6 { width: 12%; }
.us-col-7 { width: 11%; }
.us-col-8 { width: 11%; }

.us-title,
.us-label,
.us-blank,
.us-section,
.us-head,
.us-data {
  border: 1px solid #222;
  padding: 8px 10px;
  vertical-align: middle;
  background: #fff;
}

.us-title {
  padding: 14px 12px;
}

.us-title-wrap {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.us-title-main {
  font-size: 26px;
  font-weight: 700;
  line-height: 1.15;
}

.us-title-code {
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  padding-top: 4px;
}

.us-label,
.us-section,
.us-head {
  background: #f7f5ee;
  font-weight: 600;
}

.us-section {
  font-size: 16px;
}

.us-head {
  text-align: center;
}

.us-row {
  height: 42px;
}

.light-bg {
  background: #f3efe0;
}

.cell-input,
.cell-text {
  display: block;
  width: 100%;
  min-height: 24px;
  white-space: pre-wrap;
  word-break: break-word;
}

.cell-input {
  border: 0;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: var(--text-main);
}

.condition-line,
.choice-line,
.condition-stack {
  display: flex;
  gap: 10px;
  align-items: center;
}

.condition-line.wrap,
.choice-line.wrap {
  flex-wrap: wrap;
}

.condition-stack {
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}
</style>
