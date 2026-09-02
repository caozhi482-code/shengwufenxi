<template>
  <div class="space-y-5">
    <BasePageHeader title="数据复核" subtitle="对待复核的执行单进行数据完整性检查" />

    <BaseSummaryCard :cards="summaryCards" />

    <BaseCard>
      <div class="flex gap-3 flex-wrap items-end mb-4">
        <BaseFormField label="状态" type="select" :options="statusOpts" v-model="statusFilter" style="width:120px;" />
        <BaseButton variant="primary" size="sm">查询</BaseButton>
      </div>
      <BaseTable :data="filteredSheets" :columns="columns" :loading="loading">
        <template #cell-complete="{ row }">
          <BaseTag :tone="row.complete === '完整' ? 'success' : 'warning'">{{ row.complete }}</BaseTag>
        </template>
        <template #cell-actions="{ row }">
          <button class="text-[--primary] text-xs font-medium hover:underline" @click="openReview(row)">复核</button>
        </template>
      </BaseTable>
    </BaseCard>

    <!-- 复核抽屉 -->
    <BaseDrawer v-if="showReview" title="数据复核" :open="showReview" @close="showReview = false">
      <div class="space-y-4">
        <div class="bg-[--surface-muted] rounded-md p-3 text-sm">
          <div class="grid grid-cols-2 gap-2">
            <div><span class="text-[--muted-foreground]">执行单：</span><span class="font-medium">{{ reviewSheet?.id }}</span></div>
            <div><span class="text-[--muted-foreground]">考察项：</span><span class="font-medium">{{ reviewSheet?.itemName }}</span></div>
            <div><span class="text-[--muted-foreground]">实验员：</span><span class="font-medium">{{ reviewSheet?.investigator }}</span></div>
            <div><span class="text-[--muted-foreground]">数据完整度：</span>
              <BaseTag :tone="reviewSheet?.complete === '完整' ? 'success' : 'warning'">{{ reviewSheet?.complete }}</BaseTag>
            </div>
          </div>
        </div>
        <BaseFormField label="复核人" type="select" :options="reviewerOptions" v-model="reviewForm.reviewer" />
        <BaseFormField label="复核意见" type="textarea" placeholder="请输入复核意见" v-model="reviewForm.comment" />
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="showReview = false">取消</BaseButton>
        <BaseButton variant="danger" @click="rejectReview">驳回</BaseButton>
        <BaseButton variant="primary" @click="approveReview">通过</BaseButton>
      </template>
    </BaseDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseSummaryCard from '@/components/base/BaseSummaryCard.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import BaseDrawer from '@/components/base/BaseDrawer.vue';
import { dailySheets } from '@/api/mock/sheets';

const statusFilter = ref('');
const loading = ref(false);
const showReview = ref(false);
const reviewSheet = ref<any>(null);
const reviewForm = ref({ reviewer: '', comment: '' });

const summaryCards = [
  { label: '待复核', value: '2' },
  { label: '复核中', value: '0' },
  { label: '已通过', value: '5' },
  { label: '已驳回', value: '1' },
];

const columns = [
  { key: 'id', label: '执行单编号' },
  { key: 'itemName', label: '考察项' },
  { key: 'investigator', label: '实验员' },
  { key: 'sampleBatch', label: '样本批次' },
  { key: 'complete', label: '完整度' },
  { key: 'actions', label: '操作' },
];

const statusOpts = [
  { label: '全部', value: '' },
  { label: '待复核', value: 'submitted' },
  { label: '已通过', value: 'passed' },
  { label: '已驳回', value: 'rejected' },
];
const reviewerOptions = [
  { label: '陈明', value: '陈明' },
  { label: '赵强', value: '赵强' },
];

const filteredSheets = computed(() =>
  dailySheets.filter((s: any) => !statusFilter.value || s.status === statusFilter.value)
    .map((s: any) => ({ ...s, complete: s.status === 'submitted' ? '完整' : '待复核' }))
);

function openReview(sheet: any) { reviewSheet.value = sheet; showReview.value = true; }
function approveReview() { showReview.value = false; }
function rejectReview() { showReview.value = false; }
</script>
