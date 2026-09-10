<template>
  <div class="space-y-5">
    <BasePageHeader title="物品台账" subtitle="管理所有入库物品的详细信息和库存状态" />

    <!-- 汇总统计 -->
    <div class="grid grid-cols-5 gap-4">
      <WarehouseStatCard label="物品总数" :value="inventoryStats.total" tone="primary" />
      <WarehouseStatCard label="正常" :value="inventoryStats.normal" tone="success" />
      <WarehouseStatCard label="低库存" :value="inventoryStats.lowStock" tone="warning" />
      <WarehouseStatCard label="临期" :value="inventoryStats.expiring" tone="danger" />
      <WarehouseStatCard label="过期" :value="inventoryStats.expired" tone="danger" />
    </div>

    <!-- 工具栏 -->
    <BaseToolbar>
      <template #left>
        <BaseFormField label="搜索" placeholder="物品名称" v-model="search" style="width:200px;" />
        <BaseFormField label="分类" type="select" :options="categoryOptions" v-model="categoryFilter" style="width:150px;" />
        <BaseFormField label="状态" type="select" :options="statusOptions" v-model="statusFilter" style="width:130px;" />
        <BaseFormField label="库位" type="select" :options="locationOptions" v-model="locationFilter" style="width:150px;" />
      </template>
      <template #right>
        <BaseButton variant="secondary" size="sm">导出</BaseButton>
        <BaseButton variant="primary" size="sm">新建物品</BaseButton>
      </template>
    </BaseToolbar>

    <!-- 表格 -->
    <BaseTable
      :data="filteredItems"
      :columns="columns"
      :pagination="{ page: 1, total: filteredItems.length, pages: 1 }"
    >
      <template #cell-status="{ row }">
        <BaseTag :tone="statusTone(row.status)" :label="row.status" />
      </template>
      <template #cell-stock="{ row }">
        <span :class="row.stock <= row.safetyStock ? 'text-[--danger] font-semibold' : ''">{{ row.stock }}</span>
      </template>
      <template #cell-available="{ row }">
        <span>{{ row.stock - row.locked }}</span>
      </template>
      <template #cell-capacity="{ row }">
        <div class="flex items-center gap-2">
          <div class="w-16 h-1.5 bg-[--surface-muted] rounded-full overflow-hidden">
            <div :class="['h-full rounded-full', row.stock / row.safetyStock > 1 ? 'bg-[--success]' : row.stock / row.safetyStock > 0.5 ? 'bg-[--warning]' : 'bg-[--danger]']" :style="{ width: Math.min(100, (row.stock / row.safetyStock) * 100) + '%' }" />
          </div>
          <span class="text-xs text-[--muted-foreground]">{{ Math.round(row.stock / row.safetyStock * 100) }}%</span>
        </div>
      </template>
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <button class="text-[--primary] text-xs font-medium hover:underline" @click.stop="editItem(row)">编辑</button>
          <button class="text-[--info] text-xs font-medium hover:underline" @click.stop="viewDetail(row)">详情</button>
          <button class="text-[--muted-foreground] text-xs hover:underline" @click.stop="generateBarcode(row)">条码</button>
        </div>
      </template>
    </BaseTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { items as allItems, inventoryStats } from '@/api/mock/warehouse';
import type { WarehouseItem } from '@/api/mock/warehouse';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseToolbar from '@/components/base/BaseToolbar.vue';
import WarehouseStatCard from '@/components/warehouse/WarehouseStatCard.vue';

const search = ref('');
const categoryFilter = ref('');
const statusFilter = ref('');
const locationFilter = ref('');

const categories = [...new Set(allItems.map(i => i.category))];
const locations = [...new Set(allItems.map(i => i.location))];

const categoryOptions = [{ label: '全部分类', value: '' }, ...categories.map(c => ({ label: c, value: c }))];
const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '正常', value: '正常' },
  { label: '低库存', value: '低库存' },
  { label: '临期', value: '临期' },
  { label: '过期', value: '过期' },
];
const locationOptions = [{ label: '全部库位', value: '' }, ...locations.map(l => ({ label: l, value: l }))];

const filteredItems = computed(() => {
  return allItems.filter(item => {
    if (search.value && !item.name.includes(search.value) && !item.code.includes(search.value)) return false;
    if (categoryFilter.value && item.category !== categoryFilter.value) return false;
    if (statusFilter.value && item.status !== statusFilter.value) return false;
    if (locationFilter.value && item.location !== locationFilter.value) return false;
    return true;
  });
});

const columns = [
  { key: 'code', label: '物品编号' },
  { key: 'name', label: '物品名称' },
  { key: 'brand', label: '品牌' },
  { key: 'spec', label: '规格' },
  { key: 'material', label: '材质' },
  { key: 'category', label: '分类' },
  { key: 'supplier', label: '供应商' },
  { key: 'projectCode', label: '项目编号' },
  { key: 'stock', label: '库存数量' },
  { key: 'locked', label: '锁定数量' },
  { key: 'available', label: '可用库存' },
  { key: 'location', label: '存放位置' },
  { key: 'safetyStock', label: '安全库存' },
  { key: 'expiryWarningDays', label: '临期预警天数' },
  { key: 'status', label: '状态' },
  { key: 'lastInboundTime', label: '最近入库时间' },
  { key: 'actions', label: '操作' },
];

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
    '正常': 'success',
    '低库存': 'warning',
    '临期': 'warning',
    '过期': 'danger',
  };
  return map[status] ?? 'neutral';
}

function editItem(row: WarehouseItem) {
  console.log('edit', row);
}

function viewDetail(row: WarehouseItem) {
  console.log('detail', row);
}

function generateBarcode(row: WarehouseItem) {
  console.log('barcode', row);
}
</script>
