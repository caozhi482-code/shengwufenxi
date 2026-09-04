<template>
  <div class="space-y-5 pb-24">
    <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] px-5 py-4">
      <StepWizard :steps="steps" :current="7" />
    </div>

    <BasePageHeader
      title="任务分配"
      :subtitle="`${selectedProject?.name ?? '—'} · ${planCode}`"
    >
      <template #extra>
        <BaseButton variant="secondary" size="sm" @click="backToPublish">返回SD规划</BaseButton>
        <BaseButton variant="primary" size="sm" :disabled="!allTasksAssigned" @click="handlePublish">
          发布计划
        </BaseButton>
      </template>
    </BasePageHeader>

    <template v-if="!publishResult">
      <div class="grid grid-cols-3 gap-5">
        <div class="col-span-1 space-y-3">
          <BaseCard>
            <template #header>
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold text-[--foreground]">考察项</span>
                <span class="text-xs text-[--muted-foreground]">{{ assignedCount }}/{{ totalSubTasks }}</span>
              </div>
            </template>
            <div class="space-y-1.5">
              <button
                v-for="group in taskGroups"
                :key="group.item.id"
                type="button"
                class="w-full text-left rounded-lg border px-3 py-2.5 transition-all hover:border-[--primary-border]"
                :class="activeItemId === group.item.id
                  ? 'border-[--primary] bg-[--primary-soft]'
                  : groupAllAssigned(group)
                    ? 'border-[--success] bg-[--success-soft]'
                    : 'border-[--border] bg-white'"
                @click="activeItemId = group.item.id"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-mono text-[--muted-foreground]">{{ group.item.id }}</span>
                  <BaseTag
                    :label="`${groupAssignedCount(group)}/${group.subTasks.length}`"
                    :tone="groupAllAssigned(group) ? 'success' : 'neutral'"
                  />
                </div>
                <div class="text-sm font-medium text-[--text-main] truncate">{{ group.item.name }}</div>
              </button>
            </div>
          </BaseCard>

          <BaseCard>
            <template #header>
              <span class="text-sm font-bold text-[--foreground]">批量操作</span>
            </template>
            <div class="space-y-3 text-xs">
              <div>
                <div class="text-[--muted-foreground] mb-1.5">批量设置实验员（当前考察项）</div>
                <div class="flex flex-wrap gap-1.5">
                  <label
                    v-for="p in investigatorOptions"
                    :key="p.value"
                    class="inline-flex items-center gap-1 px-2 py-1 border rounded cursor-pointer transition-colors hover:bg-[--surface-muted]"
                    :class="batchAssign.investigators.includes(p.value) ? 'border-[--primary] bg-[--primary-soft] text-[--primary]' : 'border-[--border]'"
                  >
                    <BaseCheckbox :checked="batchAssign.investigators.includes(p.value)" @update:checked="v => toggleBatchField('investigators', p.value, v)" />
                    {{ p.label }}
                  </label>
                </div>
              </div>
              <BaseFormField
                label="现场复核人"
                type="select"
                :options="reviewerOptions"
                v-model="batchAssign.reviewer"
              />
              <BaseFormField
                label="审核人"
                type="select"
                :options="reviewerOptions"
                v-model="batchAssign.auditor"
              />
              <BaseFormField
                label="计划执行日期"
                type="date"
                v-model="batchAssign.planDate"
              />
              <div>
                <div class="text-[--muted-foreground] mb-1.5">批量设置仪器</div>
                <div class="flex flex-wrap gap-1.5">
                  <label
                    v-for="inst in instrumentOptions"
                    :key="inst.value"
                    class="inline-flex items-center gap-1 px-2 py-1 border rounded cursor-pointer transition-colors hover:bg-[--surface-muted]"
                    :class="batchAssign.instruments.includes(inst.value) ? 'border-[--primary] bg-[--primary-soft] text-[--primary]' : 'border-[--border]'"
                  >
                    <BaseCheckbox :checked="batchAssign.instruments.includes(inst.value)" @update:checked="v => toggleBatchField('instruments', inst.value, v)" />
                    {{ inst.label }}
                  </label>
                </div>
              </div>
              <BaseButton variant="secondary" size="sm" class="w-full" @click="applyBatch">
                应用到当前考察项所有任务
              </BaseButton>
            </div>
          </BaseCard>
        </div>

        <div class="col-span-2 space-y-4">
          <div
            v-for="group in taskGroups"
            :key="group.item.id"
            v-show="activeItemId === group.item.id"
            class="space-y-4"
          >
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-mono text-[--muted-foreground]">{{ group.item.id }}</span>
              <span class="text-sm font-bold text-[--text-main]">{{ group.item.name }}</span>
              <BaseTag :label="`${group.subTasks.length} 个任务`" tone="neutral" />
            </div>

            <div
              v-for="subTask in group.subTasks"
              :key="subTask.id"
              class="rounded-xl border border-[--border] bg-white overflow-hidden"
            >
              <div class="px-4 py-3 border-b border-[--border] bg-[--surface-muted] flex items-center justify-between">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-semibold text-sm text-[--text-main]">{{ subTask.taskName }}</span>
                  <BaseTag :label="subTask.templateCode" tone="info" />
                  <BaseTag :label="subTask.templateName" tone="neutral" />
                </div>
                <BaseTag
                  :label="subTaskStatusLabel(subTask)"
                  :tone="subTaskStatusTone(subTask)"
                />
              </div>

              <div class="px-4 py-4 space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-[--text-main] mb-1.5">
                      实验员 <span class="text-[--danger]">*</span>
                    </label>
                    <div class="flex flex-wrap gap-1.5">
                      <label
                        v-for="p in investigatorOptions"
                        :key="p.value"
                        class="inline-flex items-center gap-1 px-2 py-1 border rounded text-xs cursor-pointer transition-colors hover:bg-[--surface-muted]"
                        :class="subTask.executor.includes(p.value) ? 'border-[--primary] bg-[--primary-soft] text-[--primary]' : 'border-[--border]'"
                      >
                        <BaseCheckbox
                          :checked="subTask.executor.includes(p.value)"
                          @update:checked="v => toggleTaskField(subTask.id, 'executor', p.value, v)"
                        />
                        {{ p.label }}
                      </label>
                    </div>
                  </div>
                  <BaseFormField
                    label="现场复核人"
                    type="select"
                    :options="reviewerOptions"
                    v-model="subTask.reviewer"
                    class="col-span-1"
                  />
                  <BaseFormField
                    label="审核人"
                    type="select"
                    :options="reviewerOptions"
                    v-model="subTask.auditor"
                    class="col-span-1"
                  />
                  <BaseFormField
                    label="计划执行日期"
                    type="date"
                    v-model="subTask.planDate"
                    class="col-span-1"
                  />
                  <div class="col-span-1">
                    <label class="block text-xs font-semibold text-[--text-main] mb-1.5">
                      仪器 <span class="text-[--danger]">*</span>
                    </label>
                    <div class="flex flex-wrap gap-1.5">
                      <label
                        v-for="inst in instrumentOptions"
                        :key="inst.value"
                        class="inline-flex items-center gap-1 px-2 py-1 border rounded text-xs cursor-pointer transition-colors hover:bg-[--surface-muted]"
                        :class="subTask.instruments.includes(inst.value) ? 'border-[--primary] bg-[--primary-soft] text-[--primary]' : 'border-[--border]'"
                      >
                        <BaseCheckbox
                          :checked="subTask.instruments.includes(inst.value)"
                          @update:checked="v => toggleTaskField(subTask.id, 'instruments', inst.value, v)"
                        />
                        {{ inst.label }}
                      </label>
                    </div>
                  </div>
                  <BaseFormField
                    label="样本批次"
                    placeholder="输入批次号"
                    v-model="subTask.sampleBatch"
                    class="col-span-1"
                  />
                </div>

                <BaseFormField
                  label="备注"
                  type="textarea"
                  placeholder="可选备注信息"
                  v-model="subTask.remark"
                />

              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="sticky bottom-0 bg-white border-t border-[--border] px-5 py-3 flex items-center justify-between gap-3 z-10">
        <div class="text-xs text-[--muted-foreground]">
          已分配 {{ assignedCount }} / {{ totalSubTasks }} 个任务
          <span v-if="unassignedTasks.length > 0" class="text-[--warning] ml-2">
            还有 {{ unassignedTasks.length }} 个任务未分配
          </span>
        </div>
        <div class="flex items-center gap-2">
          <BaseButton variant="secondary" size="sm" @click="saveDraft">保存草稿</BaseButton>
          <BaseButton variant="primary" size="sm" :disabled="!allTasksAssigned" @click="handlePublish">
            发布计划
          </BaseButton>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="max-w-2xl mx-auto space-y-5">
        <BaseCard>
          <div class="text-center py-8 space-y-4">
            <div class="w-16 h-16 rounded-full bg-[--success] text-white flex items-center justify-center mx-auto text-2xl">✓</div>
            <div>
              <div class="text-lg font-bold text-[--text-main]">计划发布成功</div>
              <div class="text-sm text-[--muted-foreground] mt-1">
                实验计划 {{ planCode }} 已发布，共生成 {{ totalSubTasks }} 个任务
              </div>
            </div>
            <div class="grid grid-cols-3 gap-4 mt-6">
              <div class="bg-[--primary-soft] rounded-lg p-4">
                <div class="text-2xl font-bold text-[--primary]">{{ selectedItems.length }}</div>
                <div class="text-xs text-[--muted-foreground] mt-1">考察项</div>
              </div>
              <div class="bg-[--warning-soft] rounded-lg p-4">
                <div class="text-2xl font-bold text-[--warning]">{{ totalSubTasks }}</div>
                <div class="text-xs text-[--muted-foreground] mt-1">任务总数</div>
              </div>
              <div class="bg-[--success-soft] rounded-lg p-4">
                <div class="text-2xl font-bold text-[--success]">{{ assignedCount }}</div>
                <div class="text-xs text-[--muted-foreground] mt-1">已分配任务</div>
              </div>
            </div>
          </div>
        </BaseCard>

        <div class="flex justify-center gap-3">
          <BaseButton variant="secondary" size="sm" @click="backToWorkspace">返回工作台</BaseButton>
          <BaseButton variant="primary" size="sm" @click="goToTasks">查看任务列表</BaseButton>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseCheckbox from '@/components/base/BaseCheckbox.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import StepWizard from '@/components/experiments/StepWizard.vue';
