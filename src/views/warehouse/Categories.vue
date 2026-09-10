<template>
  <div class="space-y-5">
    <BasePageHeader title="分类管理" subtitle="管理物品分类树形结构" />

    <div class="flex gap-5">
      <!-- 左侧：分类树 -->
      <div class="w-[280px] shrink-0">
        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-base font-bold text-[--foreground]">分类结构</span>
              <BaseButton variant="ghost" size="sm" @click="toggleAll">展开全部</BaseButton>
            </div>
          </template>
          <div class="py-2">
            <CategoryTree
              v-for="node in treeNodes"
              :key="node.id"
              :node="node"
              @select="selectCategory"
            />
          </div>
        </BaseCard>
        <div class="mt-3">
          <BaseButton variant="primary" size="sm" class="w-full">+ 新建分类</BaseButton>
        </div>
      </div>

      <!-- 右侧：分类表格 -->
      <div class="flex-1 space-y-4">
        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-base font-bold text-[--foreground]">分类列表</span>
              <BaseButton variant="primary" size="sm">新建分类</BaseButton>
            </div>
          </template>
          <BaseTable
            :data="categories"
            :columns="columns"
            :pagination="{ page: 1, total: categories.length, pages: 1 }"
          >
            <template #cell-parentId="{ row }">
              <span class="text-[--muted-foreground]">{{ getParentName(row.parentId) || '—' }}</span>
            </template>
            <template #cell-actions="{ row }">
              <div class="flex gap-2">
                <button class="text-[--primary] text-xs font-medium hover:underline" @click.stop="editCategory(row)">编辑</button>
                <button class="text-[--info] text-xs font-medium hover:underline" @click.stop="addChild(row)">添加子分类</button>
                <button class="text-[--danger] text-xs font-medium hover:underline" @click.stop="deleteCategory(row)">删除</button>
              </div>
            </template>
          </BaseTable>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { categories } from '@/api/mock/warehouse';
import type { Category } from '@/api/mock/warehouse';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import CategoryTree from '@/components/warehouse/CategoryTree.vue';

const selectedCategory = ref<Category | null>(null);
const expandedIds = ref<Set<string>>(new Set());

const categoryMap = computed(() => {
  const map = new Map<string, Category>();
  categories.forEach(c => map.set(c.id, c));
  return map;
});

const treeNodes = computed(() => {
  return categories.filter(c => !c.parentId).map(cat => ({
    ...cat,
    selected: selectedCategory.value?.id === cat.id,
    expanded: expandedIds.value.has(cat.id),
    children: categories.filter(c => c.parentId === cat.id).map(child => ({
      ...child,
      selected: selectedCategory.value?.id === child.id,
      expanded: false,
      children: categories.filter(gc => gc.parentId === child.id).map(gc => ({
        ...gc,
        selected: selectedCategory.value?.id === gc.id,
        expanded: false,
        children: [],
      })),
    })),
  }));
});

function toggleAll() {
  if (expandedIds.value.size > 0) {
    expandedIds.value.clear();
  } else {
    categories.filter(c => !c.parentId).forEach(c => expandedIds.value.add(c.id));
  }
}

function selectCategory(node: Category & { selected?: boolean }) {
  selectedCategory.value = node as Category;
}

function getParentName(parentId: string | null): string {
  if (!parentId) return '';
  return categoryMap.value.get(parentId)?.name ?? '';
}

const columns = [
  { key: 'code', label: '分类编码' },
  { key: 'name', label: '分类名称' },
  { key: 'parentId', label: '父级分类' },
  { key: 'description', label: '描述' },
  { key: 'itemCount', label: '物品数量' },
  { key: 'createdAt', label: '创建时间' },
  { key: 'actions', label: '操作' },
];

function editCategory(row: Category) {
  console.log('edit', row);
}

function addChild(row: Category) {
  console.log('add child to', row);
}

function deleteCategory(row: Category) {
  console.log('delete', row);
}
</script>