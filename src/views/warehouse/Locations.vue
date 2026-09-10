<template>
  <div class="space-y-5">
    <BasePageHeader title="库位管理" subtitle="管理仓库库位信息、容量和占用状态" />

    <div class="flex gap-5">
      <!-- 左侧：库位树 -->
      <div class="w-[280px] shrink-0">
        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-base font-bold text-[--foreground]">库位结构</span>
              <BaseButton variant="ghost" size="sm" @click="toggleAll">展开全部</BaseButton>
            </div>
          </template>
          <div class="py-2">
            <LocationTree
              v-for="node in treeNodes"
              :key="node.id"
              :node="node"
              @select="selectLocation"
            />
          </div>
        </BaseCard>
      </div>

      <!-- 右侧：库位表格 -->
      <div class="flex-1 space-y-4">
        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-base font-bold text-[--foreground]">库位列表</span>
              <BaseButton variant="primary" size="sm">新建库位</BaseButton>
            </div>
          </template>
          <BaseTable
            :data="selectedLocation ? filteredLocations : locations"
            :columns="columns"
            :pagination="{ page: 1, total: filteredLocations.length, pages: 1 }"
          >
            <template #cell-status="{ row }">
              <BaseTag :tone="locationStatusTone(row.status)" :label="row.status" />
            </template>
            <template #cell-occupancy="{ row }">
              <div class="flex items-center gap-2">
                <div class="w-16 h-1.5 bg-[--surface-muted] rounded-full overflow-hidden">
                  <div :class="['h-full rounded-full', occupancyColor(row)]" :style="{ width: occupancyPercent(row) + '%' }" />
                </div>
                <span class="text-xs text-[--muted-foreground]">{{ occupancyPercent(row) }}%</span>
              </div>
            </template>
            <template #cell-actions="{ row }">
              <div class="flex gap-2">
                <button class="text-[--primary] text-xs font-medium hover:underline" @click.stop="editLocation(row)">编辑</button>
                <button class="text-[--info] text-xs font-medium hover:underline" @click.stop="viewItems(row)">物品</button>
                <button class="text-[--danger] text-xs font-medium hover:underline" @click.stop="deleteLocation(row)">删除</button>
              </div>
            </template>
          </BaseTable>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { locations } from '@/api/mock/warehouse';
import type { Location } from '@/api/mock/warehouse';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import LocationTree from '@/components/warehouse/LocationTree.vue';

const selectedLocation = ref<Location | null>(null);
const expandedIds = ref<Set<string>>(new Set());

const locationMap = computed(() => {
  const map = new Map<string, Location>();
  locations.forEach(l => map.set(l.id, l));
  return map;
});

const treeNodes = computed(() => {
  return locations.filter(l => !l.parentId).map(loc => ({
    ...loc,
    selected: selectedLocation.value?.id === loc.id,
    expanded: expandedIds.value.has(loc.id),
    children: locations.filter(l => l.parentId === loc.id).map(child => ({
      ...child,
      selected: selectedLocation.value?.id === child.id,
      expanded: false,
      children: locations.filter(gc => gc.parentId === child.id).map(gc => ({
        ...gc,
        selected: selectedLocation.value?.id === gc.id,
        expanded: false,
        children: [],
      })),
    })),
  }));
});

function toggleAll() {
  if (expandedIds.value.size > 0) {
    expandedIds.value.clear();
  } else {
    locations.filter(l => !l.parentId).forEach(l => expandedIds.value.add(l.id));
  }
}

function selectLocation(node: Location & { selected?: boolean }) {
  selectedLocation.value = node as Location;
}

const filteredLocations = computed(() => {
  if (!selectedLocation.value) return locations;
  // Show all locations under the selected parent (or just this one if it's a leaf)
  const descendants = locations.filter(l => {
    if (!l.path) return false;
    return l.path.startsWith(selectedLocation.value!.path + '/');
  });
  // Include the selected location itself
  return [selectedLocation.value, ...descendants.filter(d => d.id !== selectedLocation.value!.id)];
});

const columns = [
  { key: 'code', label: '库位编码' },
  { key: 'name', label: '库位名称' },
  { key: 'type', label: '库位类型' },
  { key: 'parentId', label: '父级库位' },
  { key: 'path', label: '库位路径' },
  { key: 'capacity', label: '容量' },
  { key: 'used', label: '已占用' },
  { key: 'occupancy', label: '占用率' },
  { key: 'status', label: '容量状态' },
  { key: 'createdAt', label: '创建时间' },
  { key: 'actions', label: '操作' },
];

function locationStatusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
    '可用': 'success',
    '已满': 'danger',
    '锁定': 'warning',
  };
  return map[status] ?? 'neutral';
}

function occupancyPercent(loc: Location): number {
  return loc.capacity > 0 ? Math.round((loc.used / loc.capacity) * 100) : 0;
}

function occupancyColor(loc: Location): string {
  const pct = occupancyPercent(loc);
  if (pct >= 90) return 'bg-[--danger]';
  if (pct >= 70) return 'bg-[--warning]';
  return 'bg-[--success]';
}

function editLocation(row: Location) {
  console.log('edit', row);
}

function viewItems(row: Location) {
  console.log('view items', row);
}

function deleteLocation(row: Location) {
  console.log('delete', row);
}
</script>
