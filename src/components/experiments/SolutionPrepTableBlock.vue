<template>
  <div class="w-full overflow-x-auto">
    <table class="w-full min-w-[1320px] border-collapse table-fixed text-sm text-[--text-main]">
      <colgroup>
        <col class="w-[22%]" />
        <col class="w-[8%]" />
        <col class="w-[8%]" />
        <col v-for="n in 7" :key="n" class="w-[9.43%]" />
      </colgroup>

      <tbody>
        <tr v-for="(row, rowIndex) in topRowsProxy" :key="`top-${rowIndex}`">
          <td class="border border-[#222] bg-white px-4 py-4 align-middle text-[26px] leading-tight font-medium" colspan="3">
            {{ topLabels[rowIndex] }}
          </td>
          <td
            v-for="(cell, cellIndex) in row"
            :key="`top-${rowIndex}-${cellIndex}`"
            class="border border-[#222] px-2 py-3 align-middle"
            :class="editable ? 'bg-white' : 'bg-[#f3efe0]'"
          >
            <div v-if="editable && !cell" class="space-y-1">
              <button type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[--primary] hover:underline" @click.stop="handleConfigureCell(rowIndex, cellIndex)"><Settings2 class="h-3.5 w-3.5" />配置格子</button>
            </div>
            <input
              v-if="editable"
              :value="cell"
              class="w-full border-0 bg-transparent p-0 text-center outline-none"
              @input="updateTopCell(rowIndex, cellIndex, ($event.target as HTMLInputElement).value)"
            />
            <span v-else class="block min-h-6 text-center">{{ cell || ' ' }}</span>
          </td>
        </tr>

        <tr>
          <td class="border border-[#222] px-3 py-4 text-center text-[24px] leading-tight font-medium bg-white">配制后溶液名<br />称/代码</td>
          <td class="border border-[#222] px-3 py-4 text-center text-[24px] leading-tight font-medium bg-white">有效期至</td>
          <td class="border border-[#222] px-3 py-4 text-center text-[24px] leading-tight font-medium bg-white">储存位置/<br />条件</td>
          <td class="border border-[#222] px-3 py-4 text-center text-[26px] font-semibold bg-white" colspan="7">NA</td>
        </tr>

        <tr v-for="(row, rowIndex) in bottomRowsProxy" :key="`bottom-${rowIndex}`" class="h-[62px]">
          <td
            v-for="(cell, cellIndex) in row"
            :key="`bottom-${rowIndex}-${cellIndex}`"
            class="border border-[#222] px-2 py-2 align-middle"
            :class="cellIndex === 0 ? 'bg-[#f3efe0]' : 'bg-white'"
          >
            <input
              v-if="editable"
              :value="cell"
              class="w-full border-0 bg-transparent p-0 text-center outline-none"
              @input="updateBottomCell(rowIndex, cellIndex, ($event.target as HTMLInputElement).value)"
            />
            <span v-else class="block min-h-6 text-center">{{ cell || ' ' }}</span>
          </td>
        </tr>
      </tbody>
    </table>
    <CellOpEditor v-if="drawerOpen" :open="drawerOpen" :read-only="!props.editable" :cell-row="activeCellRow" :cell-col="activeCellCol" :operations="cellOperations" @close="drawerOpen=false" @save="saveDrawer" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Settings2 } from 'lucide-vue-next';
import CellOpEditor from './CellOpEditor.vue';
import type { SequenceOperation } from '@/types/experiments';

const props = defineProps<{
  topRows: string[][];
  bottomRows: string[][];
  editable?: boolean;
}>();

const emit = defineEmits<{
  'update:topRows': [value: string[][]];
  'update:bottomRows': [value: string[][]];
}>();

const topLabels = [
  '所需试剂/溶液名称或代码',
  '生产厂家',
  '批号',
  '有效期至',
];

const topRowsProxy = computed(() => props.topRows);
const bottomRowsProxy = computed(() => props.bottomRows);
const drawerOpen = ref(false);
const activeCellRow = ref(0);
const activeCellCol = ref(0);
const cellOperations = ref<SequenceOperation[]>([]);

function updateTopCell(rowIndex: number, cellIndex: number, value: string) {
  const next = props.topRows.map((row, index) => index === rowIndex ? row.map((cell, idx) => (idx === cellIndex ? value : cell)) : [...row]);
  emit('update:topRows', next);
}

function updateBottomCell(rowIndex: number, cellIndex: number, value: string) {
  const next = props.bottomRows.map((row, index) => index === rowIndex ? row.map((cell, idx) => (idx === cellIndex ? value : cell)) : [...row]);
  emit('update:bottomRows', next);
}

function handleConfigureCell(rowIndex: number, colIndex: number) {
  activeCellRow.value = rowIndex;
  activeCellCol.value = colIndex;
  drawerOpen.value = true;
}
function saveDrawer(ops: SequenceOperation[]) {
  drawerOpen.value = false;
}
</script>