import { evaluationItems } from '@/api/mock/evaluation';
import { projects } from '@/api/mock/projects';
import { formTemplates } from '@/api/mock/form-templates';
import type { EvaluationItem } from '@/api/mock/evaluation';
import type { FormTemplateRecord } from '@/types/experiments';

type PlanSubTask = {
  id: string;
  parentItemId: string;
  parentItemName: string;
  templateId: string;
  templateCode: string;
  templateName: string;
  templateVersion: string;
  instanceId: string;
  taskName: string;
  executor: string[];
  reviewer: string;
  auditor: string;
  planDate: string;
  instruments: string[];
  sampleBatch: string;
  executionSummary?: string[];
  remark: string;
  status: 'unassigned' | 'incomplete' | 'ready' | 'published';
};

type TaskGroup = {
  item: EvaluationItem;
  subTasks: PlanSubTask[];
  allAssigned: boolean;
};

type BatchAssign = {
  investigators: string[];
  reviewer: string;
  auditor: string;
  planDate: string;
  instruments: string[];
};

const router = useRouter();
const route = useRoute();

const steps = [
  { label: '选择项目', sub: '确定计划所属项目' },
  { label: '选择关联文件', sub: '选择方法 / 方案 / SOP' },
  { label: '选择考察项', sub: '确定本次计划范围' },
  { label: '选择模板表单', sub: '为考察项绑定表单模板' },
  { label: '编辑模板内容', sub: '编辑计划下模板实例' },
  { label: '确认创建', sub: '确认并创建实验计划' },
  { label: 'SD资源规划', sub: '规划试剂、耗材、设备等资源' },
  { label: '任务分配', sub: '为每个任务分配执行资源' },
];

