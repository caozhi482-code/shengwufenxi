<template>
  <div class="space-y-5">
    <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] px-5 py-4">
      <StepWizard :steps="steps" :current="step - 1" />
    </div>

    <div class="grid grid-cols-4 gap-5">
      <div class="col-span-3 space-y-5">
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
                <span class="text-base font-bold text-[--foreground]">自动带入关联文件</span>
                <div class="text-xs text-[--muted-foreground] mt-0.5">
                  已选项目：<span class="font-medium text-[--text-main]">{{ selectedProject?.name }}</span>
                  （{{ selectedProject?.code }}）
                </div>
              </div>
              <BaseButton variant="secondary" size="sm" @click="step = 1">← 返回</BaseButton>
            </div>
          </template>

          <div v-if="fileLoading" class="text-center py-8 text-[--muted-foreground] text-sm">自动带入文件中...</div>
          <div v-else-if="availableFiles.length === 0" class="text-center py-8 text-[--muted-foreground] text-sm">
            该项目暂无可用文件，请先到项目资源调配中补充关联文件
          </div>
          <template v-for="ft in fileTypes" :key="ft">
            <div v-if="getFilesByType(ft).length > 0" class="mb-6 last:mb-0">
              <div class="flex items-center gap-2 mb-3">
                <span class="text-sm font-semibold text-[--text-main]">{{ fileTypeLabel(ft) }}</span>
                <span class="text-xs text-[--muted-foreground]">共 {{ getFilesByType(ft).length }} 份</span>
                <span class="text-xs font-medium text-[--primary]">已自动带入 {{ selectedFilesByType(ft).length }}
                </span>
              </div>
              <div class="space-y-2">
                <div
                  v-for="f in getFilesByType(ft)"
                  :key="f.id"
                  class="flex items-center gap-4 p-3 border rounded-lg transition-all"
                  :class="f.status === 'deprecated' ? 'border-[--danger-border] bg-[--danger-soft] opacity-60' : 'border-[--border] bg-white'"
                >
                  <div class="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0"
                    :class="selectedFiles.includes(f.id) ? 'border-[--primary] bg-[--primary] text-white' : 'border-[--border]'"
                  >
                    <span v-if="selectedFiles.includes(f.id)" class="text-xs">✓</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-medium text-[--text-main]">{{ f.name }}</span>
                      <BaseTag v-if="f.status === 'deprecated'" tone="danger" label="已废止" />
                      <BaseTag v-else tone="success" label="现行" />
                      <BaseTag :label="selectedFiles.includes(f.id) ? '已带入' : '未带入'" :tone="selectedFiles.includes(f.id) ? 'success' : 'neutral'" />
                    </div>
                    <div class="text-xs text-[--muted-foreground] mt-0.5">{{ f.code }} / {{ f.version }} · {{ f.publishDate }}</div>
                    <div class="text-xs text-[--muted-foreground] mt-0.5">{{ f.description }}</div>
                  </div>
                </div>
              </div>
            </div>
          </template>
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
            <BaseButton v-if="step < 3" variant="primary" :disabled="(step === 1 && !canProceed1) || (step === 2 && !canProceed2)" @click="goNext">下一步</BaseButton>
            <BaseButton v-else variant="primary" :disabled="!canProceed2" @click="goToItems">下一步</BaseButton>
          </div>
        </div>
        <div v-if="step === 2 && !canProceed2" class="text-xs text-[--danger]">请选择至少一份文件后再继续</div>
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import StepWizard from '@/components/experiments/StepWizard.vue';
import { projects, searchProjects } from '@/api/mock/projects';
import { files, getFilesByProject, getFilesByType as getFilesByTypeApi, getFileTypeLabel as getFileTypeLabelApi } from '@/api/mock/files';
import type { Project } from '@/api/mock/projects';
import type { FileItem, FileType } from '@/api/mock/files';

const router = useRouter();
const route = useRoute();
const step = ref(parseStep(route.query.step));

const projectSearch = ref('');
const projectLoading = ref(false);
const selectedProject = ref<Project | null>(null);
const fileLoading = ref(false);
const selectedFiles = ref<string[]>([]);

const fileTypes: FileType[] = ['sop', 'method', 'protocol'];

const steps = [
  { label: '选择管理项目', sub: '搜索并选中一个项目' },
  { label: '选择关联文件', sub: '从文件库选择 SOP/方法/方案文件' },
  { label: '进入考察项', sub: '跳转到考察项选择页' },
];

const filteredProjects = computed(() => searchProjects(projectSearch.value));
const availableFiles = computed(() => selectedProject.value ? getFilesByProject(selectedProject.value.id) : []);
const selectedFileItems = computed(() =>
  selectedFiles.value.map(id => files.find(f => f.id === id)).filter(Boolean) as FileItem[]
);
const planCode = computed(() => parseSingle(route.query.planCode) || (selectedProject.value ? `PLAN-${selectedProject.value.code}-DRAFT` : 'PLAN-DRAFT'));
const canProceed1 = computed(() => !!selectedProject.value);
const canProceed2 = computed(() => !!selectedProject.value && selectedFiles.value.length > 0);

watch(selectedProject, (proj) => {
  if (proj) {
    fileLoading.value = true;
    selectedFiles.value = [];
    setTimeout(() => { fileLoading.value = false; }, 300);
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

function toggleFile(f: FileItem) {
  const idx = selectedFiles.value.indexOf(f.id);
  idx >= 0 ? selectedFiles.value.splice(idx, 1) : selectedFiles.value.push(f.id);
}

function goNext() {
  if (step.value === 1) {
    if (!canProceed1.value) return;
    step.value = 2;
    return;
  }
  if (step.value === 2) {
    if (!canProceed2.value) return;
    goToItems();
  }
}

function goToItems() {
  if (!canProceed2.value) return;
  router.push({
    path: '/experiments/plans/new/items',
    query: {
      planCode: planCode.value,
      projectId: selectedProject.value?.id ?? '',
      fileIds: selectedFiles.value.join(','),
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
  return Number.isNaN(raw) || raw < 1 ? 1 : Math.min(raw, 3);
}
</script>
