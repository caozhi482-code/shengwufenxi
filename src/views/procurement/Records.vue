<template>
  <div class="space-y-5 pb-24">
    <!-- 顶部工具栏 -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="text-sm text-[--muted-foreground]">采购管理 / 采购记录</div>
      <div class="flex gap-2">
        <BaseButton variant="secondary" size="sm">导出</BaseButton>
      </div>
    </div>

    <!-- 筛选栏 -->
    <BaseCard>
      <div class="flex flex-wrap gap-3 items-end">
        <BaseFormField label="搜索" placeholder="采购单号 / 物品名称" v-model="search" style="flex:1;min-width:200px;" />
        <BaseFormField label="日期范围" type="date" v-model="dateFrom" style="width:140px;" />
        <BaseFormField label="至" type="date" v-model="dateTo" style="width:140px;" />
        <BaseButton variant="primary" size="sm">查询</BaseButton>
        <BaseButton variant="secondary" size="sm" @click="reset">重置</BaseButton>
      </div>
    </BaseCard>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-white border border-[--border] rounded-[10px] p-4 shadow-sm">
        <div class="text-xs text-[--muted-foreground]">本月入库金额</div>
        <div class="text-2xl font-bold text-[--primary] mt-1">¥128,500</div>
      </div>
      <div class="bg-white border border-[--border] rounded-[10px] p-4 shadow-sm">
        <div class="text-xs text-[--muted-foreground]">已入库物品数</div>
        <div class="text-2xl font-bold text-[--success] mt-1">47</div>
      </div>
      <div class="bg-white border border-[--border] rounded-[10px] p-4 shadow-sm">
        <div class="text-xs text-[--muted-foreground]">待入库物品数</div>
        <div class="text-2xl font-bold text-[--warning] mt-1">12</div>
      </div>
      <div class="bg-white border border-[--border] rounded-[10px] p-4 shadow-sm">
        <div class="text-xs text-[--muted-foreground]">本月采购单数</div>
        <div class="text-2xl font-bold text-[--info] mt-1">8</div>
      </div>
    </div>

    <!-- 数据表格 -->
    <BaseCard>
      <template #header>
        <span class="text-base font-bold text-[--foreground]">采购记录</span>
      </template>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-[--surface-muted]">
              <th class="px-4 py-2.5 text-left font-medium text-[--muted-foreground]">采购单号</th>
              <th class="px-4 py-2.5 text-left font-medium text-[--muted-foreground]">物品名称</th>
              <th class="px-4 py-2.5 text-left font-medium text-[--muted-foreground]">规格</th>
              <th class="px-4 py-2.5 text-center font-medium text-[--muted-foreground]">数量</th>
              <th class="px-4 py-2.5 text-left font-medium text-[--muted-foreground]">单位</th>
              <th class="px-4 py-2.5 text-left font-medium text-[--muted-foreground]">供应商</th>
              <th class="px-4 py-2.5 text-left font-medium text-[--muted-foreground]">入库时间</th>
              <th class="px-4 py-2.5 text-left font-medium text-[--muted-foreground]">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in filteredRecords" :key="i" class="border-t border-[--border] hover:bg-[--surface-muted] cursor-pointer" @click="viewInbound(row)">
              <td class="px-4 py-3 font-mono font-semibold text-[--primary]">{{ row.code }}</td>
              <td class="px-4 py-3 font-medium text-[--text-main]">{{ row.itemName }}</td>
              <td class="px-4 py-3 text-[--muted-foreground]">{{ row.spec }}</td>
              <td class="px-4 py-3 text-center font-mono">{{ row.qty }}</td>
              <td class="px-4 py-3">{{ row.unit }}</td>
              <td class="px-4 py-3">{{ row.supplier }}</td>
              <td class="px-4 py-3 text-[--muted-foreground]">{{ row.inboundDate }}</td>
              <td class="px-4 py-3">
                <button class="text-[--primary] hover:underline">查看入库单</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex items-center justify-between mt-4 pt-4 border-t border-[--border]">
        <div class="text-xs text-[--muted-foreground]">共 {{ filteredRecords.length }} 条记录</div>
        <div class="flex gap-1">
          <BaseButton variant="secondary" size="xs" disabled>上一页</BaseButton>
          <BaseButton variant="primary" size="xs">1</BaseButton>
          <BaseButton variant="secondary" size="xs" disabled>下一页</BaseButton>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseButton from '@/components/base/BaseButton.vue';

const search = ref('');
const dateFrom = ref('');
const dateTo = ref('');

const mockRecords = [
  { code: 'PO-0001', itemName: '乙腈（色谱纯）', spec: '4L/瓶', qty: 10, unit: '瓶', supplier: '赛默飞世尔', inboundDate: '2026-09-05' },
  { code: 'PO-0002', itemName: '甲醇（色谱纯）', spec: '4L/瓶', qty: 8, unit: '瓶', supplier: '默克密理博', inboundDate: '2026-09-06' },
  { code: 'PO-0003', itemName: 'C18色谱柱', spec: '250×4.6mm', qty: 3, unit: '支', supplier: '安捷伦', inboundDate: '2026-09-07' },
  { code: 'PO-0004', itemName: '乙酰胺标准品', spec: '100mg/支', qty: 20, unit: '支', supplier: ' Sigma-Aldrich', inboundDate: '2026-09-08' },
  { code: 'PO-0005', itemName: '离心管（50mL）', spec: '无菌', qty: 500, unit: '个', supplier: ' Corning', inboundDate: '2026-09-09' },
  { code: 'PO-0006', itemName: '磷酸二氢钾', spec: 'AR 500g', qty: 15, unit: '瓶', supplier: '国药集团', inboundDate: '2026-09-09' },
  { code: 'PO-0007', itemName: '移液器吸头（1000μL）', spec: '无菌', qty: 1000, unit: '盒', supplier: 'Eppendorf', inboundDate: '2026-09-10' },
  { code: 'PO-0008', itemName: '血浆采集管', spec: 'EDTA', qty: 200, unit: '支', supplier: 'Becton Dickinson', inboundDate: '2026-09-10' },
];

const filteredRecords = computed(() =>
  mockRecords.filter(r =>
    !search.value || r.code.toLowerCase().includes(search.value.toLowerCase()) || r.itemName.includes(search.value)
  )
);

function viewInbound(row: any) {
  // 跳转入库详情页
}

function reset() {
  search.value = '';
  dateFrom.value = '';
  dateTo.value = '';
}
</script>