const parseSingle = (value: unknown): string =>
  Array.isArray(value) ? value[0] ?? '' : typeof value === 'string' ? value : '';

const parseList = (value: unknown): string[] => {
  const raw = parseSingle(value);
  return raw ? raw.split(',').map(v => v.trim()).filter(Boolean) : [];
};

const parseTemplatePairs = (value: unknown): Array<{ itemId: string; templateId: string }> =>
  parseList(value).map(pair => {
    const [itemId, templateId] = pair.split(':');
    return { itemId: itemId?.trim() ?? '', templateId: templateId?.trim() ?? '' };
  }).filter(p => p.itemId && p.templateId);

const planCode = computed(() => parseSingle(route.query.planCode) || 'PLAN-DRAFT');
const projectId = computed(() => parseSingle(route.query.projectId));
const itemIds = computed(() => parseList(route.query.itemIds));
const templateIds = computed(() => parseTemplatePairs(route.query.templateIds));

const selectedProject = computed(() => {
  const id = projectId.value;
  return id ? projects.find(p => p.id === id) ?? null : null;
});

const selectedItems = computed<EvaluationItem[]>(() =>
  evaluationItems.filter(item => itemIds.value.includes(item.id))
);

const investigatorOptions = computed(() => [
  { value: '张明', label: '张明' },
  { value: '李华', label: '李华' },
  { value: '王芳', label: '王芳' },
  { value: '刘洋', label: '刘洋' },
  { value: '孙丽', label: '孙丽' },
  { value: '周伟', label: '周伟' },
]);

