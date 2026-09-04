<template>
  <div class="w-full overflow-x-auto">
    <table class="w-full min-w-[1100px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col class="w-[15%]" />
        <col class="w-[15%]" />
        <col class="w-[15%]" />
        <col class="w-[15%]" />
        <col class="w-[15%]" />
        <col class="w-[20%]" />
      </colgroup>
      <tbody>
        <tr>
          <td class="stab-title" colspan="6">
            <div class="flex items-center justify-between gap-3">
              <div class="text-[26px] font-bold">采集稳定性样品制备表</div>
              <div class="text-[16px] font-medium">BA-SBR12 / 2V</div>
            </div>
          </td>
        </tr>
        <tr>
          <td class="stab-label">项目编号</td>
          <td class="stab-cell" colspan="2">{{ model.context.projectCode || '继承自计划' }}</td>
          <td class="stab-label">方法版本号</td>
          <td class="stab-cell" colspan="2">{{ model.context.methodVersion || '继承自计划' }}</td>
        </tr>
        <tr>
          <td class="stab-label">恒温箱编号</td>
          <td class="stab-cell"><CellEditor :value="model.equipment.incubatorId" :editable="editable" @update="updateEquipment('incubatorId', $event)" /></td>
          <td class="stab-label">离心机编号</td>
          <td class="stab-cell"><CellEditor :value="model.equipment.centrifugeId" :editable="editable" @update="updateEquipment('centrifugeId', $event)" /></td>
          <td class="stab-label">移液器编号</td>
          <td class="stab-cell"><CellEditor :value="model.equipment.pipetteId" :editable="editable" @update="updateEquipment('pipetteId', $event)" /></td>
        </tr>
        <tr>
          <td class="stab-section" colspan="6">一、全血样品的配制</td>
        </tr>
        <tr>
          <td class="stab-head">样品代码</td>
          <td class="stab-head">源溶液编号</td>
          <td class="stab-head">源溶液体积(μL)</td>
          <td class="stab-head">空白全血体积(μL)</td>
          <td class="stab-head">最终样品总体积(μL)</td>
          <td class="stab-head"></td>
        </tr>
        <tr v-for="(row, rowIndex) in model.blood.rows" :key="rowIndex" class="h-[42px]">
          <td class="stab-cell bg-[#f3efe0]">
            <div class="space-y-1"><CellEditor :value="row.sampleCode" :editable="editable" @update="updateBloodRow(rowIndex, 'sampleCode', $event)" /><button v-if="editable && !row.sampleCode" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell(rowIndex, 0)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
          <td class="stab-cell">
            <div class="space-y-1"><CellEditor :value="row.sourceSolutionCode" :editable="editable" @update="updateBloodRow(rowIndex, 'sourceSolutionCode', $event)" /><button v-if="editable && !row.sourceSolutionCode" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell(rowIndex, 1)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
          <td class="stab-cell">
            <div class="space-y-1"><CellEditor :value="String(row.sourceSolutionVolume)" :editable="editable" type="number" @update="updateBloodRow(rowIndex, 'sourceSolutionVolume', Number($event) || 0)" /><button v-if="editable && !row.sourceSolutionVolume" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell(rowIndex, 2)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
          <td class="stab-cell">
            <div class="space-y-1"><CellEditor :value="String(row.blankBloodVolume)" :editable="editable" type="number" @update="updateBloodRow(rowIndex, 'blankBloodVolume', Number($event) || 0)" /><button v-if="editable && !row.blankBloodVolume" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell(rowIndex, 3)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
          <td class="stab-cell">
            <div class="space-y-1"><CellEditor :value="String(row.finalVolume)" :editable="editable" type="number" @update="updateBloodRow(rowIndex, 'finalVolume', Number($event) || 0)" /><button v-if="editable && !row.finalVolume" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell(rowIndex, 4)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
          <td class="stab-cell"></td>
        </tr>
        <tr>
          <td class="stab-label">源溶液批号</td>
          <td class="stab-cell" colspan="2"><CellEditor :value="model.blood.sourceSolutionBatch" :editable="editable" @update="updateBloodModel('sourceSolutionBatch', $event)" /></td>
          <td class="stab-label">空白全血编号</td>
          <td class="stab-cell" colspan="2"><CellEditor :value="model.blood.blankBloodCode" :editable="editable" @update="updateBloodModel('blankBloodCode', $event)" /></td>
        </tr>
        <tr>
          <td class="stab-label">配制完成时间</td>
          <td class="stab-cell" colspan="2"><CellEditor :value="model.blood.preparationTime" :editable="editable" @update="updateBloodModel('preparationTime', $event)" /></td>
          <td class="stab-label">样品配制过程在</td>
          <td class="stab-cell" colspan="2">
            <div class="flex items-center gap-4">
              <label class="inline-flex items-center gap-1">
                <BaseCheckbox :checked="model.blood.lightCondition?.includes('黄光灯')" :disabled="!editable" @update:checked="toggleLightCondition('黄光灯')" />
                <span>黄光灯</span>
              </label>
              <label class="inline-flex items-center gap-1">
                <BaseCheckbox :checked="model.blood.lightCondition?.includes('白色荧光灯')" :disabled="!editable" @update:checked="toggleLightCondition('白色荧光灯')" />
                <span>白色荧光灯</span>
              </label>
              <label class="inline-flex items-center gap-1">
                <BaseCheckbox :checked="model.blood.tempCondition?.includes('RT')" :disabled="!editable" @update:checked="toggleTempCondition('RT')" />
                <span>RT</span>
              </label>
              <label class="inline-flex items-center gap-1">
                <BaseCheckbox :checked="model.blood.tempCondition?.includes('WI')" :disabled="!editable" @update:checked="toggleTempCondition('WI')" />
                <span>WI</span>
              </label>
            </div>
          </td>
        </tr>
        <tr>
          <td class="stab-section" colspan="6">二、全血样品的孵育及分装</td>
        </tr>
        <tr>
          <td class="stab-label">放入时间</td>
          <td class="stab-cell"><CellEditor :value="model.blood.incubationStartTime" :editable="editable" @update="updateBloodModel('incubationStartTime', $event)" /></td>
          <td class="stab-label">孵育时间(min)</td>
          <td class="stab-cell"><CellEditor :value="String(model.blood.incubationDuration)" :editable="editable" type="number" @update="updateBloodModel('incubationDuration', Number($event) || 0)" /></td>
          <td class="stab-label">结束时间</td>
          <td class="stab-cell"><CellEditor :value="model.blood.incubationEndTime" :editable="editable" @update="updateBloodModel('incubationEndTime', $event)" /></td>
        </tr>
        <tr>
          <td class="stab-label">分装容器材质</td>
          <td class="stab-cell" colspan="2">
            <select v-if="editable" :value="model.blood.containerMaterial" class="cell-input" @change="updateBloodModel('containerMaterial', ($event.target as HTMLSelectElement).value)">
              <option value="玻璃">玻璃</option>
              <option value="聚丙烯">聚丙烯</option>
            </select>
            <span v-else>{{ model.blood.containerMaterial || '玻璃 / 聚丙烯' }}</span>
          </td>
          <td class="stab-label">颜色</td>
          <td class="stab-cell" colspan="2">
            <select v-if="editable" :value="model.blood.color" class="cell-input" @change="updateBloodModel('color', ($event.target as HTMLSelectElement).value)">
              <option value="透明">透明</option>
              <option value="棕色">棕色</option>
              <option value="锡箔纸包裹">锡箔纸包裹</option>
            </select>
            <span v-else>{{ model.blood.color || '透明 / 棕色 / 锡箔纸包裹' }}</span>
          </td>
        </tr>
        <tr>
          <td class="stab-section" colspan="6">三、稳定性考察样品的放置</td>
        </tr>
        <tr>
          <td class="stab-head">样品代码</td>
          <td class="stab-head">稳定性考察样品代码</td>
          <td class="stab-head">开始放置时间</td>
          <td class="stab-head">放置条件</td>
          <td class="stab-head">放置结束时间</td>
          <td class="stab-head"></td>
        </tr>
        <tr v-for="(row, rowIndex) in model.stability.rows" :key="rowIndex" class="h-[42px]">
          <td class="stab-cell bg-[#f3efe0]">
            <div class="space-y-1"><CellEditor :value="row.sampleCode" :editable="editable" @update="updateStabilityRow(rowIndex, 'sampleCode', $event)" /><button v-if="editable && !row.sampleCode" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell(rowIndex, 0)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
          <td class="stab-cell">
            <div class="space-y-1"><CellEditor :value="row.stabilitySampleCode" :editable="editable" @update="updateStabilityRow(rowIndex, 'stabilitySampleCode', $event)" /><button v-if="editable && !row.stabilitySampleCode" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell(rowIndex, 1)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
          <td class="stab-cell">
            <div class="space-y-1"><CellEditor :value="row.startTime" :editable="editable" @update="updateStabilityRow(rowIndex, 'startTime', $event)" /><button v-if="editable && !row.startTime" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell(rowIndex, 2)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
          <td class="stab-cell">
            <div class="flex flex-col gap-1 text-[11px]">
              <label class="inline-flex items-center gap-1"><BaseCheckbox :checked="row.conditions?.includes('黄光灯')" :disabled="!editable" @update:checked="toggleStabilityLight(rowIndex, '黄光灯')" /><span>黄光灯</span></label>
              <label class="inline-flex items-center gap-1"><BaseCheckbox :checked="row.conditions?.includes('白色荧光灯')" :disabled="!editable" @update:checked="toggleStabilityLight(rowIndex, '白色荧光灯')" /><span>白色荧光灯</span></label>
              <label class="inline-flex items-center gap-1"><BaseCheckbox :checked="row.conditions?.includes('RT')" :disabled="!editable" @update:checked="toggleStabilityTemp(rowIndex, 'RT')" /><span>RT</span></label>
              <label class="inline-flex items-center gap-1"><BaseCheckbox :checked="row.conditions?.includes('WI')" :disabled="!editable" @update:checked="toggleStabilityTemp(rowIndex, 'WI')" /><span>WI</span></label>
            </div>
          </td>
          <td class="stab-cell">
            <div class="space-y-1"><CellEditor :value="row.endTime" :editable="editable" @update="updateStabilityRow(rowIndex, 'endTime', $event)" /><button v-if="editable && !row.endTime" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell(rowIndex, 4)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
          <td class="stab-cell"></td>
        </tr>
        <tr>
          <td class="stab-label">离心后容器材质</td>
          <td class="stab-cell" colspan="2">
            <select v-if="editable" :value="model.stability.containerMaterial" class="cell-input" @change="updateStabilityModel('containerMaterial', ($event.target as HTMLSelectElement).value)">
              <option value="玻璃">玻璃</option>
              <option value="聚丙烯">聚丙烯</option>
            </select>
            <span v-else>{{ model.stability.containerMaterial || '玻璃 / 聚丙烯' }}</span>
          </td>
          <td class="stab-label">颜色</td>
          <td class="stab-cell" colspan="2">
            <select v-if="editable" :value="model.stability.color" class="cell-input" @change="updateStabilityModel('color', ($event.target as HTMLSelectElement).value)">
              <option value="透明">透明</option>
              <option value="棕色">棕色</option>
              <option value="锡箔纸包裹">锡箔纸包裹</option>
            </select>
            <span v-else>{{ model.stability.color || '透明 / 棕色 / 锡箔纸包裹' }}</span>
          </td>
        </tr>
        <tr>
          <td class="stab-label">储存条件</td>
          <td class="stab-cell" colspan="5"><CellEditor :value="model.stability.storageCondition" :editable="editable" @update="updateStabilityModel('storageCondition', $event)" /></td>
        </tr>
        <tr>
          <td class="stab-section" colspan="6">签字区</td>
        </tr>
        <tr>
          <td class="stab-label">操作人 / 日期</td>
          <td class="stab-cell" colspan="2"><CellEditor :value="model.signatures.operator" :editable="editable" @update="updateSignature('operator', $event)" /></td>
          <td class="stab-label">现场复核人 / 日期</td>
          <td class="stab-cell" colspan="2"><CellEditor :value="model.signatures.reviewer" :editable="editable" @update="updateSignature('reviewer', $event)" /></td>
        </tr>
        <tr>
          <td class="stab-label">审核人 / 日期</td>
          <td class="stab-cell" colspan="5"><CellEditor :value="model.signatures.auditor" :editable="editable" @update="updateSignature('auditor', $event)" /></td>
        </tr>
      </tbody>
    </table>
    <CellOpEditor v-if="drawerOpen" :open="drawerOpen" :read-only="!props.editable" :cell-row="activeCellRow" :cell-col="activeCellCol" :operations="cellOperations" @close="drawerOpen=false" @save="saveDrawer" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue';
