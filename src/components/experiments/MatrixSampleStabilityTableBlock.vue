<template>
  <div class="w-full overflow-x-auto">
    <table class="w-full min-w-[1100px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col class="w-[16%]" />
        <col class="w-[12%]" />
        <col class="w-[14%]" />
        <col class="w-[14%]" />
        <col class="w-[14%]" />
        <col class="w-[12%]" />
        <col class="w-[18%]" />
      </colgroup>
      <tbody>
        <tr>
          <td class="ms-title" colspan="7">
            <div class="flex items-center justify-between gap-3">
              <div class="text-[26px] font-bold">基质样品短期/长期放置稳定性考察记录表</div>
              <div class="text-[16px] font-medium">BA-SBR16 / 2V</div>
            </div>
          </td>
        </tr>
        <tr>
          <td class="ms-label" colspan="2">项目编号</td>
          <td class="ms-cell" colspan="5">
            <CellEditor :value="model.context.projectCode" :editable="editable" @update="updateContext('projectCode', $event)" />
          </td>
        </tr>
        <tr>
          <td class="ms-section" colspan="7">稳定性考察记录</td>
        </tr>
        <tr>
          <td class="ms-head text-center">考察类别</td>
          <td class="ms-head text-center">样品代码</td>
          <td class="ms-head text-center">放置条件/位置</td>
          <td class="ms-head text-center">开始放置人/日期时间</td>
          <td class="ms-head text-center">结束放置人/日期时间</td>
          <td class="ms-head text-center">考察时长<br>（短期h/长期d）</td>
          <td class="ms-head text-center">所用分析批</td>
        </tr>
        <template v-for="(row, ri) in model.rowsShort" :key="`short-${ri}`">
          <tr class="h-[42px]">
            <td class="ms-cell bg-[#f3efe0]">
              <div class="space-y-1"><CellEditor v-if="ri === 0" :value="row.category" :editable="editable" @update="updateShort(ri, 'category', $event)" /><span v-else class="text-[--muted-foreground]">—</span><button v-if="editable && ri > 0 && !row.category" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( ri, 0)"><Settings2 class="h-3.5 w-3.5" />配置格子</button><button v-if="editable && ri === 0 && !row.category" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( ri, 0)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
            </td>
            <td class="ms-cell"><div class="space-y-1"><CellEditor :value="row.sampleCode" :editable="editable" @update="updateShort(ri, 'sampleCode', $event)" /><button v-if="editable && !row.sampleCode" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( ri, 1)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div></td>
            <td class="ms-cell"><div class="space-y-1"><CellEditor :value="row.position" :editable="editable" @update="updateShort(ri, 'position', $event)" /><button v-if="editable && !row.position" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( ri, 2)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div></td>
            <td class="ms-cell"><div class="space-y-1"><CellEditor :value="row.startTime" :editable="editable" type="datetime-local" @update="updateShort(ri, 'startTime', $event)" /><button v-if="editable && !row.startTime" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( ri, 3)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div></td>
            <td class="ms-cell"><div class="space-y-1"><CellEditor :value="row.endTime" :editable="editable" type="datetime-local" @update="updateShort(ri, 'endTime', $event)" /><button v-if="editable && !row.endTime" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( ri, 4)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div></td>
            <td class="ms-cell"><div class="space-y-1"><CellEditor :value="String(row.duration)" :editable="editable" type="number" @update="updateShort(ri, 'duration', Number($event) || 0)" /><button v-if="editable && !row.duration" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( ri, 5)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div></td>
            <td class="ms-cell"><div class="space-y-1"><CellEditor :value="row.analysisBatch" :editable="editable" @update="updateShort(ri, 'analysisBatch', $event)" /><button v-if="editable && !row.analysisBatch" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( ri, 6)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div></td>
          </tr>
        </template>
        <template v-for="(row, ri) in model.rowsLong" :key="`long-${ri}`">
          <tr class="h-[42px]">
            <td class="ms-cell bg-[#f3efe0]">
              <div class="space-y-1"><CellEditor v-if="ri === 0" :value="row.category" :editable="editable" @update="updateLong(ri, 'category', $event)" /><span v-else class="text-[--muted-foreground]">—</span><button v-if="editable && ri > 0 && !row.category" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( model.rowsShort.length + ri, 0)"><Settings2 class="h-3.5 w-3.5" />配置格子</button><button v-if="editable && ri === 0 && !row.category" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( model.rowsShort.length + ri, 0)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
            </td>
            <td class="ms-cell"><div class="space-y-1"><CellEditor :value="row.sampleCode" :editable="editable" @update="updateLong(ri, 'sampleCode', $event)" /><button v-if="editable && !row.sampleCode" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( model.rowsShort.length + ri, 1)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div></td>
            <td class="ms-cell"><div class="space-y-1"><CellEditor :value="row.position" :editable="editable" @update="updateLong(ri, 'position', $event)" /><button v-if="editable && !row.position" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( model.rowsShort.length + ri, 2)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div></td>
            <td class="ms-cell"><div class="space-y-1"><CellEditor :value="row.startTime" :editable="editable" type="datetime-local" @update="updateLong(ri, 'startTime', $event)" /><button v-if="editable && !row.startTime" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( model.rowsShort.length + ri, 3)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div></td>
            <td class="ms-cell"><div class="space-y-1"><CellEditor :value="row.endTime" :editable="editable" type="datetime-local" @update="updateLong(ri, 'endTime', $event)" /><button v-if="editable && !row.endTime" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( model.rowsShort.length + ri, 4)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div></td>
            <td class="ms-cell"><div class="space-y-1"><CellEditor :value="String(row.duration)" :editable="editable" type="number" @update="updateLong(ri, 'duration', Number($event) || 0)" /><button v-if="editable && !row.duration" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( model.rowsShort.length + ri, 5)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div></td>
            <td class="ms-cell"><div class="space-y-1"><CellEditor :value="row.analysisBatch" :editable="editable" @update="updateLong(ri, 'analysisBatch', $event)" /><button v-if="editable && !row.analysisBatch" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell( model.rowsShort.length + ri, 6)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div></td>
          </tr>
        </template>
      </tbody>
    </table>

    <div v-if="editable" class="mt-3 flex gap-4">
      <button class="text-[--primary] text-sm font-medium hover:underline" @click="addShortRow">+ 短期新增一行</button>
      <button class="text-[--primary] text-sm font-medium hover:underline" @click="addLongRow">+ 长期新增一行</button>
    </div>

    <table class="mt-4 w-full min-w-[1100px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup><col class="w-[15%]"/><col class="w-[85%]"/></colgroup>
      <tbody>
        <tr><td class="ms-section" colspan="2">签字区</td></tr>
        <tr>
          <td class="ms-label">分装人 / 日期</td>
          <td class="ms-cell"><CellEditor :value="model.signatures.packager" :editable="editable" @update="updateSignature('packager', $event)" /></td>
        </tr>
        <tr>
          <td class="ms-label">审核人 / 日期</td>
          <td class="ms-cell"><CellEditor :value="model.signatures.auditor" :editable="editable" @update="updateSignature('auditor', $event)" /></td>
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
interface Row { category: string; sampleCode: string; position: string; startTime: string; endTime: string; duration: number; analysisBatch: string; }
interface ModelValue { context: { projectCode?: string }; rowsShort: Row[]; rowsLong: Row[]; signatures: { packager: string; auditor: string }; }
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
  setup(cp, { emit: ce }) {
    return () => cp.editable
      ? h('input', { value: cp.value, type: cp.type === 'datetime-local' ? 'datetime-local' : cp.type === 'number' ? 'number' : 'text', class: 'cell-input', onInput: (e: Event) => ce('update', (e.target as HTMLInputElement).value) })
      : h('span', { class: 'block min-h-6 whitespace-pre-wrap' }, cp.value || ' ');
  },
});
function patch(next: Partial<ModelValue>) { emit('update:modelValue', { ...props.modelValue, ...next }); }
function updateContext(k: keyof ModelValue['context'], v: string) { patch({ context: { ...props.modelValue.context, [k]: v } }); }
function updateSignature(k: 'packager' | 'auditor', v: string) { patch({ signatures: { ...props.modelValue.signatures, [k]: v } }); }
function updateRows(source: 'rowsShort' | 'rowsLong', index: number, key: keyof Row, value: any) {
  const rows = [...props.modelValue[source]]; rows[index] = { ...rows[index], [key]: value }; patch({ [source]: rows });
}
function updateShort(i: number, k: keyof Row, v: any) { updateRows('rowsShort', i, k, v); }
function updateLong(i: number, k: keyof Row, v: any) { updateRows('rowsLong', i, k, v); }
function newRow(cat: string): Row { return { category: cat, sampleCode: '', position: '', startTime: '', endTime: '', duration: 0, analysisBatch: '' }; }
function addShortRow() { patch({ rowsShort: [...props.modelValue.rowsShort, newRow('短期稳定性考察')] }); }
function addLongRow() { patch({ rowsLong: [...props.modelValue.rowsLong, newRow('长期稳定性考察')] }); }
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
.ms-cell, .ms-label, .ms-section, .ms-title, .ms-head { border: 1px solid #222; padding: 9px 10px; vertical-align: middle; background: #fff; }
.ms-title { text-align: center; padding: 14px 10px; }
.ms-section, .ms-label, .ms-head { font-weight: 600; background: #f7f5ee; }
.ms-section { font-size: 16px; text-align: left; }
.cell-input { width: 100%; border: 0; outline: none; background: transparent; font-size: 13px; color: var(--text-main); }
</style>