const reviewerOptions = computed(() => [
  { value: '武琴', label: '武琴（主管）' },
  { value: '陈明', label: '陈明（主管）' },
  { value: '李华', label: '李华' },
]);

const instrumentOptions = computed(() => [
  { value: 'LC-MS/MS-001', label: 'LC-MS/MS-001' },
  { value: 'LC-MS/MS-002', label: 'LC-MS/MS-002' },
  { value: 'GC-MS-001', label: 'GC-MS-001' },
  { value: 'HPLC-001', label: 'HPLC-001' },
]);

const taskGroups = ref<TaskGroup[]>([]);
const activeItemId = ref<string | null>(null);
const batchAssign = ref<BatchAssign>({
  investigators: [],
  reviewer: '',
  auditor: '',
  planDate: '',
  instruments: [],
});
const publishResult = ref(false);

function buildSubTasks() {
  const groups: TaskGroup[] = [];
  let globalSeq = 1;
  for (const item of selectedItems.value) {
    const itemTemplatePairs = templateIds.value.filter(p => p.itemId === item.id);
    if (itemTemplatePairs.length === 0) continue;
    const subTasks: PlanSubTask[] = [];
    for (const pair of itemTemplatePairs) {
      const template = formTemplates.find(t => t.id === pair.templateId);
      if (!template) continue;
      const instanceId = `${planCode.value}-${item.id.replace(/\./g, '')}-${template.id}-INS`;
      subTasks.push({
        id: `TASK-${planCode.value.replace(/-/g, '')}-${String(globalSeq).padStart(2, '0')}`,
        parentItemId: item.id,
        parentItemName: item.name,
        templateId: template.id,
        templateCode: template.templateCode,
        templateName: template.templateName,
        templateVersion: template.version,
        instanceId,
        taskName: `${item.name} · ${template.templateName}`,
        executor: [],
        reviewer: '',
        auditor: '',
        planDate: '',
        instruments: [],
        sampleBatch: '',
        remark: '',
        status: 'unassigned' as const,
      });
      globalSeq++;
    }
    if (subTasks.length === 0) continue;
    groups.push({
      item,
      subTasks,
      allAssigned: false,
    });
  }
  taskGroups.value = groups;
  if (!activeItemId.value && groups.length > 0) {
    activeItemId.value = groups[0].item.id;
  }
}

function isTaskComplete(task: PlanSubTask): boolean {
  return !!(task.executor.length > 0 && task.reviewer && task.auditor && task.planDate && task.instruments.length > 0 && task.sampleBatch);
}

function updateTaskStatus(task: PlanSubTask) {
  task.status = isTaskComplete(task) ? 'ready' : (task.executor.length > 0 ? 'incomplete' : 'unassigned');
}

function subTaskStatusLabel(task: PlanSubTask): string {
  return isTaskComplete(task) ? '可发布' : '待分配';
}

function subTaskStatusTone(task: PlanSubTask): 'success' | 'warning' | 'danger' | 'neutral' {
  return isTaskComplete(task) ? 'success' : 'warning';
}

const assignedCount = computed(() =>
  taskGroups.value.reduce((sum, g) => sum + g.subTasks.filter(t => isTaskComplete(t)).length, 0)
);

