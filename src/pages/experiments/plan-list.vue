<template>
  <div class="space-y-5">
    <BasePageHeader title="实验计划列表" subtitle="实验负责人从 SD 已保存的项目进入，独立编辑实验计划">
      <template #extra>
        <BaseButton variant="secondary" @click="$router.push('/experiments/form-templates')">进入模板中心</BaseButton>
        <BaseButton variant="primary" @click="$router.push('/experiments/project-resource-allocation')">SD 项目资源调配</BaseButton>
      </template>
    </BasePageHeader>

    <BaseCard>
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <div>
            <span class="text-base font-bold text-[--foreground]">待编辑实验计划项目</span>
            <div class="text-xs text-[--muted-foreground] mt-0.5">SD 保存项目资源后，实验负责人从这里进入原实验计划编辑流程。</div>
          </div>
          <BaseTag label="实验负责人处理" tone="info" />
        </div>
      </template>
      <div class="space-y-2">
        <div
          v-for="project in readyProjects"
          :key="project.id"
          class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[--border] bg-[--surface-muted] px-4 py-3"
        >
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-semibold text-[--text-main]">{{ project.name }}</span>
              <BaseTag label="资源已保存" tone="success" />
            </div>
            <div class="mt-1 text-xs text-[--muted-foreground]">{{ project.code }} · {{ project.department }} · SD：{{ project.manager }}</div>
          </div>
          <BaseButton variant="primary" size="sm" @click="enterPlanEditor(project)">进入实验计划编辑</BaseButton>
        </div>
      </div>
    </BaseCard>

    <BaseSummaryCard :cards="summaryCards" />

    <BaseCard>
      <template #header>
        <span class="text-base font-bold text-[--foreground]">查询条件</span>
      </template>
      <div class="flex gap-3 flex-wrap items-end">
        <BaseFormField label="搜索" placeholder="计划编号 / 项目名称" v-model="search" style="flex:1;min-width:200px;" />
        <BaseFormField label="状态" type="select" :options="statusOptions" v-model="statusFilter" style="width:150px;" />
        <BaseButton variant="primary" size="sm">查询</BaseButton>
        <BaseButton variant="secondary" size="sm" @click="reset">重置</BaseButton>
      </div>
    </BaseCard>

    <BaseTable
      :data="filteredPlans"
      :columns="columns"
      :loading="loading"
      :pagination="{ page: page, total: filteredPlans.length, pages: 1 }"
      @page-change="page = $event"
      @row-click="viewPlan"
    >
      <template #cell-status="{ row }">
        <BaseTag :tone="statusTone(row.status)">{{ statusLabel(row.status) }}</BaseTag>
      </template>
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <button class="text-[--info] text-xs font-medium hover:underline" @click.stop="enterPlanEditorByPlan(row)">进入计划编辑</button>
          <button class="text-[--primary] text-xs font-medium hover:underline">发布</button>
          <button class="text-[--muted-foreground] text-xs hover:underline">查看任务</button>
          <button class="text-[--muted-foreground] text-xs hover:underline">复制</button>
        </div>
      </template>
    </BaseTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseSummaryCard from '@/components/base/BaseSummaryCard.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import { plans } from '@/api/mock/plans';
import { projects } from '@/api/mock/projects';
import type { Project } from '@/api/mock/projects';
import type { Plan, PlanStatus } from '@/types/experiments';

const router = useRouter();
const search = ref('');
const statusFilter = ref('');
const loading = ref(false);
const page = ref(1);

const statusOptions = [
  { label: '全部', value: '' },
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' },
  { label: '进行中', value: 'running' },
  { label: '已完成', value: 'done' },
];

const summaryCards = computed(() => [
  { label: '进行中', value: plans.filter(p => p.status === 'running').length },
  { label: '待执行', value: plans.filter(p => p.status === 'published').length },
  { label: '已完成', value: plans.filter(p => p.status === 'done').length },
  { label: '本月新建', value: '2' },
]);

const readyProjects = computed(() => projects.filter(p => p.status === 'active').slice(0, 3));

const columns = [
  { key: 'code', label: '计划编号' },
  { key: 'projectName', label: '关联项目' },
  { key: 'version', label: '方案版本' },
  { key: 'methodCode', label: '方法文件' },
  { key: 'responsiblePerson', label: '实验负责人' },
  { key: 'itemCount', label: '考察项数' },
  { key: 'status', label: '状态' },
  { key: 'createdAt', label: '创建时间' },
  { key: 'actions', label: '操作' },
];

function statusLabel(s: PlanStatus): string {
  const map: Record<string, string> = { draft: '草稿', published: '已发布', running: '进行中', done: '已完成' };
  return map[s] ?? s;
}
function statusTone(s: PlanStatus): 'neutral' | 'warning' | 'info' | 'success' {
  const map: Record<string, 'neutral' | 'warning' | 'info' | 'success'> = { draft: 'neutral', published: 'warning', running: 'info', done: 'success' };
  return map[s] ?? 'neutral';
}

const filteredPlans = computed(() =>
  plans.filter(p => {
    if (search.value && !p.code.includes(search.value) && !p.projectName.includes(search.value)) return false;
    if (statusFilter.value && p.status !== statusFilter.value) return false;
    return true;
  })
);

function viewPlan(row: Plan) {
  router.push({
    path: `/experiments/plans/${row.id}/tasks`,
    query: { planCode: row.code, projectId: '' },
  });
}
function enterPlanEditor(project: Project) {
  router.push({
    path: '/experiments/plans/new',
    query: {
      projectId: project.id,
      planCode: `PLAN-${project.code}-DRAFT`,
      step: '2',
    },
  });
}
function enterPlanEditorByPlan(plan: Plan) {
  const project = projects.find(p => p.name === plan.projectName || plan.projectName.includes(p.name.replace('项目', '')));
  router.push({
    path: '/experiments/plans/new',
    query: {
      projectId: project?.id ?? '',
      planCode: plan.code,
      step: project ? '2' : '1',
    },
  });
}
function reset() { search.value = ''; statusFilter.value = ''; }
</script>
