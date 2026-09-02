<template>
  <div class="space-y-5">
    <BasePageHeader title="表单模板中心" subtitle="沉淀实验室线下原始记录模板，供计划流程选择、查看和复用">
      <template #extra>
        <BaseButton variant="secondary" @click="goBack">返回计划流程</BaseButton>
        <BaseButton variant="secondary" @click="goReferenceStockTemplate">对照品模板</BaseButton>
        <BaseButton variant="secondary" @click="goWorkSolutionTemplate">工作溶液模板</BaseButton>
        <BaseButton variant="secondary" @click="goSplitTemplate">分装记录模板</BaseButton>
        <BaseButton variant="secondary" @click="goMatrixSampleTemplate">含基质样品模板</BaseButton>
        <BaseButton variant="secondary" @click="goMSTemplate">MS 溶液模板</BaseButton>
        <BaseButton variant="secondary" @click="goSequenceTemplate">进样序列表</BaseButton>
        <BaseButton variant="secondary" @click="goInjectionLCMSPreview">液质联用模板预览</BaseButton>
        <BaseButton variant="secondary" @click="goInjectionLCMSTemplate">液质联用模板</BaseButton>
        <BaseButton variant="primary" @click="createTemplateEntry">新建模板草稿</BaseButton>
      </template>
    </BasePageHeader>

    <BaseSummaryCard :cards="summaryCards" />

    <BaseCard>
      <template #header>
        <div class="flex items-center justify-between w-full gap-3">
          <span class="text-base font-bold text-[--foreground]">查询条件</span>
          <div class="text-xs text-[--muted-foreground]">模板用于计划流程调用与实验追溯</div>
        </div>
      </template>
      <div class="grid grid-cols-3 gap-3 items-end">
        <BaseFormField label="搜索" placeholder="模板名称 / 编号 / 考察项" v-model="search" />
        <BaseFormField label="状态" type="select" :options="statusOptions" v-model="statusFilter" />
        <div class="flex gap-2">
          <BaseButton variant="primary" size="sm" @click="applySearch">查询</BaseButton>
          <BaseButton variant="secondary" size="sm" @click="resetFilters">重置</BaseButton>
        </div>
      </div>
    </BaseCard>

    <BaseCard>
      <template #header>
        <div class="flex items-center justify-between w-full gap-3">
          <span class="text-base font-bold text-[--foreground]">模板列表</span>
          <div class="text-xs text-[--muted-foreground]">共 {{ filteredTemplates.length }} 个模板</div>
        </div>
      </template>

      <BaseTable
        :data="tableTemplates"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        @row-click="openDetail"
        @page-change="page = $event"
      >
        <template #cell-templateName="{ row }">
          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
            <span class="font-semibold text-[--text-main]">{{ row.templateName }}</span>
              <BaseTag v-if="row.templateCode === 'BA-SBR02'" tone="info">对照品</BaseTag>
              <BaseTag v-if="row.templateCode === 'BA-SBR03'" tone="info">工作溶液</BaseTag>
              <BaseTag v-if="row.templateCode === 'BA-SBR04'" tone="info">分装记录</BaseTag>
              <BaseTag v-if="row.templateCode === 'BA-SBR06'" tone="info">含基质样品</BaseTag>
              <BaseTag v-if="row.templateCode === 'BA-SBR08'" tone="info">MS 溶液</BaseTag>
              <BaseTag v-if="row.templateCode === 'BA-SBR09'" tone="info">进样序列</BaseTag>
              <BaseTag v-if="row.templateCode === 'BA-SBR10'" tone="info">液质联用</BaseTag>
              <BaseTag v-if="row.isDefault" tone="success">默认</BaseTag>
              <BaseTag v-if="row.status === 'disabled'" tone="danger">停用</BaseTag>
            </div>
          </div>
        </template>
        <template #cell-templateCode="{ row }">
          <div class="font-mono text-xs font-semibold text-[--primary]">{{ row.templateCode }}</div>
        </template>
        <template #cell-version="{ row }">
          <BaseTag tone="neutral">{{ row.version }}</BaseTag>
        </template>
        <template #cell-itemNames="{ row }">
          <div class="flex flex-wrap gap-1.5">
            <BaseTag v-for="item in row.itemNames.slice(0, 2)" :key="item" tone="info">{{ item }}</BaseTag>
            <span v-if="row.itemNames.length > 2" class="text-xs text-[--muted-foreground]">+{{ row.itemNames.length - 2 }}</span>
          </div>
        </template>
        <template #cell-status="{ row }">
          <BaseTag :tone="statusTone(row.status)">{{ statusLabel(row.status) }}</BaseTag>
        </template>
        <template #cell-updatedAt="{ row }">
          <span class="text-sm text-[--text-main]">{{ row.updatedAt }}</span>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex items-center gap-2 flex-wrap">
            <button class="text-[--primary] text-xs font-medium hover:underline" @click.stop="openPreview(row)">预览</button>
            <button class="text-[--info] text-xs font-medium hover:underline" @click.stop="openDetail(row)">详情</button>
            <button class="text-[--muted-foreground] text-xs hover:underline" @click.stop="copyTemplate(row)">复制</button>
            <button class="text-[--muted-foreground] text-xs hover:underline" @click.stop="setDefault(row)">设为默认</button>
            <button class="text-[--danger] text-xs hover:underline" @click.stop="disableTemplate(row)">停用</button>
          </div>
        </template>
      </BaseTable>

      <div v-if="filteredTemplates.length === 0" class="py-12 text-center text-[--muted-foreground]">
        <div class="text-3xl mb-2">📭</div>
        <div class="text-sm">未找到匹配的模板</div>
        <div class="text-xs mt-1">可调整搜索词或状态筛选条件</div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseSummaryCard from '@/components/base/BaseSummaryCard.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import { formTemplates, formTemplateStatuses } from '@/api/mock/form-templates';
