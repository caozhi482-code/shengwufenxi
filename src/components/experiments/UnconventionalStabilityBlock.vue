<template>
  <div class="w-full overflow-x-auto">
    <table class="w-full min-w-[900px] border-collapse table-fixed text-[13px] text-[--text-main]">
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
          <td class="us-title" colspan="6">
            <div class="flex items-center justify-between gap-3">
              <div class="text-[26px] font-bold">非常规项目采集稳定性样品制备表</div>
              <div class="text-[16px] font-medium">BA-SBR23 / 2V</div>
            </div>
          </td>
        </tr>
        <tr>
          <td class="us-label" colspan="2">项目编号</td>
          <td class="us-cell" colspan="2"><CellEditor :value="model.context.projectCode" :editable="editable" @update="updateContext('projectCode', $event)" /></td>
          <td class="us-label" colspan="2">方法版本号</td>
          <td class="us-cell"><CellEditor :value="model.context.methodVersion" :editable="editable" @update="updateContext('methodVersion', $event)" /></td>
        </tr>
        <tr>
          <td class="us-label" colspan="2">恒温箱编号</td>
          <td class="us-cell"><CellEditor :value="model.equipment.incubatorId" :editable="editable" @update="updateEquipment('incubatorId', $event)" /></td>
          <td class="us-label" colspan="2">离心机编号</td>
          <td class="us-cell"><CellEditor :value="model.equipment.centrifugeId" :editable="editable" @update="updateEquipment('centrifugeId', $event)" /></td>
          <td class="us-label">移液器编号</td>
          <td class="us-cell"><CellEditor :value="model.equipment.pipetteId" :editable="editable" @update="updateEquipment('pipetteId', $event)" /></td>
        </tr>

        <!-- 一、全血样品的配制 -->
        <tr><td class="us-section" colspan="8">一、全血样品的配制</td></tr>
        <tr>
          <td class="us-head text-center">样品代码</td>
          <td class="us-head text-center">源溶液编号</td>
          <td class="us-head text-center">源溶液体积(μL)</td>
          <td class="us-head text-center">空白全血体积(μL)</td>
          <td class="us-head text-center">最终样品总体积(μL)</td>
          <td class="us-head text-center" colspan="3"></td>
        </tr>
        <tr v-for="(row, i) in model.blood.rows" :key="row.id" class="h-[42px]">
          <td class="us-cell bg-[#f3efe0]"><CellEditor :value="row.sampleCode" :editable="editable" @update="updateBlood(i, 'sampleCode', $event)" /></td>
          <td class="us-cell"><CellEditor :value="row.sourceCode" :editable="editable" @update="updateBlood(i, 'sourceCode', $event)" /></td>
          <td class="us-cell"><CellEditor :value="String(row.sourceVolume)" :editable="editable" type="number" @update="updateBlood(i, 'sourceVolume', Number($event) || 0)" /></td>
          <td class="us-cell"><CellEditor :value="String(row.blankBloodVolume)" :editable="editable" type="number" @update="updateBlood(i, 'blankBloodVolume', Number($event) || 0)" /></td>
          <td class="us-cell"><CellEditor :value="String(row.finalVolume)" :editable="editable" type="number" @update="updateBlood(i, 'finalVolume', Number($event) || 0)" /></td>
          <td class="us-cell" colspan="3"></td>
        </tr>
        <tr>
          <td class="us-label">源溶液批号</td>
          <td class="us-cell" colspan="2"><CellEditor :value="model.blood.sourceBatch" :editable="editable" @update="updateBloodModel('sourceBatch', $event)" /></td>
          <td class="us-label">空白全血编号</td>
          <td class="us-cell" colspan="2"><CellEditor :value="model.blood.blankBloodCode" :editable="editable" @update="updateBloodModel('blankBloodCode', $event)" /></td>
          <td class="us-label">样品配制过程条件</td>
          <td class="us-cell">
            <div v-if="editable" class="flex items-center gap-3 flex-wrap text-[11px]">
              <label class="inline-flex items-center gap-1"><BaseCheckbox :checked="model.blood.lightConditions?.includes('黄光灯')" @update:checked="toggleBloodLight('黄光灯')" /><span>黄光灯</span></label>
              <label class="inline-flex items-center gap-1"><BaseCheckbox :checked="model.blood.lightConditions?.includes('白色荧光灯')" @update:checked="toggleBloodLight('白色荧光灯')" /><span>白色荧光灯</span></label>
              <label class="inline-flex items-center gap-1"><BaseCheckbox :checked="model.blood.tempConditions?.includes('RT')" @update:checked="toggleBloodTemp('RT')" /><span>RT</span></label>
              <label class="inline-flex items-center gap-1"><BaseCheckbox :checked="model.blood.tempConditions?.includes('WI')" @update:checked="toggleBloodTemp('WI')" /><span>WI</span></label>
            </div>
            <span v-else class="text-[11px]">{{ bloodConditionDisplay }}</span>
          </td>
        </tr>

        <!-- 二、全血样品的孵育及分装 -->
        <tr><td class="us-section" colspan="8">二、全血样品的孵育及分装</td></tr>
        <tr>
          <td class="us-label">开始孵育时间</td>
          <td class="us-cell"><CellEditor :value="model.incubation.startTime" :editable="editable" type="datetime-local" @update="updateIncubation('startTime', $event)" /></td>
          <td class="us-label">孵育时间(min)</td>
          <td class="us-cell"><CellEditor :value="String(model.incubation.duration)" :editable="editable" type="number" @update="updateIncubation('duration', Number($event) || 0)" /></td>
          <td class="us-label">结束时间</td>
          <td class="us-cell"><CellEditor :value="model.incubation.endTime" :editable="editable" type="datetime-local" @update="updateIncubation('endTime', $event)" /></td>
          <td class="us-label">分装份数</td>
          <td class="us-cell"><CellEditor :value="String(model.incubation.aliquotCount)" :editable="editable" type="number" @update="updateIncubation('aliquotCount', Number($event) || 0)" /></td>
        </tr>
        <tr>
          <td class="us-label">分装容器材质</td>
          <td class="us-cell">
            <div v-if="editable" class="flex items-center gap-3">
              <label class="inline-flex items-center gap-1"><input type="radio" value="玻璃" v-model="model.incubation.containerMaterial" @change="updateIncubation('containerMaterial', '玻璃')" /><span>玻璃</span></label>
              <label class="inline-flex items-center gap-1"><input type="radio" value="聚丙烯" v-model="model.incubation.containerMaterial" @change="updateIncubation('containerMaterial', '聚丙烯')" /><span>聚丙烯</span></label>
            </div>
            <span v-else>{{ model.incubation.containerMaterial || '—' }}</span>
          </td>
          <td class="us-label">颜色</td>
          <td class="us-cell" colspan="5">
            <div v-if="editable" class="flex items-center gap-3 flex-wrap">
              <label class="inline-flex items-center gap-1"><input type="radio" value="透明" v-model="model.incubation.color" @change="updateIncubation('color', '透明')" /><span>透明</span></label>
              <label class="inline-flex items-center gap-1"><input type="radio" value="棕色" v-model="model.incubation.color" @change="updateIncubation('color', '棕色')" /><span>棕色</span></label>
              <label class="inline-flex items-center gap-1"><input type="radio" value="锡箔纸包裹" v-model="model.incubation.color" @change="updateIncubation('color', '锡箔纸包裹')" /><span>锡箔纸包裹</span></label>
            </div>
            <span v-else>{{ model.incubation.color || '—' }}</span>
          </td>
        </tr>

        <!-- 三、稳定性考察样品的放置 -->
        <tr><td class="us-section" colspan="8">三、稳定性考察样品的放置</td></tr>
        <tr>
          <td class="us-label" colspan="2">具体过程描述</td>
          <td class="us-cell" colspan="6"><CellEditor :value="model.stability.description" :editable="editable" @update="updateStability('description', $event)" /></td>
        </tr>
        <tr>
          <td class="us-head text-center">样品代码</td>
          <td class="us-head text-center">稳定性考察样品代码</td>
          <td class="us-head text-center">开始放置时间</td>
          <td class="us-head text-center">放置条件</td>
          <td class="us-head text-center">放置结束时间</td>
          <td class="us-head text-center" colspan="3"></td>
        </tr>
        <tr v-for="(row, i) in model.stability.rows" :key="row.id" class="h-[42px]">
          <td class="us-cell bg-[#f3efe0]"><CellEditor :value="row.sampleCode" :editable="editable" @update="updateStabilityRow(i, 'sampleCode', $event)" /></td>
          <td class="us-cell"><CellEditor :value="row.stabilityCode" :editable="editable" @update="updateStabilityRow(i, 'stabilityCode', $event)" /></td>
          <td class="us-cell"><CellEditor :value="row.startTime" :editable="editable" type="datetime-local" @update="updateStabilityRow(i, 'startTime', $event)" /></td>
          <td class="us-cell">
            <div v-if="editable" class="flex flex-col gap-1 text-[11px]">
              <label class="inline-flex items-center gap-1"><BaseCheckbox :checked="row.conditions?.includes('黄光灯')" @update:checked="toggleStabLight(i, '黄光灯')" /><span>黄光灯</span></label>
              <label class="inline-flex items-center gap-1"><BaseCheckbox :checked="row.conditions?.includes('白色荧光灯')" @update:checked="toggleStabLight(i, '白色荧光灯')" /><span>白色荧光灯</span></label>
              <label class="inline-flex items-center gap-1"><BaseCheckbox :checked="row.conditions?.includes('RT')" @update:checked="toggleStabTemp(i, 'RT')" /><span>RT</span></label>
              <label class="inline-flex items-center gap-1"><BaseCheckbox :checked="row.conditions?.includes('WI')" @update:checked="toggleStabTemp(i, 'WI')" /><span>WI</span></label>
            </div>
            <span v-else class="text-[11px]">{{ row.conditions?.join(' / ') || '—' }}</span>
          </td>
          <td class="us-cell"><CellEditor :value="row.endTime" :editable="editable" type="datetime-local" @update="updateStabilityRow(i, 'endTime', $event)" /></td>
          <td class="us-cell" colspan="3"></td>
        </tr>
        <tr>
          <td class="us-label">离心后容器材质</td>
          <td class="us-cell">
            <div v-if="editable" class="flex items-center gap-3">
              <label class="inline-flex items-center gap-1"><input type="radio" value="玻璃" v-model="model.stability.containerMaterial" @change="updateStability('containerMaterial', '玻璃')" /><span>玻璃</span></label>
              <label class="inline-flex items-center gap-1"><input type="radio" value="聚丙烯" v-model="model.stability.containerMaterial" @change="updateStability('containerMaterial', '聚丙烯')" /><span>聚丙烯</span></label>
            </div>
            <span v-else>{{ model.stability.containerMaterial || '—' }}</span>
          </td>
          <td class="us-label">颜色</td>
          <td class="us-cell">
            <div v-if="editable" class="flex items-center gap-3 flex-wrap">
              <label class="inline-flex items-center gap-1"><input type="radio" value="透明" v-model="model.stability.color" @change="updateStability('color', '透明')" /><span>透明</span></label>
              <label class="inline-flex items-center gap-1"><input type="radio" value="棕色" v-model="model.stability.color" @change="updateStability('color', '棕色')" /><span>棕色</span></label>
              <label class="inline-flex items-center gap-1"><input type="radio" value="锡箔纸包裹" v-model="model.stability.color" @change="updateStability('color', '锡箔纸包裹')" /><span>锡箔纸包裹</span></label>
            </div>
            <span v-else>{{ model.stability.color || '—' }}</span>
          </td>
          <td class="us-label">储存条件</td>
          <td class="us-cell" colspan="3"><CellEditor :value="model.stability.storageCondition" :editable="editable" @update="updateStability('storageCondition', $event)" /></td>
        </tr>
      </tbody>
    </table>

    <div v-if="editable" class="mt-3 flex gap-4">
      <button class="text-[--primary] text-sm font-medium hover:underline" @click="addBloodRow">+ 新增全血配制记录</button>
      <button class="text-[--primary] text-sm font-medium hover:underline" @click="addStabRow">+ 新增稳定性考察记录</button>
    </div>

    <table class="mt-4 w-full min-w-[900px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup><col class="w-[15%]"/><col class="w-[85%]"/></colgroup>
      <tbody>
        <tr><td class="us-section" colspan="2">签字区</td></tr>
        <tr><td class="us-label">操作人 / 日期</td><td class="us-cell"><CellEditor :value="model.signatures.operator" :editable="editable" @update="updateSignature('operator', $event)" /></td></tr>
        <tr><td class="us-label">现场复核人 / 日期</td><td class="us-cell"><CellEditor :value="model.signatures.reviewer" :editable="editable" @update="updateSignature('reviewer', $event)" /></td></tr>
        <tr><td class="us-label">审核人 / 日期</td><td class="us-cell"><CellEditor :value="model.signatures.auditor" :editable="editable" @update="updateSignature('auditor', $event)" /></td></tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue';
