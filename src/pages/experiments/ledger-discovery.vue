<template>
  <div class="space-y-5 pb-24">
    <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] px-5 py-4">
      <StepWizard :steps="steps" :current="4" />
    </div>

    <BasePageHeader
      title="实验新发现资源记录"
      subtitle="在实验过程中发现的新资源、新方法、新材料，记录后供后续计划参考"
    >
      <template #extra>
        <BaseButton variant="secondary" size="sm" @click="backToWorkspace">返回工作台</BaseButton>
        <BaseButton variant="primary" size="sm" @click="openAddDialog">+ 新增发现记录</BaseButton>
      </template>
    </BasePageHeader>

    <div class="grid grid-cols-3 gap-5">
      <div class="col-span-2 space-y-5">
        <!-- 发现记录列表 -->
        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <span class="text-base font-bold text-[--foreground]">新发现资源记录</span>
                <div class="text-xs text-[--muted-foreground] mt-0.5">记录实验过程中发现的新资源及建议</div>
              </div>
            </div>
          </template>

          <div v-if="records.length === 0" class="py-8 text-center text-sm text-[--muted-foreground]">
            暂无新发现记录
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="rec in records"
              :key="rec.id"
              class="border border-[--border] rounded-lg p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm font-semibold text-[--text-main]">{{ rec.resourceName }}</span>
                    <BaseTag :label="resourceTypeLabel(rec.resourceType)" :tone="resourceTypeTone(rec.resourceType)" />
                    <BaseTag :label="getStageLabel(rec.discoveryStage)" tone="neutral" />
                    <BaseTag
                      v-if="rec.isVerified"
                      label="已验证"
                      tone="success"
                    />
                    <BaseTag
                      v-else
                      label="未验证"
                      tone="warning"
                    />
                    <BaseTag
                      v-if="rec.suggestInclusion"
                      label="建议纳入"
                      tone="info"
                    />
                  </div>
                  <div class="text-xs text-[--muted-foreground] mt-1">
                    <span class="font-medium text-[--text-main]">用途：</span>{{ rec.usage }}
                  </div>
                  <div class="text-xs text-[--muted-foreground] mt-1">
                    <span class="font-medium text-[--text-main]">发现场景：</span>{{ rec.usageScenario }}
                  </div>
                  <div v-if="rec.suggestion" class="text-xs text-[--primary] mt-1 bg-[--primary-soft]/50 rounded px-2 py-1 inline-block">
                    <span class="font-medium">建议：</span>{{ rec.suggestion }}
                  </div>
                  <div class="text-xs text-[--muted-foreground] mt-1">
                    记录人：{{ rec.discoverer }} · 记录时间：{{ rec.createdAt }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- 新增弹窗 -->
        <BaseCard v-if="dialogOpen">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-base font-bold text-[--foreground]">新增新发现资源记录</span>
              <button class="text-[--muted-foreground] hover:text-[--text-main]" @click="dialogOpen = false">✕</button>
            </div>
          </template>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <BaseFormField v-model="form.resourceName" label="资源名称" placeholder="如：内标工作液优化浓度" />
              <BaseFormField v-model="form.resourceType" label="资源类型" type="select" :options="resourceTypeOptions" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <BaseFormField v-model="form.discoveryStage" label="发现阶段" type="select" :options="stageOptions" />
              <BaseFormField v-model="form.discoverer" label="记录人" placeholder="实验员姓名" />
            </div>
            <BaseFormField v-model="form.usage" label="用途" type="textarea" placeholder="该资源的用途说明" />
            <BaseFormField v-model="form.usageScenario" label="发现场景" type="textarea" placeholder="在什么实验环节中发现该资源" />
            <div class="flex gap-4">
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" v-model="form.isVerified" class="rounded border-[--border]" />
                <span>已验证</span>
              </label>
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" v-model="form.suggestInclusion" class="rounded border-[--border]" />
                <span>建议纳入资源池</span>
              </label>
            </div>
            <BaseFormField v-model="form.suggestion" label="建议内容" type="textarea" placeholder="如：建议纳入方法验证方案" />
          </div>

          <div class="flex justify-end gap-2 mt-4">
            <BaseButton variant="secondary" @click="dialogOpen = false">取消</BaseButton>
            <BaseButton variant="primary" @click="submitRecord">保存记录</BaseButton>
          </div>
        </BaseCard>
      </div>

      <div class="col-span-1 space-y-4">
        <BaseCard>
          <template #header>
            <span class="text-sm font-bold text-[--foreground]">发现统计</span>
          </template>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-[--muted-foreground]">已验证</span>
              <span class="font-semibold text-[--success]">{{ verifiedCount }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[--muted-foreground]">未验证</span>
              <span class="font-semibold text-[--warning]">{{ unverifiedCount }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[--muted-foreground]">建议纳入</span>
              <span class="font-semibold text-[--info]">{{ inclusionCount }}</span>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <template #header>
            <span class="text-sm font-bold text-[--foreground]">使用提示</span>
          </template>
          <div class="space-y-2 text-xs text-[--muted-foreground]">
            <p>在方法开发、验证或稳定性研究中，如发现原调配资源池未覆盖的资源，记录此发现。</p>
            <p>已验证的建议纳入记录，后续 SD 负责人可在资源调配时参考，更新调配资源池。</p>
            <p>新发现记录将作为项目知识资产保存，供后续类似计划参考。</p>
          </div>
        </BaseCard>

        <BaseCard>
          <template #header>
            <span class="text-sm font-bold text-[--foreground]">计划上下文</span>
          </template>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-[--muted-foreground]">计划编号</span>
              <span class="font-mono text-xs text-[--primary]">{{ planCode }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[--muted-foreground]">项目名称</span>
              <span class="font-medium text-[--text-main] truncate">{{ selectedProject?.name }}</span>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import StepWizard from '@/components/experiments/StepWizard.vue';
import { projects } from '@/api/mock/projects';
import { getDiscoveryRecords, getDiscoveryStageLabel } from '@/api/mock/resourceDiscovery';
import { DEMO_PLAN_CODE } from '@/api/mock/demoContext';
import type { Project } from '@/api/mock/projects';
import type { SDResourceType } from '@/types/experiments';
import type { ResourceDiscovery, DiscoveryStage } from '@/api/mock/resourceDiscovery';

const router = useRouter();
const route = useRoute();
const planCode = computed(() => String(route.query.planCode || DEMO_PLAN_CODE));
const projectId = computed(() => String(route.query.projectId || ''));

const selectedProject = computed<Project | null>(() => {
  const id = projectId.value;
  return id ? projects.find(p => p.id === id) ?? null : null;
});

const records = ref<ResourceDiscovery[]>(getDiscoveryRecords(planCode.value, projectId.value));
const dialogOpen = ref(false);

const form = ref({
  resourceName: '', resourceType: 'standard' as SDResourceType, discoveryStage: 'validation' as DiscoveryStage,
  discoverer: '', usage: '', usageScenario: '',
  isVerified: false, suggestInclusion: false, suggestion: '',
});

const resourceTypeOptions = [
  { label: '试剂', value: 'reagent' }, { label: '耗材', value: 'consumable' },
  { label: '设备', value: 'equipment' }, { label: '标准品', value: 'standard' },
  { label: '对照品', value: 'control' }, { label: '其他', value: 'other' },
];
const stageOptions = [
  { label: '方法开发', value: 'methodDev' }, { label: '方法验证', value: 'validation' },
  { label: '稳定性', value: 'stability' }, { label: '常规检测', value: 'routine' },
];

function resourceTypeLabel(t: SDResourceType): string {
  return { reagent: '试剂', consumable: '耗材', equipment: '设备', standard: '标准品', control: '对照品', other: '其他' }[t] ?? t;
}
function resourceTypeTone(t: SDResourceType): 'success' | 'info' | 'warning' | 'danger' | 'neutral' {
  return { reagent: 'info', consumable: 'neutral', equipment: 'warning', standard: 'success', control: 'success', other: 'neutral' }[t] ?? 'neutral';
}
function getStageLabel(s: DiscoveryStage): string { return getDiscoveryStageLabel(s); }

const verifiedCount = computed(() => records.value.filter(r => r.isVerified).length);
const unverifiedCount = computed(() => records.value.filter(r => !r.isVerified).length);
const inclusionCount = computed(() => records.value.filter(r => r.suggestInclusion).length);

function openAddDialog() {
  form.value = {
    resourceName: '', resourceType: 'standard', discoveryStage: 'validation',
    discoverer: '', usage: '', usageScenario: '',
    isVerified: false, suggestInclusion: false, suggestion: '',
  };
  dialogOpen.value = true;
}

function submitRecord() {
  if (!form.value.resourceName || !form.value.usage) {
    alert('请填写资源名称和用途');
    return;
  }
  dialogOpen.value = false;
  alert('记录已保存');
}

function backToWorkspace() {
  router.push({
    path: '/experiments/plans/new/forms',
    query: { planCode: planCode.value, projectId: projectId.value || 'PRJ001' },
  });
}

const steps = [
  { label: '选择项目', sub: '' },
  { label: '关联文件', sub: '' },
  { label: '选择考察项', sub: '' },
  { label: '表单编辑', sub: '' },
  { label: '新发现资源', sub: '记录实验中发现的新资源' },
];
</script>
