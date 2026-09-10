<template>
  <BaseCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-base font-bold text-[--foreground]">盘点详情</span>
        <BaseTag v-if="selectedItem" :label="selectedItem.code" tone="info" />
      </div>
    </template>
    <template v-if="selectedItem">
      <div class="grid grid-cols-2 gap-4 mb-4">
        <BaseFormField label="物品名称" :model-value="selectedItem.itemName" :readonly="true" />
        <BaseFormField label="物品编码" :model-value="selectedItem.code" :readonly="true" />
        <BaseFormField label="存放位置" :model-value="selectedItem.location" :readonly="true" />
        <BaseFormField label="计量单位" :model-value="selectedItem.unit" :readonly="true" />
      </div>
      <div class="grid grid-cols-3 gap-4 mb-4">
        <div class="bg-[--surface-muted] rounded-md p-3 text-center">
          <div class="text-xs text-[--muted-foreground]">系统库存</div>
          <div class="text-lg font-bold text-[--foreground]">{{ selectedItem.systemQty }}</div>
        </div>
        <div class="bg-[--surface-muted] rounded-md p-3 text-center">
          <div class="text-xs text-[--muted-foreground]">实盘数量</div>
          <div class="text-lg font-bold text-[--primary]">{{ selectedItem.actualQty }}</div>
        </div>
        <div class="bg-[--surface-muted] rounded-md p-3 text-center">
          <div class="text-xs text-[--muted-foreground]">差异</div>
          <div :class="['text-lg font-bold', selectedItem.difference === 0 ? 'text-[--success]' : selectedItem.difference > 0 ? 'text-[--info]' : 'text-[--danger]']">
            {{ selectedItem.difference > 0 ? '+' : '' }}{{ selectedItem.difference }}
          </div>
        </div>
      </div>
      <BaseFormField label="盘点备注" type="textarea" placeholder="请输入盘点备注" v-model="remark" />
    </template>
    <template v-else>
      <div class="flex flex-col items-center justify-center py-16 text-[--muted-foreground]">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-3 opacity-40"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        <div class="text-sm">请从左侧列表选择盘点物品</div>
      </div>
    </template>
  </BaseCard>
</template>

<script setup lang="ts">
import type { StockCountItem } from '@/api/mock/warehouse';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import { ref, watch } from 'vue';

const props = defineProps<{ selectedItem: StockCountItem | null }>();
const emit = defineEmits<{ 'update:remark': [v: string] }>();
const remark = ref('');

watch(() => props.selectedItem, (val) => {
  if (val) remark.value = val.remark ?? '';
});
</script>