import BaseCheckbox from '@/components/base/BaseCheckbox.vue';
interface BloodRow { id: string; sampleCode: string; sourceCode: string; sourceVolume: number; blankBloodVolume: number; finalVolume: number; }
interface StabilityRow { id: string; sampleCode: string; stabilityCode: string; startTime: string; conditions: string[]; endTime: string; }
interface ModelValue {
  context: { projectCode?: string; methodVersion?: string };
  equipment: { incubatorId: string; centrifugeId: string; pipetteId: string };
  blood: { rows: BloodRow[]; sourceBatch: string; blankBloodCode: string; lightConditions: string[]; tempConditions: string[] };
  incubation: { startTime: string; duration: number; endTime: string; aliquotCount: number; containerMaterial: string; color: string };
  stability: { rows: StabilityRow[]; description: string; containerMaterial: string; color: string; storageCondition: string };
  signatures: { operator: string; reviewer: string; auditor: string };
}
const props = withDefaults(defineProps<{ modelValue: ModelValue; editable?: boolean }>(), { editable: false });
const emit = defineEmits<{ 'update:modelValue': [value: ModelValue] }>();
const model = computed(() => props.modelValue);
const bloodConditionDisplay = computed(() => {
  const parts: string[] = [];
  if (props.modelValue.blood.lightConditions?.length) parts.push(props.modelValue.blood.lightConditions.join('/'));
  if (props.modelValue.blood.tempConditions?.length) parts.push(props.modelValue.blood.tempConditions.join('/'));
  return parts.join(' / ') || '—';
});
const CellEditor = defineComponent({
  props: { value: { type: [String, Number], default: '' }, editable: { type: Boolean, default: false }, type: { type: String, default: 'text' } },
  emits: ['update'],
  setup(cp, { emit: ce }) {
    return () => cp.editable
      ? h('input', { value: cp.value, type: cp.type === 'number' ? 'number' : cp.type === 'datetime-local' ? 'datetime-local' : 'text', class: 'cell-input', onInput: (e: Event) => ce('update', (e.target as HTMLInputElement).value) })
      : h('span', { class: 'block min-h-6 whitespace-pre-wrap' }, cp.value || ' ');
  },
});
function patch(next: Partial<ModelValue>) { emit('update:modelValue', { ...props.modelValue, ...next }); }
function updateContext(k: string, v: string) { patch({ context: { ...props.modelValue.context, [k]: v } }); }
function updateEquipment(k: string, v: string) { patch({ equipment: { ...props.modelValue.equipment, [k]: v } }); }
function updateBlood(i: number, k: keyof BloodRow, v: any) {
  const rows = [...props.modelValue.blood.rows]; rows[i] = { ...rows[i], [k]: v }; patch({ blood: { ...props.modelValue.blood, rows } });
}
function updateBloodModel(k: string, v: any) { patch({ blood: { ...props.modelValue.blood, [k]: v } }); }
function toggleBloodLight(c: string) { const cur = [...(props.modelValue.blood.lightConditions || [])]; const i = cur.indexOf(c); i >= 0 ? cur.splice(i, 1) : cur.push(c); patch({ blood: { ...props.modelValue.blood, lightConditions: cur } }); }
function toggleBloodTemp(c: string) { const cur = [...(props.modelValue.blood.tempConditions || [])]; const i = cur.indexOf(c); i >= 0 ? cur.splice(i, 1) : cur.push(c); patch({ blood: { ...props.modelValue.blood, tempConditions: cur } }); }
function updateIncubation(k: string, v: any) { patch({ incubation: { ...props.modelValue.incubation, [k]: v } }); }
function updateStability(k: string, v: any) { patch({ stability: { ...props.modelValue.stability, [k]: v } }); }
function updateStabilityRow(i: number, k: keyof StabilityRow, v: any) {
  const rows = [...props.modelValue.stability.rows]; rows[i] = { ...rows[i], [k]: v }; patch({ stability: { ...props.modelValue.stability, rows } });
}
function toggleStabLight(i: number, c: string) {
  const rows = [...props.modelValue.stability.rows]; const cur = [...(rows[i].conditions || [])]; const idx = cur.indexOf(c); idx >= 0 ? cur.splice(idx, 1) : cur.push(c); rows[i] = { ...rows[i], conditions: cur }; patch({ stability: { ...props.modelValue.stability, rows } });
}
function toggleStabTemp(i: number, c: string) {
  const rows = [...props.modelValue.stability.rows]; const cur = [...(rows[i].conditions || [])]; const idx = cur.indexOf(c); idx >= 0 ? cur.splice(idx, 1) : cur.push(c); rows[i] = { ...rows[i], conditions: cur }; patch({ stability: { ...props.modelValue.stability, rows } });
}
function updateSignature(k: string, v: string) { patch({ signatures: { ...props.modelValue.signatures, [k]: v } }); }
function newBloodRow(): BloodRow { return { id: `bx-${Date.now()}`, sampleCode: '', sourceCode: '', sourceVolume: 0, blankBloodVolume: 0, finalVolume: 0 }; }
function newStabRow(): StabilityRow { return { id: `st-${Date.now()}`, sampleCode: '', stabilityCode: '', startTime: '', conditions: [], endTime: '' }; }
function addBloodRow() { patch({ blood: { ...props.modelValue.blood, rows: [...props.modelValue.blood.rows, newBloodRow()] } }); }
function addStabRow() { patch({ stability: { ...props.modelValue.stability, rows: [...props.modelValue.stability.rows, newStabRow()] } }); }
</script>
<style scoped>
.us-cell, .us-label, .us-section, .us-title, .us-head { border: 1px solid #222; padding: 9px 10px; vertical-align: middle; background: #fff; }
.us-title { text-align: center; padding: 14px 10px; }
.us-section, .us-label, .us-head { font-weight: 600; background: #f7f5ee; }
.us-section { font-size: 16px; text-align: left; }
.cell-input { width: 100%; border: 0; outline: none; background: transparent; font-size: 13px; color: var(--text-main); }
</style>
