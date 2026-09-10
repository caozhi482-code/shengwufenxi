<template>
  <div class="space-y-5">
    <BasePageHeader title="预警管理" subtitle="查看和处理仓库各类预警信息" />

    <!-- 统计行 -->
    <div class="grid grid-cols-3 gap-4">
      <WarehouseStatCard label="总预警数" :value="alerts.length" tone="danger" />
      <WarehouseStatCard label="待处理" :value="alerts.filter(a => a.status === '待处理').length" tone="warning" />
      <WarehouseStatCard label="已处理" :value="alerts.filter(a => a.status === '已处理').length" tone="success" />
    </div>

    <!-- 工具栏 -->
    <BaseToolbar>
      <template #left>
        <BaseFormField label="预警类型" type="select" :options="typeOptions" v-model="typeFilter" style="width:150px;" />
        <BaseFormField label="库位" type="select" :options="locationOptions" v-model="locationFilter" style="width:150px;" />
        <BaseFormField label="状态" type="select" :options="statusOptions" v-model="statusFilter" style="width:130px;" />
      </template>
      <template #right>
        <BaseButton variant="secondary" size="sm" @click="batchHandle">批量处理</BaseButton>
        <BaseButton variant="secondary" size="sm" @click="exportAlerts">导出</BaseButton>
      </template>
    </BaseToolbar>

    <!-- 预警列表 -->
    <AlertList :data="filteredAlerts" @handle="handleAlert" @detail="viewAlertDetail" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { alerts } from '@/api/mock/warehouse';
import type { Alert } from '@/api/mock/warehouse';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseToolbar from '@/components/base/BaseToolbar.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import WarehouseStatCard from '@/components/warehouse/WarehouseStatCard.vue';
import AlertList from '@/components/warehouse/AlertList.vue';

const typeFilter = ref('');
const locationFilter = ref('');
const statusFilter = ref('');

const types = [...new Set(alerts.map(a => a.type))];
const alertLocations = [...new Set(alerts.map(a => a.location))];

const typeOptions = [
  { label: '全部类型', value: '' },
  ...types.map(t => ({ label: t, value: t })),
];
const locationOptions = [
  { label: '全部库位', value: '' },
  ...alertLocations.map(l => ({ label: l, value: l })),
];
const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '待处理', value: '待处理' },
  { label: '已处理', value: '已处理' },
];

const filteredAlerts = computed(() => {
  return alerts.filter(a => {
    if (typeFilter.value && a.type !== typeFilter.value) return false;
    if (locationFilter.value && a.location !== locationFilter.value) return false;
    if (statusFilter.value && a.status !== statusFilter.value) return false;
    return true;
  });
});

function handleAlert(row: Alert) {
  console.log('handle alert', row);
}

function viewAlertDetail(row: Alert) {
  console.log('alert detail', row);
}

function batchHandle() {
  console.log('batch handle');
}

function exportAlerts() {
  console.log('export alerts');
}
</script>
