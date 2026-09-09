<template>
  <div class="w-full overflow-x-auto">
    <table class="w-full min-w-[1200px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col class="w-[10%]" />
        <col class="w-[10%]" />
        <col class="w-[10%]" />
        <col class="w-[10%]" />
        <col class="w-[10%]" />
        <col class="w-[10%]" />
        <col class="w-[10%]" />
        <col class="w-[10%]" />
        <col class="w-[10%]" />
        <col class="w-[10%]" />
      </colgroup>
      <tbody>
        <tr>
          <td class="sr-title" colspan="10">
            <div class="flex items-center justify-between gap-3">
              <div class="text-[26px] font-bold">样品重分析汇总表（单份复测）</div>
              <div class="text-[16px] font-medium">BA-SBR22 / 1V</div>
            </div>
          </td>
        </tr>
        <tr>
          <td class="sr-label" colspan="2">项目编号</td>
          <td class="sr-cell" colspan="2"><CellEditor :value="model.context.projectCode" :editable="editable" @update="updateContext('projectCode', $event)" /></td>
          <td class="sr-label" colspan="2">分析物名称</td>
          <td class="sr-cell" colspan="2"><CellEditor :value="model.context.analyteName" :editable="editable" @update="updateContext('analyteName', $event)" /></td>
          <td class="sr-label" colspan="2">线性范围</td>
          <td class="sr-cell" colspan="2"><CellEditor :value="model.context.linearRange" :editable="editable" @update="updateContext('linearRange', $event)" /></td>
        </tr>
        <tr>
          <td class="sr-section" colspan="12">重分析明细</td>
        </tr>
        <tr>
          <td class="sr-head text-center" colspan="2">样品编号</td>
          <td class="sr-head text-center" colspan="2">初次分析浓度结果(ng/mL)</td>
          <td class="sr-head text-center" colspan="2">初次分析批次编号</td>
          <td class="sr-head text-center" colspan="2">重分析理由</td>
          <td class="sr-head text-center" colspan="2">重分析处理结果(ng/mL)</td>
          <td class="sr-head text-center" colspan="2">重分析批次</td>
        </tr>
        <tr v-for="(row, i) in model.rows" :key="row.id" class="h-[42px]">
          <td class="sr-cell bg-[#f3efe0]" colspan="2">
            <div class="space-y-1"><CellEditor :value="row.sampleId" :editable="editable" @update="updateRow(i, 'sampleId', $event)" /><button v-if="editable && !row.sampleId" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell(i, 0)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
          <td class="sr-cell" colspan="2">
            <div class="space-y-1"><CellEditor :value="row.initialResult" :editable="editable" @update="updateRow(i, 'initialResult', $event)" /><button v-if="editable && !row.initialResult" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell(i, 1)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
          <td class="sr-cell" colspan="2">
            <div class="space-y-1"><CellEditor :value="row.initialBatch" :editable="editable" @update="updateRow(i, 'initialBatch', $event)" /><button v-if="editable && !row.initialBatch" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell(i, 2)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
          <td class="sr-cell" colspan="2">
            <div class="space-y-1"><CellEditor :value="row.reason" :editable="editable" @update="updateRow(i, 'reason', $event)" /><button v-if="editable && !row.reason" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell(i, 3)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
          <td class="sr-cell" colspan="2">
            <div class="space-y-1"><CellEditor :value="row.reResult" :editable="editable" @update="updateRow(i, 'reResult', $event)" /><button v-if="editable && !row.reResult" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell(i, 4)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
          <td class="sr-cell" colspan="2">
            <div class="space-y-1"><CellEditor :value="row.reBatch" :editable="editable" @update="updateRow(i, 'reBatch', $event)" /><button v-if="editable && !row.reBatch" type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell(i, 5)"><Settings2 class="h-3.5 w-3.5" />配置格子</button></div>
          </td>
        </tr>
        <tr v-if="model.rows.length === 0">
          <td class="sr-cell text-center text-[--muted-foreground]" colspan="12">暂无记录</td>
        </tr>
        <tr>
          <td class="sr-label" colspan="12" style="font-size:11px; font-weight:normal; background:#fffdf6;">
            注：1. 重分析理由和报告值理由参见SOP &nbsp; 2. 重分析理由和上报该浓度值理由若过长可用代号指代，但需在下方指代清楚
          </td>
        </tr>
        <tr>
          <td class="sr-section" colspan="12">签字区</td>
        </tr>
        <tr>
          <td class="sr-label" colspan="3">总结者 / 日期</td>
          <td class="sr-cell" colspan="3"><CellEditor :value="model.signatures.summarizer" :editable="editable" @update="updateSignature('summarizer', $event)" /></td>
          <td class="sr-label" colspan="3">项目负责人 / 日期</td>
          <td class="sr-cell" colspan="3"><CellEditor :value="model.signatures.lead" :editable="editable" @update="updateSignature('lead', $event)" /></td>
        </tr>
        <tr>
          <td class="sr-label" colspan="3">QC / 日期</td>
          <td class="sr-cell" colspan="9"><CellEditor :value="model.signatures.qc" :editable="editable" @update="updateSignature('qc', $event)" /></td>
        </tr>
      </tbody>
    </table>

    <div v-if="editable" class="mt-3">
      <button class="text-[--primary] text-sm font-medium hover:underline" @click="addRow">+ 新增重分析记录</button>
    </div>
    <CellOpEditor v-if="drawerOpen" :open="drawerOpen" :read-only="!props.editable" :cell-row="activeCellRow" :cell-col="activeCellCol" :operations="cellOperations" @close="drawerOpen=false" @save="saveDrawer" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue';
import { Settings2 } from 'lucide-vue-next';
import CellOpEditor from './CellOpEditor.vue';
import type { SequenceOperation } from '@/types/experiments';
interface Row { id: string; sampleId: string; initialResult: string; initialBatch: string; reason: string; reResult: string; reBatch: string; }
interface ModelValue { context: { projectCode?: string; analyteName?: string; linearRange?: string }; rows: Row[]; signatures: { summarizer: string; lead: string; qc: string }; }
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
      ? h('input', { value: cp.value, type: cp.type === 'number' ? 'number' : 'text', class: 'cell-input', onInput: (e: Event) => ce('update', (e.target as HTMLInputElement).value) })
      : h('span', { class: 'block min-h-6 whitespace-pre-wrap' }, cp.value || ' ');
  },
});
function patch(next: Partial<ModelValue>) { emit('update:modelValue', { ...props.modelValue, ...next }); }
function updateContext(k: string, v: string) { patch({ context: { ...props.modelValue.context, [k]: v } }); }
function updateSignature(k: string, v: string) { patch({ signatures: { ...props.modelValue.signatures, [k]: v } }); }
function updateRow(i: number, k: keyof Row, v: any) { const rows = [...props.modelValue.rows]; rows[i] = { ...rows[i], [k]: v }; patch({ rows }); }
function addRow() { patch({ rows: [...props.modelValue.rows, { id: `sr-${Date.now()}`, sampleId: '', initialResult: '', initialBatch: '', reason: '', reResult: '', reBatch: '' }] }); }

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
.sr-cell, .sr-label, .sr-section, .sr-title, .sr-head { border: 1px solid #222; padding: 9px 10px; vertical-align: middle; background: #fff; }
.sr-title { text-align: center; padding: 14px 10px; }
.sr-section, .sr-label, .sr-head { font-weight: 600; background: #f7f5ee; }
.sr-section { font-size: 16px; text-align: left; }
.cell-input { width: 100%; border: 0; outline: none; background: transparent; font-size: 13px; color: var(--text-main); }
</style>
