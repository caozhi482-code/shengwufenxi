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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

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

function updateTopCell(rowIndex: number, cellIndex: number, value: string) {
  const next = props.topRows.map((row, index) => index === rowIndex ? row.map((cell, idx) => (idx === cellIndex ? value : cell)) : [...row]);
  emit('update:topRows', next);
}

function updateBottomCell(rowIndex: number, cellIndex: number, value: string) {
  const next = props.bottomRows.map((row, index) => index === rowIndex ? row.map((cell, idx) => (idx === cellIndex ? value : cell)) : [...row]);
  emit('update:bottomRows', next);
}
</script>
