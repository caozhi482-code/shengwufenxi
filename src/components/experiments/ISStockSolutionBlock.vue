<template>
  <div class="w-full overflow-x-auto">
    <table class="w-full min-w-[900px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col class="w-[14%]" />
        <col class="w-[14%]" />
        <col class="w-[14%]" />
        <col class="w-[14%]" />
        <col class="w-[14%]" />
        <col class="w-[14%]" />
        <col class="w-[16%]" />
      </colgroup>
      <tbody>
        <tr>
          <td class="is-title" colspan="7">
            <div class="flex items-center justify-between gap-3">
              <div class="text-[26px] font-bold">分装的内标储备液配制记录表</div>
              <div class="text-[16px] font-medium">BA-SBR20 / 2V</div>
            </div>
          </td>
        </tr>
        <tr>
          <td class="is-label" colspan="2">项目编号</td>
          <td class="is-cell" colspan="2"><CellEditor :value="model.context.projectCode" :editable="editable" @update="updateContext('projectCode', $event)" /></td>
          <td class="is-label" colspan="2">方法版本号</td>
          <td class="is-cell"><CellEditor :value="model.context.methodVersion" :editable="editable" @update="updateContext('methodVersion', $event)" /></td>
        </tr>
        <tr>
          <td class="is-label" colspan="2">内标名称</td>
          <td class="is-cell" colspan="2"><CellEditor :value="model.context.isName" :editable="editable" @update="updateContext('isName', $event)" /></td>
          <td class="is-label" colspan="2">内标编号（分装后）</td>
          <td class="is-cell"><CellEditor :value="model.context.isCode" :editable="editable" @update="updateContext('isCode', $event)" /></td>
        </tr>
        <tr>
          <td class="is-label" colspan="2">内标有效期至</td>
          <td class="is-cell"><CellEditor :value="model.context.isExpiry" :editable="editable" @update="updateContext('isExpiry', $event)" /></td>
          <td class="is-label">移液器编号</td>
          <td class="is-cell" colspan="3"><CellEditor :value="model.context.pipetteNo" :editable="editable" @update="updateContext('pipetteNo', $event)" /></td>
        </tr>
        <tr>
          <td class="is-label" colspan="2">内标每支质量</td>
          <td class="is-cell"><CellEditor :value="model.context.isMass" :editable="editable" @update="updateContext('isMass', $event)" /></td>
          <td class="is-label">所用内标支数</td>
          <td class="is-cell"><CellEditor :value="String(model.context.isCount)" :editable="editable" type="number" @update="updateContext('isCount', Number($event) || 0)" /></td>
          <td class="is-label">溶媒总体积</td>
          <td class="is-cell"><CellEditor :value="model.context.totalVolume" :editable="editable" @update="updateContext('totalVolume', $event)" /></td>
        </tr>
        <tr>
          <td class="is-section" colspan="7">储备液配制</td>
        </tr>
        <tr>
          <td class="is-label">储备液编号</td>
          <td class="is-cell" colspan="2">
            <div class="space-y-1"><CellEditor :value="model.rows[0]?.stockCode" :editable="editable" @update="updateRow(0, 'stockCode', $event)" /><button v-if="editable && !model.rows[0]?.stockCode" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell(0, 0)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
          <td class="is-label">储备液浓度</td>
          <td class="is-cell" colspan="2">
            <div class="space-y-1"><CellEditor :value="model.rows[0]?.concentration" :editable="editable" @update="updateRow(0, 'concentration', $event)" /><button v-if="editable && !model.rows[0]?.concentration" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell(0, 1)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
          <td class="is-label">计算过程</td>
          <td class="is-cell" colspan="2">
            <div class="space-y-1"><CellEditor :value="model.rows[0]?.calculation" :editable="editable" @update="updateRow(0, 'calculation', $event)" /><button v-if="editable && !model.rows[0]?.calculation" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell(0, 2)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
        </tr>
        <tr>
          <td class="is-section" colspan="9">配制过程</td>
        </tr>
        <tr>
          <td class="is-label" colspan="2">首次加入溶媒</td>
          <td class="is-cell" colspan="2"><CellEditor :value="model.process.firstAddition" :editable="editable" @update="updateProcess('firstAddition', $event)" /></td>
          <td class="is-label">振荡溶解</td>
          <td class="is-cell" colspan="2">
            <div v-if="editable"><label class="inline-flex items-center gap-1"><BaseCheckbox :checked="model.process.shake" @update:checked="updateProcess('shake', !model.process.shake)" /><span>是</span></label></div>
            <span v-else>{{ model.process.shake ? '是' : '否' }}</span>
          </td>
          <td class="is-label">转移至容器</td>
          <td class="is-cell" colspan="2"><CellEditor :value="model.process.transferVolume" :editable="editable" @update="updateProcess('transferVolume', $event)" /></td>
        </tr>
        <tr>
          <td class="is-label">润洗次数</td>
          <td class="is-cell"><CellEditor :value="String(model.process.rinseCount)" :editable="editable" type="number" @update="updateProcess('rinseCount', Number($event) || 0)" /></td>
          <td class="is-label">最后加入溶媒</td>
          <td class="is-cell" colspan="2"><CellEditor :value="model.process.finalAddition" :editable="editable" @update="updateProcess('finalAddition', $event)" /></td>
          <td class="is-label">混匀</td>
          <td class="is-cell" colspan="4">
            <div v-if="editable"><label class="inline-flex items-center gap-1"><BaseCheckbox :checked="model.process.mix" @update:checked="updateProcess('mix', !model.process.mix)" /><span>是</span></label></div>
            <span v-else>{{ model.process.mix ? '是' : '否' }}</span>
          </td>
        </tr>
        <tr>
          <td class="is-label">配制完成时间</td>
          <td class="is-cell" colspan="2"><CellEditor :value="model.process.completedAt" :editable="editable" type="datetime-local" @update="updateProcess('completedAt', $event)" /></td>
          <td class="is-label">溶媒信息</td>
          <td class="is-cell" colspan="5"><CellEditor :value="model.process.solventInfo" :editable="editable" @update="updateProcess('solventInfo', $event)" /></td>
        </tr>
        <tr>
          <td class="is-section" colspan="9">容器与储存信息</td>
        </tr>
        <tr>
          <td class="is-label">储备液容器材质</td>
          <td class="is-cell" colspan="2">
            <div v-if="editable" class="flex items-center gap-3">
              <label class="inline-flex items-center gap-1"><input type="radio" value="玻璃" v-model="model.storage.containerMaterial" @change="updateStorage('containerMaterial', '玻璃')" /><span>玻璃</span></label>
              <label class="inline-flex items-center gap-1"><input type="radio" value="聚丙烯" v-model="model.storage.containerMaterial" @change="updateStorage('containerMaterial', '聚丙烯')" /><span>聚丙烯</span></label>
            </div>
            <span v-else>{{ model.storage.containerMaterial || '—' }}</span>
          </td>
          <td class="is-label">颜色</td>
          <td class="is-cell" colspan="2">
            <div v-if="editable" class="flex items-center gap-3 flex-wrap">
              <label class="inline-flex items-center gap-1"><input type="radio" value="透明" v-model="model.storage.color" @change="updateStorage('color', '透明')" /><span>透明</span></label>
              <label class="inline-flex items-center gap-1"><input type="radio" value="棕色" v-model="model.storage.color" @change="updateStorage('color', '棕色')" /><span>棕色</span></label>
              <label class="inline-flex items-center gap-1"><input type="radio" value="锡箔纸包裹" v-model="model.storage.color" @change="updateStorage('color', '锡箔纸包裹')" /><span>锡箔纸包裹</span></label>
            </div>
            <span v-else>{{ model.storage.color || '—' }}</span>
          </td>
          <td class="is-label">配制光照条件</td>
          <td class="is-cell" colspan="2">
            <div v-if="editable" class="flex items-center gap-3 flex-wrap">
              <label class="inline-flex items-center gap-1"><BaseCheckbox :checked="model.storage.lightConditions?.includes('黄光灯')" @update:checked="toggleLight('黄光灯')" /><span>黄光灯</span></label>
              <label class="inline-flex items-center gap-1"><BaseCheckbox :checked="model.storage.lightConditions?.includes('白色荧光灯')" @update:checked="toggleLight('白色荧光灯')" /><span>白色荧光灯</span></label>
            </div>
            <span v-else>{{ model.storage.lightConditions?.join(' / ') || '—' }}</span>
          </td>
        </tr>
        <tr>
          <td class="is-label">溶液处理方式</td>
          <td class="is-cell" colspan="4">
            <div v-if="editable" class="flex items-center gap-3 flex-wrap">
              <label class="inline-flex items-center gap-1"><input type="radio" value="DAU" v-model="model.storage.disposalMethod" @change="updateStorage('disposalMethod', 'DAU')" /><span>DAU</span></label>
              <label class="inline-flex items-center gap-1"><input type="radio" value="store" v-model="model.storage.disposalMethod" @change="updateStorage('disposalMethod', 'store')" /><span>储存</span></label>
              <template v-if="model.storage.disposalMethod === 'store'">
                <span>的冰箱编号：</span>
                <CellEditor :value="model.storage.fridgeNo" :editable="editable" @update="updateStorage('fridgeNo', $event)" />
              </template>
            </div>
            <span v-else>{{ model.storage.disposalMethod === 'store' ? `储存的冰箱编号：${model.storage.fridgeNo || '—'}` : (model.storage.disposalMethod || '—') }}</span>
          </td>
          <td class="is-label">该批溶液批号</td>
          <td class="is-cell" colspan="3"><CellEditor :value="model.storage.batchLabel" :editable="editable" @update="updateStorage('batchLabel', $event)" /></td>
        </tr>
        <tr>
          <td class="is-section" colspan="9">签字区</td>
        </tr>
        <tr>
          <td class="is-label">操作人 / 日期</td>
          <td class="is-cell" colspan="2"><CellEditor :value="model.signatures.operator" :editable="editable" @update="updateSignature('operator', $event)" /></td>
          <td class="is-label">现场复核人 / 日期</td>
          <td class="is-cell" colspan="2"><CellEditor :value="model.signatures.reviewer" :editable="editable" @update="updateSignature('reviewer', $event)" /></td>
          <td class="is-label">审核人 / 日期</td>
          <td class="is-cell" colspan="2"><CellEditor :value="model.signatures.auditor" :editable="editable" @update="updateSignature('auditor', $event)" /></td>
        </tr>
      </tbody>
    </table>
    <CellOpEditor v-if="drawerOpen" :open="drawerOpen" :read-only="!props.editable" :cell-row="activeCellRow" :cell-col="activeCellCol" :operations="cellOperations" @close="drawerOpen=false" @save="saveDrawer" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue';
