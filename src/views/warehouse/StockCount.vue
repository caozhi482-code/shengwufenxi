<template>
  <div class="space-y-5">
    <BasePageHeader title="库存盘点" subtitle="管理定期盘点、专项盘点和临时盘点" />

    <div class="flex gap-5">
      <!-- 左侧：盘点列表 -->
      <div class="w-[420px] shrink-0 space-y-4">
        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-base font-bold text-[--foreground]">盘点单列表</span>
              <BaseButton variant="primary" size="sm">新建盘点</BaseButton>
            </div>
          </template>
          <div class="space-y-2">
            <div
              v-for="sc in stockCounts"
              :key="sc.id"
              :class="['rounded-lg border cursor-pointer transition-all duration-150 px-4 py-3',
                selectedCount?.id === sc.id ? 'border-[--primary] bg-[--primary-soft]' : 'border-[--border] bg-[--surface-muted] hover:border-[--border-strong]']"
              @click="selectCount(sc)"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-[--text-main]">{{ sc.name }}</span>
                <BaseTag :tone="sc.status === '进行中' ? 'info' : sc.status === '已完成' ? 'success' : 'neutral'" :label="sc.status" />
              </div>
              <div class="text-xs text-[--muted-foreground] mt-1">{{ sc.code }} · {{ sc.type }} · {{ sc.creator }} · {{ sc.createdAt }}</div>
              <div class="text-xs text-[--muted-foreground] mt-0.5">共 {{ sc.items.length }} 项物品</div>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- 右侧：盘点详情 -->
      <div class="flex-1">
        <StockCountForm v-if="selectedCount" :selected-item="selectedItem" />
        <div v-else class="bg-white border border-[--border] rounded-[10px] shadow-sm p-5 flex flex-col items-center justify-center min-h-[400px] text-[--muted-foreground]">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-3 opacity-40"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          <div class="text-sm">请从左侧选择一个盘点单，然后点击物品查看详情</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { stockCounts } from '@/api/mock/warehouse';
import type { StockCount, StockCountItem } from '@/api/mock/warehouse';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import StockCountForm from '@/components/warehouse/StockCountForm.vue';

const selectedCount = ref<StockCount | null>(null);
const selectedItem = ref<StockCountItem | null>(null);

function selectCount(sc: StockCount) {
  selectedCount.value = sc;
  selectedItem.value = sc.items[0] ?? null;
}
</script>
