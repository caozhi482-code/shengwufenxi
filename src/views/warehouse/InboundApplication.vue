<template>
  <div class="space-y-5">
    <BasePageHeader title="入库申请" subtitle="创建和管理入库申请单" />

    <!-- 工具栏 -->
    <div class="flex items-center justify-between">
      <BaseButton variant="secondary" size="sm" @click="$router.push('/warehouse/dashboard')">← 返回</BaseButton>
      <div class="flex gap-2">
        <BaseButton variant="secondary" @click="saveDraft">保存草稿</BaseButton>
        <BaseButton
          v-if="currentForm.status !== '已通过' && currentForm.status !== '已拒绝'"
          variant="primary"
          :disabled="currentForm.status === '草稿'"
          @click="submitApproval"
        >
          提交审批
        </BaseButton>
      </div>
    </div>

    <!-- 申请信息 -->
    <BaseCard>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-base font-bold text-[--foreground]">基本信息</span>
          <BaseTag :tone="statusTone(currentForm.status)" :label="currentForm.status" />
        </div>
      </template>
      <div class="grid grid-cols-4 gap-4">
        <BaseFormField label="申请单号" :model-value="currentForm.code" :readonly="true" />
        <BaseFormField label="申请人" :model-value="currentForm.applicant" :readonly="true" />
        <BaseFormField label="所属部门" :model-value="currentForm.department" :readonly="true" />
        <BaseFormField label="项目编号" :model-value="currentForm.projectCode" :readonly="true" />
      </div>
    </BaseCard>

    <!-- 物品明细 -->
    <InboundForm :form="currentForm" />

    <!-- 审批操作（审批中/已通过/已拒绝时显示） -->
    <BaseCard v-if="['审批中', '已通过', '已拒绝'].includes(currentForm.status)">
      <template #header>
        <span class="text-base font-bold text-[--foreground]">审批记录</span>
      </template>
      <div class="space-y-3">
        <div class="flex items-start gap-3 py-2 border-b border-[--border]">
          <div class="w-8 h-8 rounded-full bg-[--primary-soft] text-[--primary] flex items-center justify-center text-xs font-bold shrink-0">张</div>
          <div>
            <div class="text-sm font-medium text-[--text-main]">张三 提交申请</div>
            <div class="text-xs text-[--muted-foreground]">{{ currentForm.createdAt }} 14:30</div>
          </div>
          <BaseTag tone="info" label="待审批" />
        </div>
        <div class="flex items-start gap-3 py-2 border-b border-[--border]">
          <div class="w-8 h-8 rounded-full bg-[--success-soft] text-[--success] flex items-center justify-center text-xs font-bold shrink-0">李</div>
          <div>
            <div class="text-sm font-medium text-[--text-main]">李审批 审核通过</div>
            <div class="text-xs text-[--muted-foreground]">{{ currentForm.updatedAt }} 16:45</div>
          </div>
          <BaseTag tone="success" label="已通过" />
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { inboundApplications } from '@/api/mock/warehouse';
import type { InboundApplication } from '@/api/mock/warehouse';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import InboundForm from '@/components/warehouse/InboundForm.vue';

const currentForm = ref<InboundApplication>(inboundApplications[0]);

function statusTone(status: string): 'info' | 'success' | 'warning' | 'danger' | 'neutral' {
  const map: Record<string, 'info' | 'success' | 'warning' | 'danger' | 'neutral'> = {
    '草稿': 'neutral',
    '待审批': 'warning',
    '审批中': 'info',
    '已通过': 'success',
    '已拒绝': 'danger',
  };
  return map[status] ?? 'neutral';
}

function saveDraft() {
  console.log('save draft', currentForm.value);
}

function submitApproval() {
  console.log('submit approval', currentForm.value);
}
</script>