import type { FormTemplateRecord } from '@/types/experiments';

const router = useRouter();
const loading = ref(false);
const search = ref('');
const statusFilter = ref('');
const page = ref(1);
const pageSize = 12;

const statusOptions = formTemplateStatuses;

const columns = [
  { key: 'templateName', label: '模板名称' },
  { key: 'templateCode', label: '模板编号' },
  { key: 'version', label: '版本' },
  { key: 'itemNames', label: '适用考察项' },
  { key: 'status', label: '状态' },
  { key: 'updatedAt', label: '更新时间' },
  { key: 'actions', label: '操作' },
];

const filteredTemplates = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  return formTemplates.filter((template) => {
    if (keyword && ![template.templateName, template.templateCode, template.itemNames.join(' / ')].some(text => text.toLowerCase().includes(keyword))) {
      return false;
    }
    if (statusFilter.value && template.status !== statusFilter.value) return false;
    return true;
  });
});

const tableTemplates = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredTemplates.value.slice(start, start + pageSize);
});

const pagination = computed(() => ({
  page: page.value,
  total: filteredTemplates.value.length,
  pages: Math.max(1, Math.ceil(filteredTemplates.value.length / pageSize)),
}));

const summaryCards = computed(() => [
  { label: '模板总数', value: formTemplates.length },
  { label: '默认模板', value: formTemplates.filter(template => template.isDefault).length },
  { label: '启用模板', value: formTemplates.filter(template => template.status === 'enabled').length },
  { label: '停用模板', value: formTemplates.filter(template => template.status === 'disabled').length },
]);

function statusLabel(status: string): string {
  const map: Record<string, string> = { enabled: '启用', disabled: '停用', draft: '草稿' };
  return map[status] ?? status;
}

function statusTone(status: string): 'success' | 'danger' | 'warning' | 'neutral' {
  const map: Record<string, 'success' | 'danger' | 'warning' | 'neutral'> = { enabled: 'success', disabled: 'danger', draft: 'warning' };
  return map[status] ?? 'neutral';
}

function applySearch() { page.value = 1; }
function resetFilters() {
  search.value = '';
  statusFilter.value = '';
  page.value = 1;
}

function openDetail(row: FormTemplateRecord) {
  router.push(`/experiments/form-templates/${row.id}`);
}

function openPreview(row: FormTemplateRecord) {
  router.push(`/experiments/form-templates/${row.id}/preview`);
}

function copyTemplate(row: FormTemplateRecord) {
  alert(`已复制模板：${row.templateName}`);
}

function setDefault(row: FormTemplateRecord) {
  alert(`已将 ${row.templateName} 设为默认模板（模拟）`);
}

function disableTemplate(row: FormTemplateRecord) {
  alert(`已停用模板：${row.templateName}（模拟）`);
}

function createTemplateEntry() {
  router.push('/experiments/form-templates/TPL-001/editor');
}

function goReferencePreview() {
  router.push('/experiments/form-templates/TPL-006/preview');
}

function goReferenceStockTemplate() {
  router.push('/experiments/form-templates/TPL-006');
}

function goWorkSolutionTemplate() {
  router.push('/experiments/form-templates/TPL-007');
}

function goSplitTemplate() {
  router.push('/experiments/form-templates/TPL-008');
}

function goMatrixSampleTemplate() {
  router.push('/experiments/form-templates/TPL-009');
}

function goWorkSolutionPreview() {
  router.push('/experiments/form-templates/TPL-007/preview');
}

function goMSTemplate() {
  router.push('/experiments/form-templates/TPL-010');
}

function goSequenceTemplate() {
  router.push('/experiments/form-templates/TPL-011');
}

function goInjectionLCMSTemplate() {
  router.push('/experiments/form-templates/TPL-012');
}

function goInjectionLCMSPreview() {
  router.push('/experiments/form-templates/TPL-012/preview');
}

function goBack() {
  router.push('/experiments/plans/new/forms');
}
</script>