import { Settings2 } from 'lucide-vue-next';
import BaseCheckbox from '@/components/base/BaseCheckbox.vue';
import CellOpEditor from './CellOpEditor.vue';
import type { SequenceOperation } from '@/types/experiments';

interface BloodRow {
  sampleCode: string;
  sourceSolutionCode: string;
  sourceSolutionVolume: number;
  blankBloodVolume: number;
  finalVolume: number;
}

interface StabilityRow {
  sampleCode: string;
  stabilitySampleCode: string;
  startTime: string;
  conditions: string[];
  endTime: string;
}

interface ModelValue {
  context: { projectCode: string; methodVersion: string };
  equipment: { incubatorId: string; centrifugeId: string; pipetteId: string };
  blood: {
    rows: BloodRow[];
    sourceSolutionBatch: string;
    blankBloodCode: string;
    preparationTime: string;
    lightCondition: string[];
    tempCondition: string[];
    incubationStartTime: string;
    incubationDuration: number;
    incubationEndTime: string;
    containerMaterial: string;
    color: string;
  };
  stability: {
    rows: StabilityRow[];
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
const activeCellRow = ref(0);
const activeCellCol = ref(0);
const cellOperations = ref<SequenceOperation[]>([]);

const CellEditor = defineComponent({
  props: { value: { type: [String, Number], default: '' }, editable: { type: Boolean, default: false }, type: { type: String, default: 'text' } },
  emits: ['update'],
  setup(componentProps, { emit: componentEmit }) {
    return () => componentProps.editable
      ? h('input', { value: componentProps.value, type: componentProps.type === 'number' ? 'number' : 'text', class: 'cell-input', onInput: (event: Event) => componentEmit('update', (event.target as HTMLInputElement).value) })
      : h('span', { class: 'block min-h-6 whitespace-pre-wrap' }, componentProps.value || ' ');
  },
});

function patch(next: Partial<ModelValue>) { emit('update:modelValue', { ...props.modelValue, ...next }); }
function updateEquipment(key: keyof typeof model.value.equipment, value: string) { patch({ equipment: { ...model.value.equipment, [key]: value } }); }
function updateBloodRow(rowIndex: number, key: keyof BloodRow, value: any) { const nextRows = [...model.value.blood.rows]; nextRows[rowIndex] = { ...nextRows[rowIndex], [key]: value }; patch({ blood: { ...model.value.blood, rows: nextRows } }); }
function updateBloodModel(key: keyof typeof model.value.blood, value: any) { patch({ blood: { ...model.value.blood, [key]: value } }); }
function toggleLightCondition(condition: string) { const current = [...(model.value.blood.lightCondition || [])]; const index = current.indexOf(condition); if (index >= 0) current.splice(index, 1); else current.push(condition); patch({ blood: { ...model.value.blood, lightCondition: current } }); }
function toggleTempCondition(condition: string) { const current = [...(model.value.blood.tempCondition || [])]; const index = current.indexOf(condition); if (index >= 0) current.splice(index, 1); else current.push(condition); patch({ blood: { ...model.value.blood, tempCondition: current } }); }
function updateStabilityRow(rowIndex: number, key: keyof StabilityRow, value: any) { const nextRows = [...model.value.stability.rows]; nextRows[rowIndex] = { ...nextRows[rowIndex], [key]: value }; patch({ stability: { ...model.value.stability, rows: nextRows } }); }
function toggleStabilityLight(rowIndex: number, condition: string) { const nextRows = [...model.value.stability.rows]; const current = [...(nextRows[rowIndex].conditions || [])]; const index = current.indexOf(condition); if (index >= 0) current.splice(index, 1); else current.push(condition); nextRows[rowIndex] = { ...nextRows[rowIndex], conditions: current }; patch({ stability: { ...model.value.stability, rows: nextRows } }); }
function toggleStabilityTemp(rowIndex: number, condition: string) { const nextRows = [...model.value.stability.rows]; const current = [...(nextRows[rowIndex].conditions || [])]; const index = current.indexOf(condition); if (index >= 0) current.splice(index, 1); else current.push(condition); nextRows[rowIndex] = { ...nextRows[rowIndex], conditions: current }; patch({ stability: { ...model.value.stability, rows: nextRows } }); }
function updateStabilityModel(key: keyof typeof model.value.stability, value: any) { patch({ stability: { ...model.value.stability, [key]: value } }); }
function updateSignature(key: keyof typeof model.value.signatures, value: string) { patch({ signatures: { ...model.value.signatures, [key]: value } }); }
function handleConfigureCell(rowIndex: number, colIndex: number) {
  activeCellRow.value = rowIndex;
  activeCellCol.value = colIndex;
  const key = `${rowIndex}-${colIndex}`;
  cellOperations.value = (props.modelValue as any).cellOperations?.[key] ?? [];
  drawerOpen.value = true;
}
function saveDrawer(ops: SequenceOperation[]) {
  const key = `${activeCellRow.value}-${activeCellCol.value}`;
  const next = { ...props.modelValue, cellOperations: { ...(props.modelValue as any).cellOperations ?? {}, [key]: ops } };
  emit('update:modelValue', next);
  drawerOpen.value = false;
}
</script>

<style scoped>
.stab-cell, .stab-label, .stab-section, .stab-title { border: 1px solid #222; padding: 8px 10px; vertical-align: middle; background: #fff; }
.stab-title { text-align: center; }
.stab-label, .stab-section { font-weight: 600; background: #f7f5ee; }
.stab-section { font-size: 15px; text-align: left; }
.stab-head { font-weight: 600; background: #f0ebe0; text-align: center; }
.cell-input { width: 100%; border: 0; outline: none; background: transparent; font-size: 13px; color: var(--text-main); }
</style>
