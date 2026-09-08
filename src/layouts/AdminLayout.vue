<template>
  <div class="ui-shell flex h-screen bg-[--shell-bg]">
    <!-- 左侧导航轨 88px -->
    <nav class="ui-rail w-[--rail-w] bg-white border-r border-[--border] flex flex-col items-center py-4 shrink-0">
      <div class="w-10 h-10 rounded-lg bg-[--primary] flex items-center justify-center text-white font-bold text-sm mb-6">LIMS</div>
      <div class="flex flex-col gap-1 flex-1 w-full px-2">
        <div v-for="item in menuItems" :key="item.path"
          :class="['w-full flex flex-col items-center justify-center py-3 rounded-lg cursor-pointer transition-all duration-150 relative',
            isActive(item.path) ? 'bg-[--primary-soft] border border-[--primary-border] text-[--primary]' : 'text-[--muted-foreground] hover:bg-[--neutral-soft]']"
          @click="navigate(item.path)">
          <component :is="item.icon" :size="20" />
          <span class="text-[10px] font-medium mt-1">{{ item.label }}</span>
          <div v-if="isActive(item.path)" class="absolute left-0 w-1 h-6 bg-[--primary] rounded-r-md" />
        </div>
      </div>
    </nav>

    <!-- 右侧主内容区 -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- 顶部栏 64px -->
      <header class="ui-shell-header h-[var(--header-h)] bg-white border-b border-[--border] flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-2 text-sm text-[--muted-foreground]">
          <span class="font-medium text-[--text-main]">Lims 智慧实验分析系统</span>
          <span class="text-[--text-tertiary]">/</span>
          <span>实验模块</span>
        </div>
        <div class="flex items-center gap-4">
          <button class="relative text-[--muted-foreground] hover:text-[--text-main]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <span class="absolute -top-1 -right-1 w-4 h-4 bg-[--danger] text-white text-[10px] rounded-full flex items-center justify-center">3</span>
          </button>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-[--primary-soft] border border-[--primary-border] flex items-center justify-center text-[--primary] text-xs font-bold">何</div>
            <span class="text-sm font-medium text-[--text-main]">何晓明</span>
          </div>
        </div>
      </header>

      <!-- 工作区页签 44px -->
      <div class="ui-workspace-tabs h-[44px] bg-white border-b border-[--border] flex items-center px-6 gap-0 shrink-0">
        <button v-for="tab in tabs" :key="tab.path"
          :class="['px-4 py-2 text-sm font-medium border-b-2 transition-all duration-150 -mb-px',
            isActive(tab.path) ? 'border-[--primary] text-[--primary]' : 'border-transparent text-[--muted-foreground] hover:text-[--text-main]']"
          @click="navigate(tab.path)">
          {{ tab.label }}
        </button>
      </div>

      <!-- 内容区 -->
      <main class="ui-main flex-1 overflow-y-auto p-5">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Beaker, TestTube, ClipboardPen } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const menuItems = [
  { label: '实验', path: '/experiments/plans', icon: Beaker },
  { label: '执行', path: '/experiments/my-sheets', icon: TestTube },
  { label: '模板中心', path: '/experiments/form-templates', icon: ClipboardPen },
];

const tabs = computed(() => {
  const p = route.path;
  if (p.startsWith('/experiments/plans/') && p !== '/experiments/plans') {
    return [{ label: '考察项任务制作', path: p }];
  }
  if (p.startsWith('/experiments/')) {
    const name = p.split('/').filter(Boolean).pop() ?? '';
    return [{ label: name.replace(/-/g, ' '), path: p }];
  }
  return [{ label: '实验管理', path: '/experiments/plans' }];
});

function isActive(path: string): boolean {
  if (path.includes(':id')) return route.path.startsWith(path.split(':')[0].replace('/:id', ''));
  return route.path.startsWith(path);
}

function navigate(path: string) {
  router.push(path);
}
</script>
