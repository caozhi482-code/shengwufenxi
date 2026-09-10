<template>
  <BaseCard>
    <template #header>
      <span class="text-base font-bold text-[--foreground]">出库信息</span>
    </template>
    <div class="grid grid-cols-2 gap-4 mb-4">
      <BaseFormField label="申请人" :model-value="form.applicant" :readonly="true" />
      <BaseFormField label="所属部门" :model-value="form.department" :readonly="true" />
      <BaseFormField label="项目编号" :model-value="form.projectCode" :readonly="true" />
      <BaseFormField label="申请日期" :model-value="form.createdAt" :readonly="true" type="date" />
    </div>
    <div class="mt-4">
      <div class="text-sm font-semibold text-[--text-main] mb-2">物品明细</div>
      <BaseTable
        :data="form.items"
        :columns="[
          { key: 'itemName', label: '物品名称' },
          { key: 'spec', label: '规格' },
          { key: 'quantity', label: '数量' },
          { key: 'unit', label: '单位' },
          { key: 'location', label: '存放位置' },
          { key: 'batchNo', label: '批号' },
        ]"
      />
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import type { OutboundApplication } from '@/api/mock/warehouse';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseTable from '@/components/base/BaseTable.vue';

defineProps<{ form: OutboundApplication }>();
</script>
