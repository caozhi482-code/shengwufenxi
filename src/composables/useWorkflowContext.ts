/**
 * 统一工作流上下文 Composable
 * 所有页面通过此 composable 读取/写入 demo 主线上下文。
 * 默认落回 demoContext，确保任意入口都有连贯数据。
 */
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  DEMO_PROJECT_ID, DEMO_PROJECT_CODE, DEMO_PLAN_CODE,
  DEMO_BATCH_IDS, DEMO_LOCALSTORAGE_KEY,
  demoProject, demoPlan, demoBatches, demoTasks,
  getDemoBatch, getDemoBatchesByPlan, getDemoTasksByPlan, getDemoTask,
} from '@/api/mock/demoContext';
import { projects } from '@/api/mock/projects';
import { files, getFilesByProject } from '@/api/mock/files';

// ─── 全局单例状态（组件间共享）──────────────────────────────────────────────
const globalPlanCode = ref<string>(DEMO_PLAN_CODE);
const globalProjectId = ref<string>(DEMO_PROJECT_ID);
const globalBatchId = ref<string>(DEMO_BATCH_IDS[0]);

// ─── 从 localStorage 恢复 ─────────────────────────────────────────────────
function hydrateFromStorage() {
  try {
    const raw = window.localStorage.getItem(DEMO_LOCALSTORAGE_KEY);
    if (raw) {
      const ctx = JSON.parse(raw) as { planCode?: string; projectId?: string; batchId?: string };
      if (ctx.planCode) globalPlanCode.value = ctx.planCode;
      if (ctx.projectId) globalProjectId.value = ctx.projectId;
      if (ctx.batchId) globalBatchId.value = ctx.batchId;
    }
  } catch { /* ignore */ }
}

function persistToStorage() {
  try {
    window.localStorage.setItem(
      DEMO_LOCALSTORAGE_KEY,
      JSON.stringify({
        planCode: globalPlanCode.value,
        projectId: globalProjectId.value,
        batchId: globalBatchId.value,
      }),
    );
  } catch { /* ignore */ }
}

hydrateFromStorage();

// ─── Composable ────────────────────────────────────────────────────────────
export function useWorkflowContext() {
  const route = useRoute();

  // 优先从路由读取，其次从全局状态，最后从 demoContext 回退
  const planCode = computed(() => {
    const fromRoute = (route.query.planCode as string) ?? '';
    if (fromRoute) return fromRoute;
    return globalPlanCode.value;
  });

  const projectId = computed(() => {
    const fromRoute = (route.query.projectId as string) ?? '';
    if (fromRoute) return fromRoute;
    return globalProjectId.value;
  });

  const batchId = computed(() => {
    const fromRoute = (route.query.batchId as string) ?? '';
    if (fromRoute) return fromRoute;
    return globalBatchId.value;
  });

  const selectedProject = computed(() => {
    const id = projectId.value;
    // 先查 demoProject，再查项目列表
    if (id === DEMO_PROJECT_ID) return demoProject;
    return projects.find(p => p.id === id) ?? null;
  });

  const selectedBatch = computed(() => {
    const id = batchId.value;
    if (!id) return null;
    return getDemoBatch(id) ?? null;
  });

  const allBatches = computed(() => getDemoBatchesByPlan());

  const allTasks = computed(() => getDemoTasksByPlan());

  const currentTasks = computed(() => {
    const batch = selectedBatch.value;
    if (!batch) return allTasks.value;
    const itemIds = new Set(batch.itemIds);
    return allTasks.value.filter(t => itemIds.has(t.itemCode) || batch.itemIds.length === 0);
  });

  // 从路由或 localStorage 恢复的已选文件 IDs
  const selectedFileIds = computed(() => {
    const fromRoute = (route.query.fileIds as string) ?? '';
    if (fromRoute) return fromRoute.split(',').map(s => s.trim()).filter(Boolean);
    // 默认：PRJ001 下的所有 active 文件
    return getFilesByProject(DEMO_PROJECT_ID).map(f => f.id);
  });

  const selectedFiles = computed(() => {
    const ids = new Set(selectedFileIds.value);
    const base = selectedProject.value
      ? getFilesByProject(selectedProject.value.id)
      : files;
    return base.filter(f => ids.has(f.id));
  });

  // 设置函数（供页面调用，写入全局状态 + localStorage）
  function setPlanCode(code: string) {
    globalPlanCode.value = code;
    persistToStorage();
  }

  function setProjectId(id: string) {
    globalProjectId.value = id;
    persistToStorage();
  }

  function setBatchId(id: string) {
    globalBatchId.value = id;
    persistToStorage();
  }

  function setFileIds(ids: string[]) {
    window.localStorage.setItem(
      DEMO_LOCALSTORAGE_KEY,
      JSON.stringify({
        ...JSON.parse(window.localStorage.getItem(DEMO_LOCALSTORAGE_KEY) ?? '{}'),
        fileIds: ids,
      }),
    );
  }

  function resetToDemo() {
    globalPlanCode.value = DEMO_PLAN_CODE;
    globalProjectId.value = DEMO_PROJECT_ID;
    globalBatchId.value = DEMO_BATCH_IDS[0];
    persistToStorage();
  }

  return {
    // 路由参数（已解析）
    planCode,
    projectId,
    batchId,
    // 上下文对象
    selectedProject,
    selectedBatch,
    allBatches,
    allTasks,
    currentTasks,
    selectedFiles,
    selectedFileIds,
    // 设置函数
    setPlanCode,
    setProjectId,
    setBatchId,
    setFileIds,
    resetToDemo,
    // 常量（供模板直接显示）
    DEMO_PLAN_CODE,
    DEMO_PROJECT_ID,
    DEMO_PROJECT_CODE,
  };
}
