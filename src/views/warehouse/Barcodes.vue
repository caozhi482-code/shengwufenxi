<template>
  <div class="space-y-5">
    <BasePageHeader title="条码管理" subtitle="生成和管理物品、库位、批次的条码及二维码" />

    <!-- 工具栏 -->
    <BaseToolbar>
      <template #left>
        <BaseFormField label="目标类型" type="select" :options="targetTypeOptions" v-model="targetTypeFilter" style="width:130px;" />
        <BaseFormField label="目标名称" placeholder="搜索条码" v-model="search" style="width:200px;" />
      </template>
      <template #right>
        <BaseButton variant="secondary" size="sm" @click="refresh">刷新</BaseButton>
        <BaseButton variant="secondary" size="sm">批量打印</BaseButton>
        <BaseButton variant="primary" size="sm" @click="openGenerateDialog">生成条码</BaseButton>
      </template>
    </BaseToolbar>

    <!-- 表格 -->
    <BaseCard>
      <BaseTable
        :data="filteredBarcodes"
        :columns="columns"
        :pagination="{ page: 1, total: filteredBarcodes.length, pages: 1 }"
      >
        <template #cell-targetType="{ row }">
          <BaseTag :tone="targetTypeTone(row.targetType)" :label="row.targetType" />
        </template>
        <template #cell-qrLink="{ row }">
          <a :href="row.qrLink" target="_blank" class="text-[--info] text-xs hover:underline">{{ row.qrLink }}</a>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex gap-2">
            <button class="text-[--primary] text-xs font-medium hover:underline" @click.stop="printBarcode(row)">打印</button>
            <button class="text-[--info] text-xs font-medium hover:underline" @click.stop="regenerate(row)">重新生成</button>
            <button class="text-[--danger] text-xs font-medium hover:underline" @click.stop="deleteBarcode(row)">删除</button>
          </div>
        </template>
      </BaseTable>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { barcodes } from '@/api/mock/warehouse';
import type { Barcode } from '@/api/mock/warehouse';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseToolbar from '@/components/base/BaseToolbar.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';

const search = ref('');
const targetTypeFilter = ref('');

const targetTypeOptions = [
  { label: '全部类型', value: '' },
  { label: '物品', value: '物品' },
  { label: '库位', value: '库位' },
  { label: '批次', value: '批次' },
];

const filteredBarcodes = computed(() => {
  return barcodes.filter(bc => {
    if (targetTypeFilter.value && bc.targetType !== targetTypeFilter.value) return false;
    if (search.value && !bc.targetName.includes(search.value) && !bc.code.includes(search.value)) return false;
    return true;
  });
});

const columns = [
  { key: 'code', label: '条码编号' },
  { key: 'targetType', label: '目标类型' },
  { key: 'targetCode', label: '目标编码' },
  { key: 'targetName', label: '目标名称' },
  { key: 'qrLink', label: 'QR码链接' },
  { key: 'printCount', label: '打印次数' },
  { key: 'creator', label: '创建人' },
  { key: 'createdAt', label: '创建时间' },
  { key: 'actions', label: '操作' },
];

function targetTypeTone(type: string): 'info' | 'success' | 'warning' | 'danger' | 'neutral' {
  const map: Record<string, 'info' | 'success' | 'warning' | 'danger' | 'neutral'> = {
    '物品': 'success',
    '库位': 'info',
    '批次': 'warning',
  };
  return map[type] ?? 'neutral';
}

function refresh() {
  console.log('refresh');
}

function openGenerateDialog() {
  console.log('generate');
}

function printBarcode(row: Barcode) {
  console.log('print', row);
}

function regenerate(row: Barcode) {
  console.log('regenerate', row);
}

function deleteBarcode(row: Barcode) {
  console.log('delete', row);
}
</script>
