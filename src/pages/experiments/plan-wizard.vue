<template>
  <div class="space-y-5">
    <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] px-5 py-4">
      <StepWizard :steps="steps" :current="step - 1" />
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-4 gap-5">
      <div class="xl:col-span-3 space-y-5">
        <BaseCard v-if="step === 1">
          <template #header>
            <span class="text-base font-bold text-[--foreground]">选择管理项目</span>
          </template>
          <div class="space-y-4">
            <div class="flex gap-3 items-center">
              <BaseFormField label="搜索项目" placeholder="输入项目名称或编号搜索" v-model="projectSearch" style="flex:1;" />
              <BaseButton variant="secondary" size="sm" @click="projectSearch = ''">重置</BaseButton>
            </div>

            <div v-if="projectLoading" class="text-center py-8 text-[--muted-foreground] text-sm">加载中...</div>
            <div v-else-if="filteredProjects.length === 0" class="text-center py-8 text-[--muted-foreground] text-sm">
              未找到匹配的项目
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="proj in filteredProjects"
                :key="proj.id"
                class="flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all"
                :class="selectedProject?.id === proj.id ? 'border-[--primary] bg-[--primary-soft]' : 'border-[--border] hover:border-[--border-strong]'"
                @click="selectProject(proj)"
              >
                <div class="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5"
                  :class="selectedProject?.id === proj.id ? 'border-[--primary] bg-[--primary] text-white' : 'border-[--border]'"
                >
                  <span v-if="selectedProject?.id === proj.id" class="text-xs">✓</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-[--text-main]">{{ proj.name }}</span>
                    <BaseTag :tone="proj.status === 'active' ? 'success' : 'neutral'" :label="proj.status === 'active' ? '现行' : '已归档'" />
                  </div>
                  <div class="text-xs text-[--muted-foreground] mt-0.5">{{ proj.code }}</div>
                  <div class="text-xs text-[--muted-foreground] mt-0.5">{{ proj.department }} · {{ proj.manager }} · {{ proj.researchArea }}</div>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard v-else-if="step === 2">
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <span class="text-base font-bold text-[--foreground]">SD已确认关联文件</span>
                <div class="text-xs text-[--muted-foreground] mt-0.5">
                  以下文件由 SD 负责人在项目资源调配阶段已确认，仅供查看，不可修改。
                  <span class="text-[--primary] ml-1">来源：项目资源调配页</span>
                </div>
              </div>
              <BaseButton variant="secondary" size="sm" @click="step = 1">← 返回</BaseButton>
            </div>
          </template>

          <div v-if="fileLoading" class="text-center py-8 text-[--muted-foreground] text-sm">自动带入文件中...</div>
          <div v-else-if="selectedFileItems.length === 0" class="text-center py-8 text-[--muted-foreground] text-sm">
            该项目暂无 SD 已确认文件，请先由 SD 负责人完成项目资源和文件调配
          </div>
          <template v-else>
            <div class="mb-4 rounded-lg border border-[--primary-border] bg-[--primary-soft]/50 px-4 py-3 text-xs text-[--text-main]">
              <span class="font-medium text-[--primary]">已带入 {{ selectedFileItems.length }} 份文件</span>
              <span class="text-[--muted-foreground] ml-2">文件已锁定，如需调整请联系 SD 负责人</span>
            </div>
            <template v-for="ft in fileTypes" :key="ft">
              <div v-if="selectedFilesByType(ft).length > 0" class="mb-6 last:mb-0">
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-sm font-semibold text-[--text-main]">{{ fileTypeLabel(ft) }}</span>
                  <span class="text-xs text-[--muted-foreground]">共 {{ selectedFilesByType(ft).length }} 份</span>
                  <BaseTag label="SD已确认" tone="success" />
                </div>
                <div class="space-y-2">
                  <div
                    v-for="f in selectedFilesByType(ft)"
                    :key="f.id"
                    class="flex items-center gap-4 p-3 border border-[--border] rounded-lg bg-[--surface-muted]/30"
                  >
                    <div class="w-5 h-5 rounded border-2 border-[--success] bg-[--success] text-white flex items-center justify-center shrink-0">
                      <span class="text-xs">✓</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-medium text-[--text-main]">{{ f.name }}</span>
                        <BaseTag :tone="f.status === 'deprecated' ? 'danger' : 'success'" :label="f.status === 'deprecated' ? '已废止' : '现行'" />
                      </div>
                      <div class="text-xs text-[--muted-foreground] mt-0.5">{{ f.code }} / {{ f.version }} · {{ f.publishDate }}</div>
                      <div class="text-xs text-[--muted-foreground] mt-0.5">{{ f.description }}</div>
                    </div>
                    <BaseTag tone="info" label="已带入" />
                  </div>
                </div>
              </div>
            </template>
          </template>
        </BaseCard>

        <BaseCard v-else-if="step === 3">
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <span class="text-base font-bold text-[--foreground]">分析批管理</span>
                <div class="text-xs text-[--muted-foreground] mt-0.5">
                  分析批是执行追溯的业务分组，请为当前计划定义分析批并关联考察项。
                  <span class="text-[--primary] ml-1">必须先创建分析批，才能进入考察项选择</span>
                </div>
              </div>
              <BaseButton variant="secondary" size="sm" @click="step = 2">← 返回</BaseButton>
            </div>
          </template>

          <!-- 顶部只读上下文 -->
          <div class="mb-4 rounded-lg border border-[--info-border] bg-[--info-soft]/50 px-4 py-3 text-xs">
            <div class="font-semibold text-[--info] mb-1">当前计划上下文（只读）</div>
            <div class="grid grid-cols-3 gap-3 text-[--text-main]">
              <div><span class="text-[--muted-foreground]">计划编号：</span><span class="font-mono">{{ planCode }}</span></div>
              <div><span class="text-[--muted-foreground]">项目：</span><span>{{ selectedProject?.name ?? '—' }}</span></div>
              <div><span class="text-[--muted-foreground]">已确认文件：</span><span>{{ selectedFileItems.length }} 份</span></div>
            </div>
          </div>

          <!-- 分析批操作栏 -->
          <div class="flex items-center justify-between mb-4">
            <div class="text-xs text-[--muted-foreground]">
              共 <span class="font-semibold text-[--text-main]">{{ batches.length }}</span> 个分析批
              <span v-if="batches.filter(b => b.status !== 'draft').length > 0" class="ml-2 text-[--success]">
                · <span class="font-semibold">{{ batches.filter(b => b.status !== 'draft').length }}</span> 个已创建
              </span>
            </div>
            <BaseButton variant="primary" size="sm" @click="openBatchDrawer()">+ 新增分析批</BaseButton>
          </div>

          <!-- 分析批列表 -->
          <div v-if="batches.length === 0" class="py-10 text-center text-[--muted-foreground] text-sm">
            <div class="text-2xl mb-2">📦</div>
            <div>暂无分析批，请点击右上角「新增分析批」创建</div>
            <div class="text-[10px] mt-1">分析批将作为后续考察项、模板、任务的分组依据</div>
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="batch in batches"
              :key="batch.id"
              class="flex items-center gap-4 p-3 rounded-lg border transition-all"
              :class="selectedBatchId === batch.id ? 'border-[--primary] bg-[--primary-soft]' : 'border-[--border] hover:border-[--primary-border]'"
            >
              <input
                type="radio"
                :name="'batch-select'"
                :value="batch.id"
                :checked="selectedBatchId === batch.id"
                class="h-4 w-4 accent-[--primary] shrink-0"
                @change="selectedBatchId = batch.id"
              />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold text-[--text-main]">{{ batch.name }}</span>
                  <BaseTag :label="batchStatusLabels[batch.status].label" :tone="batchStatusLabels[batch.status].tone" />
                  <BaseTag :label="batch.id" tone="neutral" />
                </div>
                <div class="text-xs text-[--muted-foreground] mt-0.5">{{ batch.description }}</div>
                <div class="text-[10px] text-[--muted-foreground] mt-0.5">
                  计划执行：{{ batch.plannedDate }} · 考察项：{{ batch.itemIds.length }} 个
                  · 关联：{{ batch.creator }}
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <button @click="editBatch(batch)" class="text-xs text-[--primary] hover:underline">编辑</button>
                <button
                  @click="deleteBatch(batch)"
                  class="text-xs text-[--danger] hover:underline"
                  v-if="batch.status === 'draft'"
                >删除</button>
              </div>
            </div>
          </div>

          <!-- 分析批详情编辑区 -->
          <div v-if="editingBatch" class="mt-4 rounded-lg border border-[--primary-border] bg-[--primary-soft] p-4">
            <div class="text-xs font-bold text-[--primary] mb-3">编辑分析批：{{ editingBatch.id }}</div>
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div><div class="text-[--muted-foreground] mb-1">分析批编号</div><div class="font-mono text-sm text-[--text-main] bg-white border border-[--border] rounded-md px-3 py-1.5">{{ editingBatch?.id ?? '' }}</div></div>
              <BaseFormField label="分析批名称" v-model="editingBatchForm.name" placeholder="请输入分析批名称" />
              <BaseFormField label="计划执行日期" type="date" v-model="editingBatchForm.plannedDate" placeholder="2026-09-15" class="col-span-2" />
              <BaseFormField label="批次说明" type="textarea" v-model="editingBatchForm.description" placeholder="描述本批次的用途和范围" class="col-span-2" />
              <BaseFormField label="备注" type="textarea" v-model="editingBatchForm.notes" placeholder="其他备注信息" class="col-span-2" />
            </div>
            <div class="flex justify-end gap-2 mt-3">
              <BaseButton variant="secondary" size="sm" @click="cancelEditBatch">取消</BaseButton>
              <BaseButton variant="primary" size="sm" @click="saveEditBatch">保存修改</BaseButton>
            </div>
          </div>

          <!-- 空批次提醒 -->
          <div v-if="batches.some(b => b.status === 'draft' && b.itemIds.length === 0)" class="mt-3 text-xs text-[--warning]">
            ⚠ 存在未关联考察项的分析批，请在考察项选择页完成绑定
          </div>
        </BaseCard>

        <BaseCard v-else>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-base font-bold text-[--foreground]">确认基础信息</span>
              <BaseButton variant="secondary" size="sm" @click="step = 2">← 修改文件</BaseButton>
            </div>
          </template>
          <div class="space-y-4 text-sm">
            <div class="bg-[--surface-muted] rounded-md p-3 grid grid-cols-2 gap-3">
              <div><span class="text-[--muted-foreground]">项目名称：</span><span class="font-medium text-[--text-main]">{{ selectedProject?.name }}</span></div>
              <div><span class="text-[--muted-foreground]">项目编号：</span><span class="font-medium text-[--text-main]">{{ selectedProject?.code }}</span></div>
              <div><span class="text-[--muted-foreground]">文件数量：</span><span class="font-medium text-[--text-main]">{{ selectedFileItems.length }} 份</span></div>
              <div><span class="text-[--muted-foreground]">计划编号：</span><span class="font-mono text-xs font-medium text-[--primary]">{{ planCode }}</span></div>
            </div>
            <div class="text-xs text-[--muted-foreground]">这些关联文件已由项目资源调配结果自动带入，点击下一步将进入考察项选择页，继续完成模板绑定。</div>
          </div>
        </BaseCard>

        <div class="flex justify-between items-center" v-if="step > 0">
          <BaseButton v-if="step > 1" variant="secondary" @click="step--">上一步</BaseButton>
          <div class="ml-auto flex gap-2">
            <BaseButton variant="secondary" @click="saveDraft">保存草稿</BaseButton>
            <BaseButton v-if="step < 4" variant="primary" :disabled="(step === 1 && !canProceed1) || (step === 2 && !canProceed2) || (step === 3 && !canProceed3)" @click="goNext">下一步</BaseButton>
          </div>
        </div>
        <div v-if="step === 2 && !canProceed2" class="text-xs text-[--danger]">请选择至少一份文件后再继续</div>
        <div v-if="step === 3 && !canProceed3" class="text-xs text-[--danger]">{{ batches.length === 0 ? '请至少创建一个分析批后再继续' : '请选择一个分析批后再继续' }}</div>
      </div>

      <div class="col-span-1 space-y-4">
        <BaseCard>
          <template #header>
            <span class="text-sm font-bold text-[--foreground]">项目摘要</span>
          </template>
          <div v-if="!selectedProject" class="py-6 text-center text-[--muted-foreground] text-xs">
            <div class="text-2xl mb-2">📋</div>
            <div>请从左侧选择管理项目</div>
            <div class="mt-1">选择项目后，文件库将自动加载</div>
          </div>
          <div v-else class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-[--muted-foreground]">项目编号</span>
              <span class="font-mono text-xs font-medium text-[--text-main]">{{ selectedProject.code }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[--muted-foreground]">项目名称</span>
              <span class="font-medium text-[--text-main] text-right truncate max-w-[160px]">{{ selectedProject.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[--muted-foreground]">负责人</span>
              <span class="font-medium text-[--text-main]">{{ selectedProject.manager }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[--muted-foreground]">研究方向</span>
              <span class="font-medium text-[--text-main]">{{ selectedProject.researchArea }}</span>
            </div>
            <div class="pt-2 mt-2 border-t border-[--border]">
              <BaseButton variant="secondary" size="sm" class="w-full text-xs" @click="clearProject">清除已选项目</BaseButton>
            </div>
          </div>
        </BaseCard>

        <BaseCard v-if="selectedProject">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-[--foreground]">文件摘要</span>
              <span class="text-xs text-[--muted-foreground]">{{ selectedFileItems.length }} 份已选</span>
            </div>
          </template>
          <div v-if="selectedFileItems.length === 0" class="py-4 text-center text-[--muted-foreground] text-xs">
            请从文件库中选择关联文件
          </div>
          <div v-else class="space-y-2 max-h-60 overflow-y-auto">
            <template v-for="ft in fileTypes" :key="ft">
              <div v-if="selectedFilesByType(ft).length > 0" class="mb-2 last:mb-0">
                <div class="text-xs font-semibold text-[--primary] mb-1">{{ fileTypeLabel(ft) }}</div>
                <div v-for="f in selectedFilesByType(ft)" :key="f.id" class="bg-[--surface-muted] rounded p-2 mb-1">
                  <div class="text-xs font-mono text-[--primary] font-semibold">{{ f.code }}</div>
                  <div class="text-xs text-[--text-main] truncate">{{ f.name }}</div>
                  <div class="text-[10px] text-[--muted-foreground]">{{ f.version }} · {{ f.publishDate }}</div>
                </div>
              </div>
            </template>
          </div>
        </BaseCard>
      </div>
    </div>

    <BaseDrawer title="新增分析批" :open="showBatchDrawer" @close="closeBatchDrawer">
      <div class="space-y-4">
        <p class="text-xs text-[--muted-foreground]">创建分析批，作为后续考察项、模板和任务的分组依据。</p>
        <div>
          <div class="text-xs text-[--muted-foreground] mb-1">分析批编号</div>
          <div class="font-mono text-sm text-[--text-main] bg-[--surface-muted] border border-[--border] rounded-md px-3 py-2">{{ batches.length > 0 ? getNextBatchId() : 'BATCH-001' }}</div>
        </div>
        <BaseFormField label="分析批名称" v-model="editingBatchForm.name" placeholder="如：批次一：基质效应与选择性" required />
        <BaseFormField label="计划执行日期" type="date" v-model="editingBatchForm.plannedDate" />
        <BaseFormField label="批次说明" type="textarea" v-model="editingBatchForm.description" placeholder="描述本批次的用途、样品范围等" />
        <BaseFormField label="备注" type="textarea" v-model="editingBatchForm.notes" placeholder="其他备注信息" />
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="closeBatchDrawer">取消</BaseButton>
        <BaseButton variant="primary" :disabled="!editingBatchForm.name.trim()" @click="saveNewBatch">创建分析批</BaseButton>
      </template>
    </BaseDrawer>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseDrawer from '@/components/base/BaseDrawer.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import StepWizard from '@/components/experiments/StepWizard.vue';
import { projects, searchProjects } from '@/api/mock/projects';
import { files, getFilesByProject, getFilesByType as getFilesByTypeApi, getFileTypeLabel as getFileTypeLabelApi } from '@/api/mock/files';
import { analysisBatches, getBatchesByProject, getNextBatchId, batchStatusLabels } from '@/api/mock/batches';
import { DEMO_PROJECT_CODE, DEMO_PLAN_CODE } from '@/api/mock/demoContext';
import type { Project } from '@/api/mock/projects';
import type { FileItem, FileType } from '@/api/mock/files';
import type { AnalysisBatch, BatchStatus } from '@/api/mock/batches';

const router = useRouter();
const route = useRoute();
const step = ref(parseStep(route.query.step));

const projectSearch = ref('');
const projectLoading = ref(false);
const selectedProject = ref<Project | null>(null);
const fileLoading = ref(false);
const selectedFiles = ref<string[]>([]);
const routeFileIds = parseList(route.query.fileIds);

const fileTypes: FileType[] = ['sop', 'method', 'protocol'];

const steps = [
  { label: '选择项目', sub: '实验负责人选择计划项目' },
  { label: '关联文件', sub: '自动带入 SD 已确认文件' },
  { label: '分析批管理', sub: '定义执行批次，关联考察项分组' },
  { label: '进入考察项', sub: '跳转到考察项选择页' },
];

const filteredProjects = computed(() => searchProjects(projectSearch.value));
const selectedFileItems = computed(() =>
  selectedFiles.value.map(id => files.find(f => f.id === id)).filter(Boolean) as FileItem[]
);
const planCode = computed(() => parseSingle(route.query.planCode) || (selectedProject.value ? `PLAN-${selectedProject.value.code}-DRAFT` : DEMO_PLAN_CODE));
const canProceed1 = computed(() => !!selectedProject.value);
const canProceed2 = computed(() => !!selectedProject.value && selectedFiles.value.length > 0);
const canProceed3 = computed(() => !!selectedProject.value && batches.value.length > 0 && !!selectedBatchId.value);

const batches = ref<AnalysisBatch[]>([]);
const selectedBatchId = ref<string>('');
const showBatchDrawer = ref(false);
const editingBatch = ref<AnalysisBatch | null>(null);
const editingBatchForm = reactive({ name: '', plannedDate: '', description: '', notes: '' });

watch(selectedProject, (proj) => {
  if (proj) {
    fileLoading.value = true;
    selectedFiles.value = routeFileIds.length > 0 ? [...routeFileIds] : getAutoFileIds(proj.id);
    setTimeout(() => { fileLoading.value = false; }, 300);
    batches.value = getBatchesByProject(proj.code).length > 0
      ? getBatchesByProject(proj.code)
      : [];
    if (batches.value.length === 0 && proj) {
      batches.value = [{
        id: getNextBatchId(),
        name: `批次一：${proj.name}`,
        planCode: planCode.value,
        projectCode: proj.code,
        description: `${proj.name} 项目第 1 批次`,
        plannedDate: '',
        creator: proj.manager,
        status: 'draft' as BatchStatus,
        itemIds: [],
        notes: '',
      }];
      selectedBatchId.value = batches.value[0].id;
    }
  }
});

if (route.query.projectId) {
  const id = parseSingle(route.query.projectId);
  selectedProject.value = projects.find(p => p.id === id) ?? null;
}
if (route.query.fileIds) {
  selectedFiles.value = parseList(route.query.fileIds);
}

function selectProject(proj: Project) {
  selectedProject.value = proj;
  projectSearch.value = '';
  step.value = 2;
}

function clearProject() {
  selectedProject.value = null;
  selectedFiles.value = [];
  batches.value = [];
  selectedBatchId.value = '';
  step.value = 1;
}

function fileTypeLabel(t: FileType): string {
  return getFileTypeLabelApi(t);
}

function getFilesByType(t: FileType): FileItem[] {
  return selectedProject.value ? getFilesByTypeApi(selectedProject.value.id, t) : [];
}

function selectedFilesByType(t: FileType): FileItem[] {
  return getFilesByType(t).filter(f => selectedFiles.value.includes(f.id));
}

function getAutoFileIds(projectId: string): string[] {
  if (typeof window !== 'undefined') {
    const raw = window.localStorage.getItem(`project-resource-allocation::${projectId}`);
    if (raw) {
      try {
        const state = JSON.parse(raw) as { selectedFileIds?: string[] };
        if (Array.isArray(state.selectedFileIds) && state.selectedFileIds.length > 0) {
          return state.selectedFileIds.filter(Boolean);
        }
      } catch {
        // ignore malformed cache
      }
    }
  }
  return getFilesByProject(projectId).filter(file => file.status !== 'deprecated').map(file => file.id);
}

function goNext() {
  if (step.value === 1) {
    if (!canProceed1.value) return;
    step.value = 2;
    return;
  }
  if (step.value === 2) {
    if (!canProceed2.value) return;
    step.value = 3;
    return;
  }
  if (step.value === 3) {
    if (!canProceed3.value) return;
    goToItems();
  }
}

function goToItems() {
  if (!canProceed2.value) return;
  router.push({
    path: '/experiments/plans/new/items',
    query: {
      planCode: planCode.value,
      projectId: selectedProject.value?.id ?? 'PRJ001',
      fileIds: selectedFiles.value.join(','),
      batchId: selectedBatchId.value || (batches.value[0]?.id ?? ''),
    },
  });
}

function saveDraft() {
  alert('草稿已保存');
  router.push('/experiments/plans');
}

function parseSingle(value: unknown): string {
  return Array.isArray(value) ? value[0] ?? '' : typeof value === 'string' ? value : '';
}

function parseList(value: unknown): string[] {
  const raw = parseSingle(value);
  return raw ? raw.split(',').map(v => v.trim()).filter(Boolean) : [];
}

function parseStep(value: unknown): number {
  const raw = Number.parseInt(parseSingle(value), 10);
  return Number.isNaN(raw) || raw < 1 ? 1 : Math.min(raw, 4);
}

// ── 分析批管理 ────────────────────────────────────────────────────
function openBatchDrawer() {
  editingBatch.value = null;
  editingBatchForm.name = '';
  editingBatchForm.plannedDate = '';
  editingBatchForm.description = '';
  editingBatchForm.notes = '';
  showBatchDrawer.value = true;
}

function closeBatchDrawer() {
  showBatchDrawer.value = false;
}

function saveNewBatch() {
  if (!editingBatchForm.name.trim()) return;
  const newBatch: AnalysisBatch = {
    id: batches.value.length > 0 ? getNextBatchId() : 'BATCH-001',
    name: editingBatchForm.name.trim(),
    planCode: planCode.value,
    projectCode: selectedProject.value?.code ?? '',
    description: editingBatchForm.description.trim(),
    plannedDate: editingBatchForm.plannedDate,
    creator: selectedProject.value?.manager ?? '当前用户',
    status: 'draft' as BatchStatus,
    itemIds: [],
    notes: editingBatchForm.notes.trim(),
  };
  batches.value.push(newBatch);
  selectedBatchId.value = newBatch.id;
  showBatchDrawer.value = false;
  editingBatchForm.name = '';
  editingBatchForm.plannedDate = '';
  editingBatchForm.description = '';
  editingBatchForm.notes = '';
}

function editBatch(batch: AnalysisBatch) {
  editingBatch.value = batch;
  editingBatchForm.name = batch.name;
  editingBatchForm.plannedDate = batch.plannedDate;
  editingBatchForm.description = batch.description;
  editingBatchForm.notes = batch.notes;
}

function saveEditBatch() {
  if (!editingBatch.value || !editingBatchForm.name.trim()) return;
  editingBatch.value.name = editingBatchForm.name.trim();
  editingBatch.value.plannedDate = editingBatchForm.plannedDate;
  editingBatch.value.description = editingBatchForm.description.trim();
  editingBatch.value.notes = editingBatchForm.notes.trim();
  editingBatch.value.status = editingBatch.value.itemIds.length > 0 ? 'items_bound' as BatchStatus : 'draft' as BatchStatus;
  editingBatch.value = null;
}

function cancelEditBatch() {
  editingBatch.value = null;
}

function deleteBatch(batch: AnalysisBatch) {
  if (!confirm(`确认删除分析批「${batch.name}」？\n${batch.itemIds.length > 0 ? '该分析批已关联 ' + batch.itemIds.length + ' 个考察项，删除后关联关系将被清除。' : ''}`)) return;
  batches.value = batches.value.filter(b => b.id !== batch.id);
  if (selectedBatchId.value === batch.id) {
    selectedBatchId.value = batches.value[0]?.id ?? '';
  }
}

if (route.query.batchId) {
  selectedBatchId.value = parseSingle(route.query.batchId);
}
</script>
