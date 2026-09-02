<template>
  <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] overflow-hidden">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-[--border] bg-[--surface-muted]">
          <th v-if="showCheckbox" class="w-10 px-4 py-3 text-center">
            <input type="checkbox" :checked="allSelected" @change="$emit('toggle-all', ($event.target as HTMLInputElement).checked)" />
          </th>
          <th v-for="col in columns" :key="col.key"
            class="px-4 py-3 text-left text-xs font-semibold text-[--muted-foreground] uppercase tracking-wide cursor-pointer select-none whitespace-nowrap"
            @click="col.sortable && $emit('sort', col.key)">
            <span class="inline-flex items-center gap-1">
              {{ col.label }}
              <span v-if="col.sortable" class="text-[--text-tertiary]">↕</span>
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading" class="border-b border-[--border]">
          <td :colspan="colspan" class="px-4 py-12 text-center text-[--muted-foreground]">
            <span class="inline-block animate-pulse">加载中...</span>
          </td>
        </tr>
        <tr v-else-if="!data.length" class="border-b border-[--border]">
          <td :colspan="colspan" class="px-4 py-12 text-center text-[--muted-foreground]">
            <div class="text-3xl mb-2">📭</div>
            <div>暂无数据</div>
          </td>
        </tr>
        <tr v-for="(row, ri) in data" :key="row.id || ri"
          :class="['border-b border-[--border] transition-colors cursor-pointer', selectedRows?.includes(row.id) ? 'bg-[--primary-soft]' : 'hover:bg-[--surface-muted]']"
          @click="$emit('row-click', row)">
          <td v-if="showCheckbox" class="px-4 py-3 text-center">
            <input type="checkbox" :checked="selectedRows?.includes(row.id)" @change.stop="$emit('select-row', row.id)" />
          </td>
          <td v-for="col in columns" :key="col.key" class="px-4 py-3 text-[--text-main]">
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="pagination && data.length > 0" class="flex items-center justify-between px-4 py-3 border-t border-[--border]">
      <span class="text-xs text-[--muted-foreground]">共 {{ pagination.total }} 条</span>
      <div class="flex items-center gap-1">
        <button :disabled="pagination.page <= 1" class="px-2 py-1 rounded text-xs border border-[--border] disabled:opacity-40" @click="$emit('page-change', pagination.page - 1)">上一页</button>
        <button v-for="p in pagination.pages" :key="p"
          :class="['px-2 py-1 rounded text-xs border', p === pagination.page ? 'bg-[--primary] text-white border-[--primary]' : 'border-[--border] hover:bg-[--surface-muted]']"
          @click="$emit('page-change', p)">{{ p }}</button>
        <button :disabled="pagination.page >= pagination.pages" class="px-2 py-1 rounded text-xs border border-[--border] disabled:opacity-40" @click="$emit('page-change', pagination.page + 1)">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: any[];
  columns: { key: string; label: string; sortable?: boolean }[];
  loading?: boolean;
  showCheckbox?: boolean;
  selectedRows?: string[];
  allSelected?: boolean;
  pagination?: { page: number; total: number; pages: number };
}>();
const emit = defineEmits<{
  'toggle-all': [v: boolean];
  'select-row': [id: string];
  'row-click': [row: any];
  'sort': [key: string];
  'page-change': [page: number];
}>();
const colspan = computed(() => (props.showCheckbox ? 1 : 0) + props.columns.length);
import { computed } from 'vue';
</script>
