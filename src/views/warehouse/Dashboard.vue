<template>
  <div class="space-y-5">
    <BasePageHeader title="仓库管理仪表板" subtitle="查看仓库库存概况、预警信息和快捷操作">
      <template #extra>
        <BaseButton variant="ghost" @click="$router.push('/warehouse/inbound')">入库申请</BaseButton>
        <BaseButton variant="ghost" @click="$router.push('/warehouse/outbound')">出库申请</BaseButton>
        <BaseButton variant="primary" @click="$router.push('/warehouse/inventory')">库存查询</BaseButton>
      </template>
    </BasePageHeader>

    <!-- KPI 行1 -->
    <div class="grid grid-cols-4 gap-4">
      <WarehouseStatCard label="物品总数" :value="stats.totalItems" tone="primary" sub="个物品" />
      <WarehouseStatCard label="预警数量" :value="stats.alertCount" tone="danger" sub="需关注" />
      <WarehouseStatCard label="待入库申请" :value="stats.pendingInbound" tone="info" sub="条" />
      <WarehouseStatCard label="已入库物品" :value="stats.inboundCount" tone="success" sub="本季度" />
    </div>

    <!-- KPI 行2 -->
    <div class="grid grid-cols-4 gap-4">
      <WarehouseStatCard label="待出库申请" :value="stats.pendingOutbound" tone="info" sub="条" />
      <WarehouseStatCard label="已完成出库" :value="stats.outboundCount" tone="success" sub="本季度" />
      <WarehouseStatCard label="本月出库数量" :value="stats.monthOutboundCount" tone="primary" sub="批次" />
      <WarehouseStatCard label="容量预警" :value="stats.capacityAlertCount" tone="warning" sub="库位" />
    </div>

    <!-- 快捷操作 -->
    <BaseCard>
      <template #header>
        <span class="text-base font-bold text-[--foreground]">快捷操作</span>
      </template>
      <div class="grid grid-cols-4 gap-4">
        <button class="flex flex-col items-center gap-2 p-4 rounded-lg border border-[--border] bg-[--surface-muted] hover:bg-[--primary-soft] hover:border-[--primary-border] transition-all duration-150" @click="$router.push('/warehouse/inbound')">
          <div class="w-10 h-10 rounded-lg bg-[--primary-soft] text-[--primary] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m8 11 4 4 4-4"/><path d="M4 21h16"/></svg>
          </div>
          <span class="text-sm font-medium text-[--text-main]">入库申请</span>
        </button>
        <button class="flex flex-col items-center gap-2 p-4 rounded-lg border border-[--border] bg-[--surface-muted] hover:bg-[--info-soft] hover:border-[--info-border] transition-all duration-150" @click="$router.push('/warehouse/outbound')">
          <div class="w-10 h-10 rounded-lg bg-[--info-soft] text-[--info] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="m8 3 4-4 4 4"/><path d="M20 21H4"/></svg>
          </div>
          <span class="text-sm font-medium text-[--text-main]">出库申请</span>
        </button>
        <button class="flex flex-col items-center gap-2 p-4 rounded-lg border border-[--border] bg-[--surface-muted] hover:bg-[--success-soft] hover:border-[--success-border] transition-all duration-150" @click="$router.push('/warehouse/inventory')">
          <div class="w-10 h-10 rounded-lg bg-[--success-soft] text-[--success] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <span class="text-sm font-medium text-[--text-main]">库存查询</span>
        </button>
        <button class="flex flex-col items-center gap-2 p-4 rounded-lg border border-[--border] bg-[--surface-muted] hover:bg-[--warning-soft] hover:border-[--warning-border] transition-all duration-150" @click="$router.push('/warehouse/alerts')">
          <div class="w-10 h-10 rounded-lg bg-[--warning-soft] text-[--warning] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </div>
          <span class="text-sm font-medium text-[--text-main]">预警列表</span>
        </button>
      </div>
    </BaseCard>

    <!-- 最近预警 -->
    <AlertList :data="recentAlerts" @handle="handleAlert" @detail="handleDetail" />
  </div>
</template>

<script setup lang="ts">
import { dashboardStats, recentAlerts } from '@/api/mock/warehouse';
import type { Alert } from '@/api/mock/warehouse';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import WarehouseStatCard from '@/components/warehouse/WarehouseStatCard.vue';
import AlertList from '@/components/warehouse/AlertList.vue';

const stats = dashboardStats;

function handleAlert(row: Alert) {
  console.log('handle alert', row);
}

function handleDetail(row: Alert) {
  console.log('alert detail', row);
}
</script>
