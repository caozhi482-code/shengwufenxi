<template>
  <div class="space-y-5">
    <BasePageHeader title="每日执行单制作" subtitle="批量生成每日实验执行单" />

    <BaseCard>
      <div class="flex gap-4 items-end flex-wrap">
        <BaseFormField label="选择日期" type="date" v-model="selectedDate" />
        <BaseButton variant="primary" @click="generate">批量生成执行单</BaseButton>
        <span class="text-sm text-[--muted-foreground]">共 {{ filteredTasks.length }} 项任务待生成</span>
      </div>
    </BaseCard>

    <BaseCard>
      <template #header>
        <span class="text-base font-bold text-[--foreground]">候选任务列表</span>
        <div class="ml-auto flex gap-2">
          <button class="text-xs text-[--info] hover:underline" @click="selectAll">全选</button>
          <button class="text-xs text-[--info] hover:underline" @click="clearAll">清空</button>
        </div>
      </template>
      <div class="space-y-2">
        <div v-for="task in filteredTasks" :key="task.id"
          class="flex items-center gap-4 p-3 border border-[--border] rounded-md cursor-pointer hover:bg-[--surface-muted] transition-colors"
          :class="selectedTasks.includes(task.id) ? 'border-[--primary-border] bg-[--primary-soft]' : ''"
          @click="toggleTask(task.id)">
          <input type="checkbox" :checked="selectedTasks.includes(task.id)" class="accent-[--primary]" @click.stop="toggleTask(task.id)" />
          <div class="flex-1 grid grid-cols-6 gap-4 text-sm">
            <div>
              <div class="text-[--muted-foreground] text-xs">考察项</div>
              <div class="font-medium">{{ task.itemCode }} {{ task.itemName }}</div>
            </div>
            <div>
              <div class="text-[--muted-foreground] text-xs">表单模板</div>
              <div>{{ (task.formTemplates as string[]).join(', ') }}</div>
            </div>
            <div>
              <div class="text-[--muted-foreground] text-xs">实验员</div>
              <div>{{ (task.investigators as string[]).join(', ') }}</div>
            </div>
            <div>
              <div class="text-[--muted-foreground] text-xs">样本批次</div>
              <div>{{ task.sampleBatch }}</div>
            </div>
            <div>
              <div class="text-[--muted-foreground] text-xs">仪器</div>
              <div>{{ (task.instruments as string[]).join(', ') }}</div>
            </div>
            <div>
              <div class="text-[--muted-foreground] text-xs">步骤文件版本</div>
              <div>v1.2</div>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>

    <div class="flex justify-end gap-2">
      <BaseButton variant="secondary">取消</BaseButton>
      <BaseButton variant="primary" :disabled="selectedTasks.length === 0" @click="confirmGenerate">生成 {{ selectedTasks.length }} 个执行单</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import dayjs from 'dayjs';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import { tasks } from '@/api/mock/tasks';

const selectedDate = ref(dayjs().add(1, 'day').format('YYYY-MM-DD'));
const selectedTasks = ref<string[]>([]);

const filteredTasks = computed(() =>
  tasks.filter((t: any) => t.status === 'scheduled' || t.status === 'pending')
);

function toggleTask(id: string) {
  const idx = selectedTasks.value.indexOf(id);
  idx >= 0 ? selectedTasks.value.splice(idx, 1) : selectedTasks.value.push(id);
}
function selectAll() { selectedTasks.value = filteredTasks.value.map((t: any) => t.id); }
function clearAll() { selectedTasks.value = []; }
function generate() { /* mock */ }
function confirmGenerate() { /* mock */ selectedTasks.value = []; }
</script>