import { Settings2 } from 'lucide-vue-next';
import CellOpEditor from './CellOpEditor.vue';
import type { SequenceOperation } from '@/types/experiments';
import BaseCheckbox from '@/components/base/BaseCheckbox.vue';
interface ModelValue {
  context: { projectCode?: string; methodVersion?: string; isName?: string; isCode?: string; isExpiry?: string; pipetteNo?: string; isMass?: string; isCount: number; totalVolume?: string };
  rows: { stockCode: string; concentration: string; calculation: string }[];
  process: { firstAddition: string; shake: boolean; transferVolume: string; rinseCount: number; finalAddition: string; mix: boolean; completedAt: string; solventInfo: string };
  storage: { containerMaterial: string; color: string; lightConditions: string[]; disposalMethod: string; fridgeNo: string; batchLabel: string };
  signatures: { operator: string; reviewer: string; auditor: string };
}
const props = withDefaults(defineProps<{ modelValue: ModelValue; editable?: boolean }>(), { editable: false });
const emit = defineEmits<{ 'update:modelValue': [value: ModelValue]; }>();
const model = computed(() => props.modelValue);
const drawerOpen = ref(false);
const activeCellRow = ref(0);
const activeCellCol = ref(0);
const cellOperations = ref<SequenceOperation[]>([]);
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
function updateContext(k: string, v: any) { patch({ context: { ...props.modelValue.context, [k]: v } }); }
function updateRow(i: number, k: string, v: any) { const rows = [...props.modelValue.rows]; rows[i] = { ...rows[i], [k]: v }; patch({ rows }); }
function updateProcess(k: string, v: any) { patch({ process: { ...props.modelValue.process, [k]: v } }); }
function updateStorage(k: string, v: any) { patch({ storage: { ...props.modelValue.storage, [k]: v } }); }
function updateSignature(k: string, v: string) { patch({ signatures: { ...props.modelValue.signatures, [k]: v } }); }
function toggleLight(condition: string) {
  const current = [...(props.modelValue.storage.lightConditions || [])];
  const i = current.indexOf(condition);
  if (i >= 0) current.splice(i, 1); else current.push(condition);
  patch({ storage: { ...props.modelValue.storage, lightConditions: current } });
}
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
.is-cell, .is-label, .is-section, .is-title { border: 1px solid #222; padding: 9px 10px; vertical-align: middle; background: #fff; }
.is-title { text-align: center; padding: 14px 10px; }
.is-section, .is-label { font-weight: 600; background: #f7f5ee; }
.is-section { font-size: 16px; text-align: left; }
.cell-input { width: 100%; border: 0; outline: none; background: transparent; font-size: 13px; color: var(--text-main); }
</style>