function groupAssignedCount(group: TaskGroup): number {
  return group.subTasks.filter(task => isTaskComplete(task)).length;
}

function groupAllAssigned(group: TaskGroup): boolean {
  return group.subTasks.length > 0 && groupAssignedCount(group) === group.subTasks.length;
}

const totalSubTasks = computed(() =>
  taskGroups.value.reduce((sum, g) => sum + g.subTasks.length, 0)
);

const allTasksAssigned = computed(() =>
  assignedCount.value === totalSubTasks.value && totalSubTasks.value > 0
);

const unassignedTasks = computed(() =>
  taskGroups.value.flatMap(g =>
    g.subTasks.filter(t => !isTaskComplete(t)).map(t => ({ item: g.item, task: t }))
  )
);

function toggleTaskField(
  taskId: string,
  field: 'executor' | 'instruments',
  value: string,
  checked: boolean
) {
  for (const group of taskGroups.value) {
    for (const task of group.subTasks) {
      if (task.id !== taskId) continue;
      const arr = task[field] as string[];
      const idx = arr.indexOf(value);
      if (checked) {
        if (idx < 0) arr.push(value);
      } else {
        if (idx >= 0) arr.splice(idx, 1);
      }
      updateTaskStatus(task);
    }
  }
}

function toggleBatchField(field: keyof BatchAssign, value: string, checked?: boolean) {
  const arr = batchAssign.value[field] as string[];
  const idx = arr.indexOf(value);
  const nextChecked = checked ?? idx < 0;
  if (nextChecked) {
    if (idx < 0) arr.push(value);
  } else if (idx >= 0) {
    arr.splice(idx, 1);
  }
  batchAssign.value = { ...batchAssign.value };
}

function applyBatch() {
  const group = taskGroups.value.find(g => g.item.id === activeItemId.value);
  if (!group) return;
  for (const task of group.subTasks) {
    if (batchAssign.value.investigators.length > 0) {
      task.executor = [...batchAssign.value.investigators];
    }
    if (batchAssign.value.reviewer) task.reviewer = batchAssign.value.reviewer;
    if (batchAssign.value.auditor) task.auditor = batchAssign.value.auditor;
    if (batchAssign.value.planDate) task.planDate = batchAssign.value.planDate;
    if (batchAssign.value.instruments.length > 0) {
      task.instruments = [...batchAssign.value.instruments];
    }
    updateTaskStatus(task);
  }
  group.allAssigned = groupAllAssigned(group);
}

function handlePublish() {
  if (!allTasksAssigned.value) return;
  for (const group of taskGroups.value) {
    for (const task of group.subTasks) {
      task.status = 'published';
    }
  }
  publishResult.value = true;
}

function saveDraft() {
  alert('草稿已保存（模拟）');
}

function backToPublish() {
  router.push({
    path: '/experiments/plans/new/publish',
    query: {
      planCode: planCode.value,
      projectId: projectId.value,
      itemIds: itemIds.value.join(','),
      ...(templateIds.value.length > 0 ? { templateIds: templateIds.value.map(p => `${p.itemId}:${p.templateId}`).join(',') } : {}),
    },
  });
}

function backToWorkspace() {
  const group = taskGroups.value.find(item => item.item.id === activeItemId.value);
  const firstTask = group?.subTasks[0];
  router.push({
    path: group
      ? `/experiments/plans/${encodeURIComponent(planCode.value)}/items/${encodeURIComponent(group.item.id)}/forms`
      : '/experiments/plans/new/forms',
    query: {
      planCode: planCode.value,
      projectId: projectId.value,
      itemIds: itemIds.value.join(','),
      ...(group ? { activeItemId: group.item.id } : {}),
      ...(firstTask ? { instanceId: firstTask.instanceId, currentTemplateId: firstTask.templateId } : {}),
      ...(templateIds.value.length > 0 ? { templateIds: templateIds.value.map(p => `${p.itemId}:${p.templateId}`).join(',') } : {}),
    },
  });
}

function goToTasks() {
  router.push({
    path: `/experiments/plans/${planCode.value}/tasks`,
    query: { planCode: planCode.value, projectId: projectId.value || '' },
  });
}

watch([selectedItems, templateIds], () => {
  buildSubTasks();
}, { immediate: true });
</script>
