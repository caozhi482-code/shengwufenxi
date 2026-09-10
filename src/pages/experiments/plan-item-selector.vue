<template>
  <div class="space-y-5 pb-24">
    <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] px-5 py-4">
      <StepWizard :steps="steps" :current="2" />
    </div>

    <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] p-4 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="text-sm font-bold text-[--foreground]">关联文件后的考察项选择</div>
          <div class="text-xs text-[--muted-foreground] mt-1">主流程只选择考察项名称，详细配置请进入考察项维护。</div>
        </div>
        <div class="flex flex-wrap gap-2">
          <BaseButton variant="secondary" size="sm" @click="openCreateDrawer">新增考察项</BaseButton>
          <BaseButton variant="secondary" size="sm" @click="openMaintainDrawer()">考察项维护</BaseButton>
          <BaseButton variant="secondary" size="sm" @click="backToFiles">上一步</BaseButton>
          <BaseButton variant="secondary" size="sm" @click="saveDraft">保存草稿</BaseButton>
          <BaseButton variant="primary" size="sm" :disabled="!canContinue" @click="goNext">下一步</BaseButton>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-3 text-sm">
        <div class="rounded-lg border border-[--border] bg-[--surface-muted] p-3">
          <div class="text-xs text-[--muted-foreground]">项目名称</div>
          <div class="font-semibold text-[--text-main] mt-1 truncate">{{ selectedProject?.name ?? '未选择项目' }}</div>
        </div>
        <div class="rounded-lg border border-[--border] bg-[--surface-muted] p-3">
          <div class="text-xs text-[--muted-foreground]">项目编号</div>
          <div class="font-mono text-xs font-semibold text-[--primary] mt-1 truncate">{{ selectedProject?.code ?? '—' }}</div>
        </div>
        <div class="rounded-lg border border-[--border] bg-[--surface-muted] p-3">
          <div class="text-xs text-[--muted-foreground]">计划编号</div>
          <div class="font-mono text-xs font-semibold text-[--primary] mt-1 truncate">{{ planCode }}</div>
        </div>
        <div class="rounded-lg border border-[--primary-border] bg-[--primary-soft] p-3">
          <div class="text-xs text-[--muted-foreground]">SD已确认文件</div>
          <div class="flex items-center gap-2 mt-1">
            <div class="font-semibold text-[--text-main]">{{ selectedFiles.length }} 份</div>
            <BaseTag label="SD已确认" tone="success" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="!selectedProject || selectedFiles.length === 0" class="grid grid-cols-4 gap-5">
      <div class="col-span-3">
        <BaseCard>
          <template #header>
            <span class="text-base font-bold text-[--foreground]">无法继续</span>
          </template>
          <div class="py-12 text-center space-y-3">
            <div class="text-3xl">📎</div>
            <div class="text-sm font-medium text-[--text-main]">请先返回选择关联文件</div>
            <div class="text-xs text-[--muted-foreground]">没有已选文件时，无法进入考察项选择。</div>
            <BaseButton variant="primary" @click="backToFiles">返回文件选择</BaseButton>
          </div>
        </BaseCard>
      </div>
      <div class="col-span-1">
        <BaseCard>
          <template #header>
            <span class="text-sm font-bold text-[--foreground]">上下文摘要</span>
          </template>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">步骤</span>
              <span class="font-medium text-[--text-main]">选择考察项</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">文件状态</span>
              <span class="font-medium text-[--success]">● SD已确认</span>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <div v-else class="grid grid-cols-4 gap-5">
      <div class="col-span-3 space-y-4">
        <BaseCard>
          <template #header>
            <div class="flex flex-wrap items-end justify-end gap-3">
              <div class="grid min-w-[360px] grid-cols-[1fr_auto] items-end gap-2">
                <BaseFormField v-model="keyword" label="搜索考察项名称" placeholder="输入考察项名称" class="min-w-[260px]" />
                <BaseButton variant="secondary" size="sm" class="shrink-0" @click="keyword = ''">重置</BaseButton>
              </div>
            </div>
          </template>

          <div class="mb-4 rounded-lg border border-[--border] bg-[--primary-soft] px-4 py-3 text-xs text-[--text-main]">
            当前区域只用于快速选择考察项名称；接受标准、类型、模板、启用状态等维护信息请通过“考察项维护”查看或编辑。
          </div>

          <div v-if="filteredItems.length === 0" class="py-14 text-center text-[--muted-foreground] text-sm">
            没有匹配的启用考察项
          </div>

          <div v-else class="space-y-2">
            <label
              v-for="item in filteredItems"
              :key="item.id"
              class="flex items-center justify-between gap-4 rounded-lg border border-[--border] bg-white px-4 py-3 transition-all hover:border-[--border-strong] hover:bg-[--surface-muted]"
              :class="selectedIds.includes(item.id) ? 'border-[--primary] bg-[--primary-soft]' : ''"
            >
              <div class="flex min-w-0 items-center gap-3">
                <input
                  type="checkbox"
                  class="h-4 w-4 accent-[--primary]"
                  :checked="selectedIds.includes(item.id)"
                  @change="toggleItem(item.id)"
                />
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-[--text-main] truncate">{{ item.name }}</div>
                </div>
              </div>
              <button type="button" class="shrink-0 text-xs text-[--primary] hover:underline" @click.stop="openDetailDrawer(item)">查看详情</button>
            </label>
          </div>
        </BaseCard>
      </div>

      <div class="col-span-1 space-y-4">
        <BaseCard>
          <template #header>
            <span class="text-sm font-bold text-[--foreground]">项目摘要</span>
          </template>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">项目名称</span>
              <span class="font-medium text-[--text-main] text-right truncate">{{ selectedProject?.name }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">项目编号</span>
              <span class="font-mono text-xs font-semibold text-[--primary]">{{ selectedProject?.code }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">研究方向</span>
              <span class="font-medium text-[--text-main]">{{ selectedProject?.researchArea }}</span>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-bold text-[--foreground]">SD已确认关联文件</span>
              <span class="text-xs text-[--muted-foreground]">{{ selectedFiles.length }} 份（只读）</span>
            </div>
          </template>
          <div class="space-y-2 text-xs">
            <div v-for="group in groupedFiles" :key="group.type" class="rounded-lg border border-[--border] bg-[--surface-muted] p-3 space-y-2">
              <div class="flex items-center justify-between gap-2">
                <BaseTag :label="group.label" tone="neutral" />
                <span class="text-[--muted-foreground]">{{ group.files.length }} 份</span>
              </div>
              <div v-for="file in group.files" :key="file.id" class="space-y-1 rounded-md bg-white px-2 py-2">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-mono font-semibold text-[--primary]">{{ file.code }}</span>
                  <BaseTag :label="file.status === 'deprecated' ? '已废止' : '现行'" :tone="file.status === 'deprecated' ? 'danger' : 'success'" />
                </div>
                <div class="text-[--text-main] font-medium truncate">{{ file.name }}</div>
                <div class="text-[--muted-foreground]">{{ file.version }} · {{ file.publishDate }}</div>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-bold text-[--foreground]">考察项摘要</span>
              <span class="text-xs text-[--muted-foreground]">{{ selectedItems.length }} / {{ filteredTotal }}</span>
            </div>
          </template>
          <div class="space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-[--muted-foreground]">已选考察项</span>
              <span class="font-semibold text-[--text-main]">{{ selectedItems.length }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-[--muted-foreground]">启用考察项</span>
              <span class="font-semibold text-[--text-main]">{{ enabledItemCount }}</span>
            </div>
            <div class="text-xs text-[--muted-foreground]">下一步将基于已选名称进入模板表单配置。</div>
          </div>
        </BaseCard>

        <BaseCard>
          <template #header>
            <span class="text-sm font-bold text-[--foreground]">分析批</span>
          </template>
          <div v-if="currentBatch" class="space-y-2 text-xs">
            <div class="flex items-center gap-2">
              <span class="font-mono font-semibold text-[--primary]">{{ currentBatch.id }}</span>
              <BaseTag :label="batchStatusLabels[currentBatch.status].label" :tone="batchStatusLabels[currentBatch.status].tone" />
            </div>
            <div class="font-medium text-[--text-main]">{{ currentBatch.name }}</div>
            <div class="text-[--muted-foreground]">关联考察项：{{ currentBatch.itemIds.length }} 个 · 计划执行：{{ currentBatch.plannedDate || '待定' }}</div>
          </div>
          <div v-else class="text-xs text-[--muted-foreground] py-2">尚未指定分析批</div>
        </BaseCard>

        <BaseCard>
          <template #header>
            <span class="text-sm font-bold text-[--foreground]">上下文</span>
          </template>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">当前步骤</span>
              <span class="font-medium text-[--text-main]">考察项选择</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">文件状态</span>
              <span class="font-medium text-[--text-main]"><span class="text-[--success]">● SD已确认</span> <span class="ml-1 text-[--muted-foreground]">{{ selectedFiles.length }} 份已关联</span></span>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <BaseDrawer v-if="showDetailDrawer && detailItem" :open="showDetailDrawer && !!detailItem" title="考察项详情" @close="closeDetailDrawer">
      <div class="space-y-3 text-sm">
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-lg border border-[--border] bg-[--surface-muted] p-3">
            <div class="text-xs text-[--muted-foreground]">考察项名称</div>
            <div class="font-semibold text-[--text-main] mt-1">{{ detailItem.name }}</div>
          </div>
          <div class="rounded-lg border border-[--border] bg-[--surface-muted] p-3">
            <div class="text-xs text-[--muted-foreground]">考察项编号</div>
            <div class="font-mono text-xs font-semibold text-[--primary] mt-1">{{ detailItem.id }}</div>
          </div>
        </div>
        <div><span class="font-semibold text-[--text-main]">考察项类型：</span>{{ detailItem.type }}</div>
        <div><span class="font-semibold text-[--text-main]">接受标准：</span>{{ detailItem.acceptance }}</div>
        <div><span class="font-semibold text-[--text-main]">关联表单模板：</span>{{ detailItem.formTemplate || '—' }}</div>
        <div><span class="font-semibold text-[--text-main]">是否启用：</span>{{ detailItem.enabled ? '启用' : '停用' }}</div>
        <div><span class="font-semibold text-[--text-main]">备注：</span>{{ detailItem.note || '—' }}</div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="closeDetailDrawer">关闭</BaseButton>
          <BaseButton variant="primary" @click="openMaintainDrawer(detailItem ?? undefined)">编辑</BaseButton>
      </template>
    </BaseDrawer>

    <BaseDrawer v-if="showCreateDrawer" :open="showCreateDrawer" title="新增考察项" @close="closeCreateDrawer">
      <div class="space-y-4">
        <div class="rounded-lg border border-[--border] bg-[--surface-muted] px-3 py-2 text-xs text-[--muted-foreground]">
          仅填写最少必要信息，保存后会自动加入当前可选列表并默认选中。
        </div>
        <div class="grid grid-cols-2 gap-3">
          <BaseFormField v-model="createForm.name" label="考察项名称" placeholder="请输入考察项名称" required :error="createErrors.name" />
          <BaseFormField v-model="createForm.id" label="考察项编号" placeholder="请输入考察项编号" required :error="createErrors.id" />
          <BaseFormField
            v-model="createForm.formTemplate"
            label="默认表单模板"
            type="select"
            placeholder="可选"
            :options="formTemplateOptions"
            class="col-span-2"
          />
        </div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="closeCreateDrawer">取消</BaseButton>
        <BaseButton variant="primary" :disabled="!canCreate" @click="saveCreateItem">保存</BaseButton>
      </template>
    </BaseDrawer>

    <BaseDrawer v-if="showMaintainDrawer" :open="showMaintainDrawer" title="考察项维护" @close="closeMaintainDrawer">
      <div class="grid grid-cols-[220px_1fr] gap-4 min-h-[420px]">
        <div class="space-y-2">
          <div class="text-xs font-semibold text-[--muted-foreground]">现有考察项</div>
          <div class="max-h-[360px] overflow-y-auto divide-y divide-[--border] rounded-lg border border-[--border] bg-white">
            <button
              v-for="item in allItems"
              :key="item.id"
              type="button"
              class="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-[--surface-muted]"
              :class="maintainOriginalId === item.id ? 'bg-[--primary-soft]' : 'bg-white'"
              @click="loadMaintainItem(item)"
            >
              <span class="truncate text-sm font-medium text-[--text-main]">{{ item.name }}</span>
              <BaseTag :label="item.enabled ? '启用' : '停用'" :tone="item.enabled ? 'success' : 'neutral'" />
            </button>
          </div>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <BaseFormField v-model="maintainForm.name" label="考察项名称" placeholder="请输入考察项名称" required :error="maintainErrors.name" />
            <BaseFormField v-model="maintainForm.id" label="考察项编号" placeholder="请输入考察项编号" required :error="maintainErrors.id" />
            <BaseFormField v-model="maintainForm.type" label="考察项类型" placeholder="请输入考察项类型" />
            <BaseFormField v-model="maintainForm.formTemplate" label="关联表单模板" type="select" placeholder="可选" :options="formTemplateOptions" />
            <BaseFormField v-model="maintainForm.acceptance" label="接受标准" placeholder="请输入接受标准" class="col-span-2" />
            <BaseFormField v-model="maintainForm.enabled" label="是否启用" type="select" :options="enabledOptions" />
            <BaseFormField v-model="maintainForm.note" label="备注" type="textarea" placeholder="请输入备注" class="col-span-2" />
          </div>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="closeMaintainDrawer">取消</BaseButton>
        <BaseButton variant="primary" :disabled="!canMaintain" @click="saveMaintainItem">保存</BaseButton>
      </template>
    </BaseDrawer>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import BaseDrawer from '@/components/base/BaseDrawer.vue';
import StepWizard from '@/components/experiments/StepWizard.vue';
import { evaluationItems } from '@/api/mock/evaluation';
import { files, getFilesByProject, getFileTypeLabel } from '@/api/mock/files';
import { projects } from '@/api/mock/projects';
import { formTemplates } from '@/api/mock/methods';
import { getBatchesByPlan, batchStatusLabels } from '@/api/mock/batches';
import type { EvaluationItem } from '@/api/mock/evaluation';
import type { FileItem, FileType } from '@/api/mock/files';
import type { Project } from '@/api/mock/projects';
import type { AnalysisBatch } from '@/api/mock/batches';
import { DEMO_PLAN_CODE } from '@/api/mock/demoContext';

type MaintainableItem = EvaluationItem & { enabled: boolean; note: string };
type ItemErrors = { name: string; id: string };

const router = useRouter();
const route = useRoute();

const steps = [
  { label: '选择管理项目', sub: '先选择计划所属项目' },
  { label: '选择关联文件', sub: '按项目选择 SOP / 方法 / 方案' },
  { label: '选择考察项', sub: '基于文件推荐并补选考察项' },
  { label: '加样序列表模板', sub: '为考察项配置 96 孔模板' },
  { label: '选择表单模板', sub: '继续完成表单绑定' },
];

const keyword = ref('');
const selectedIds = ref<string[]>(parseList(route.query.itemIds));
const allItems = ref<MaintainableItem[]>(evaluationItems.map(item => ({ ...item, enabled: true, note: '' })));
const showDetailDrawer = ref(false);
const showCreateDrawer = ref(false);
const showMaintainDrawer = ref(false);
const detailItem = ref<MaintainableItem | null>(null);
const createAttempted = ref(false);
const maintainAttempted = ref(false);
const maintainOriginalId = ref('');
const createForm = reactive({
  name: '',
  id: '',
  formTemplate: '',
});
const maintainForm = reactive({
  id: '',
  name: '',
  type: '',
  acceptance: '',
  formTemplate: '',
  enabled: 'true',
  note: '',
});

const projectId = computed(() => parseSingle(route.query.projectId));
const fileIds = computed(() => parseList(route.query.fileIds));
const itemIds = computed(() => parseList(route.query.itemIds));
const templateIds = computed(() => parseSingle(route.query.templateIds));
const activeItemId = computed(() => parseSingle(route.query.activeItemId));
const currentTemplateId = computed(() => parseSingle(route.query.currentTemplateId));
const instanceId = computed(() => parseSingle(route.query.instanceId));
const batchId = computed(() => parseSingle(route.query.batchId));
const planCode = computed(() => parseSingle(route.query.planCode) || (selectedProject.value ? `PLAN-${selectedProject.value.code}-DRAFT` : DEMO_PLAN_CODE));

const currentBatch = computed<AnalysisBatch | null>(() => {
  if (!batchId.value) return null;
  const batch = getBatchesByPlan(planCode.value).find(b => b.id === batchId.value);
  return batch ?? null;
});
const allBatches = computed<AnalysisBatch[]>(() => getBatchesByPlan(planCode.value));

const selectedProject = computed<Project | null>(() => {
  const id = projectId.value;
  return id ? projects.find(p => p.id === id) ?? null : null;
});

const selectedFiles = computed<FileItem[]>(() => {
  const ids = new Set(fileIds.value);
  const base = selectedProject.value ? getFilesByProject(selectedProject.value.id) : files;
  return base.filter(file => ids.has(file.id));
});

const enabledItems = computed(() => allItems.value.filter(item => item.enabled));
const enabledItemCount = computed(() => enabledItems.value.length);
const selectedItems = computed(() => allItems.value.filter(item => selectedIds.value.includes(item.id)));
const filteredTotal = computed(() => enabledItems.value.length);
const canContinue = computed(() => !!selectedProject.value && selectedFiles.value.length > 0 && selectedIds.value.length > 0);
const canCreate = computed(() => createForm.name.trim() !== '' && createForm.id.trim() !== '');
const canMaintain = computed(() => maintainForm.name.trim() !== '' && maintainForm.id.trim() !== '');

const createErrors = computed<ItemErrors>(() => createAttempted.value ? validateItem(createForm.name, createForm.id) : emptyErrors());
const maintainErrors = computed<ItemErrors>(() => maintainAttempted.value ? validateItem(maintainForm.name, maintainForm.id, maintainOriginalId.value) : emptyErrors());

const filteredItems = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  return enabledItems.value.filter((item) => {
    if (!q) return true;
    return item.name.toLowerCase().includes(q);
  });
});

const groupedFiles = computed(() => {
  const groups: { type: FileType; label: string; files: FileItem[] }[] = [];
  ['protocol', 'method', 'sop'].forEach((type) => {
    const typedFiles = selectedFiles.value.filter(file => file.type === type);
    if (typedFiles.length > 0) {
      groups.push({ type: type as FileType, label: getFileTypeLabel(type as FileType), files: typedFiles });
    }
  });
  return groups;
});

const formTemplateOptions = computed(() => formTemplates.map(template => ({ label: template.name, value: template.name })));
const enabledOptions = [
  { label: '启用', value: 'true' },
  { label: '停用', value: 'false' },
];

watch(allItems, () => {
  const enabledIdSet = new Set(enabledItems.value.map(item => item.id));
  selectedIds.value = selectedIds.value.filter(id => enabledIdSet.has(id));
}, { deep: true });

function parseSingle(value: unknown): string {
  return Array.isArray(value) ? value[0] ?? '' : typeof value === 'string' ? value : '';
}

function parseList(value: unknown): string[] {
  const raw = parseSingle(value);
  return raw ? raw.split(',').map(v => v.trim()).filter(Boolean) : [];
}

function emptyErrors(): ItemErrors {
  return { name: '', id: '' };
}

function validateItem(name: string, id: string, excludeId = ''): ItemErrors {
  const result = emptyErrors();
  const trimmedName = name.trim();
  const trimmedId = id.trim();

  if (!trimmedName) {
    result.name = '请输入考察项名称';
  } else if (allItems.value.some(item => item.id !== excludeId && item.name.trim() === trimmedName)) {
    result.name = '考察项名称不能重复';
  }

  if (!trimmedId) {
    result.id = '请输入考察项编号';
  } else if (allItems.value.some(item => item.id !== excludeId && item.id.trim() === trimmedId)) {
    result.id = '考察项编号不能重复';
  }

  return result;
}

function toggleItem(itemId: string) {
  const ids = selectedIds.value;
  const idx = ids.indexOf(itemId);
  if (idx >= 0) {
    selectedIds.value = ids.filter(i => i !== itemId);
  } else {
    selectedIds.value = [...ids, itemId];
  }
}

function selectAllVisible() {
  const merged = new Set([...selectedIds.value, ...filteredItems.value.map(item => item.id)]);
  selectedIds.value = Array.from(merged);
}

function clearSelected() {
  selectedIds.value = [];
}

function openDetailDrawer(item: MaintainableItem) {
  detailItem.value = item;
  showDetailDrawer.value = true;
  showCreateDrawer.value = false;
  showMaintainDrawer.value = false;
}

function closeDetailDrawer() {
  showDetailDrawer.value = false;
  detailItem.value = null;
}

function openCreateDrawer() {
  resetCreateForm();
  createAttempted.value = false;
  showDetailDrawer.value = false;
  showMaintainDrawer.value = false;
  showCreateDrawer.value = true;
}

function closeCreateDrawer() {
  showCreateDrawer.value = false;
  createAttempted.value = false;
  resetCreateForm();
}

function openMaintainDrawer(item?: MaintainableItem) {
  const target = item ?? allItems.value[0];
  if (!target) return;
  loadMaintainItem(target);
  maintainAttempted.value = false;
  showDetailDrawer.value = false;
  showCreateDrawer.value = false;
  showMaintainDrawer.value = true;
}

function closeMaintainDrawer() {
  showMaintainDrawer.value = false;
  maintainAttempted.value = false;
}

function resetCreateForm() {
  createForm.name = '';
  createForm.id = nextItemId();
  createForm.formTemplate = '';
}

function loadMaintainItem(item: MaintainableItem) {
  maintainOriginalId.value = item.id;
  maintainForm.id = item.id;
  maintainForm.name = item.name;
  maintainForm.type = item.type;
  maintainForm.acceptance = item.acceptance;
  maintainForm.formTemplate = item.formTemplate;
  maintainForm.enabled = item.enabled ? 'true' : 'false';
  maintainForm.note = item.note;
}

function saveCreateItem() {
  createAttempted.value = true;
  const errors = validateItem(createForm.name, createForm.id);
  if (errors.name || errors.id) return;

  const id = createForm.id.trim();
  const name = createForm.name.trim();
  const formTemplate = createForm.formTemplate.trim();
  const item: MaintainableItem = {
    id,
    name,
    type: '未分类',
    acceptance: '待维护',
    levels: 1,
    replicates: 1,
    formTemplate,
    stepTemplate: '待配置',
    formTemplates: formTemplate ? [formTemplate] : [],
    enabled: true,
    note: '',
  };

  allItems.value.push(item);
  if (!selectedIds.value.includes(id)) {
    selectedIds.value.push(id);
  }
  detailItem.value = item;
  closeCreateDrawer();
}

function saveMaintainItem() {
  maintainAttempted.value = true;
  const originalId = maintainOriginalId.value;
  const errors = validateItem(maintainForm.name, maintainForm.id, originalId);
  if (errors.name || errors.id) return;

  const nextId = maintainForm.id.trim();
  const index = allItems.value.findIndex(item => item.id === originalId);
  if (index < 0) return;

  const existing = allItems.value[index];
  const nextItem: MaintainableItem = {
    ...existing,
    id: nextId,
    name: maintainForm.name.trim(),
    type: maintainForm.type.trim() || '未分类',
    acceptance: maintainForm.acceptance.trim() || '待维护',
    formTemplate: maintainForm.formTemplate.trim(),
    formTemplates: maintainForm.formTemplate.trim() ? [maintainForm.formTemplate.trim()] : [],
    enabled: maintainForm.enabled === 'true',
    note: maintainForm.note.trim(),
  };

  allItems.value[index] = nextItem;
  if (originalId !== nextId) {
    selectedIds.value = selectedIds.value.map(id => id === originalId ? nextId : id);
  }
  if (detailItem.value?.id === originalId) {
    detailItem.value = nextItem;
  }
  closeMaintainDrawer();
}

function nextItemId(): string {
  const max = allItems.value.reduce((current, item) => {
    const parsed = Number(item.id.replace(/^4\./, ''));
    return Number.isFinite(parsed) ? Math.max(current, parsed) : current;
  }, 15);
  return `4.${max + 1}`;
}

function saveDraft() {
  alert('草稿已保存');
  router.push('/experiments/plans');
}

function goNext() {
  if (!canContinue.value) return;
  router.push({
    path: '/experiments/plans/new/forms',
    query: {
      planCode: planCode.value,
      projectId: selectedProject.value?.id ?? 'PRJ001',
      fileIds: selectedFiles.value.map(file => file.id).join(','),
      itemIds: selectedItems.value.map(item => item.id).join(','),
      batchId: batchId.value,
      ...(templateIds.value ? { templateIds: templateIds.value } : {}),
      ...(activeItemId.value ? { activeItemId: activeItemId.value } : {}),
      ...(currentTemplateId.value ? { currentTemplateId: currentTemplateId.value } : {}),
      ...(instanceId.value ? { instanceId: instanceId.value } : {}),
    },
  });
}

function backToFiles() {
  router.push({
    path: '/experiments/plans/new',
    query: {
      step: '2',
      planCode: planCode.value,
      projectId: selectedProject.value?.id ?? 'PRJ001',
      fileIds: fileIds.value.join(','),
      batchId: batchId.value,
      ...(itemIds.value.length > 0 ? { itemIds: itemIds.value.join(',') } : {}),
      ...(templateIds.value ? { templateIds: templateIds.value } : {}),
      ...(activeItemId.value ? { activeItemId: activeItemId.value } : {}),
      ...(currentTemplateId.value ? { currentTemplateId: currentTemplateId.value } : {}),
      ...(instanceId.value ? { instanceId: instanceId.value } : {}),
    },
  });
}
</script>
