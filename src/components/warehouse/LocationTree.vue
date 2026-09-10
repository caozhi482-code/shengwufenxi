<template>
  <div class="space-y-3">
    <div v-if="node.children?.length" class="tree-node">
      <div
        :class="['flex items-center gap-1.5 py-1.5 px-2 rounded-md cursor-pointer text-sm transition-colors',
          node.selected ? 'bg-[--primary-soft] text-[--primary] font-semibold' : 'text-[--text-main] hover:bg-[--surface-muted]']"
        @click="$emit('select', node)"
      >
        <span class="text-[--muted-foreground] text-xs">{{ node.expanded ? '▼' : '▶' }}</span>
        <span class="text-xs text-[--muted-foreground] mr-1">{{ node.code }}</span>
        <span>{{ node.name }}</span>
      </div>
      <div v-if="node.expanded" class="ml-5 space-y-0.5">
        <LocationTree
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          @select="$emit('select', $event)"
        />
      </div>
    </div>
    <div v-else class="tree-node">
      <div
        :class="['flex items-center gap-1.5 py-1.5 px-2 rounded-md cursor-pointer text-sm transition-colors',
          node.selected ? 'bg-[--primary-soft] text-[--primary] font-semibold' : 'text-[--text-main] hover:bg-[--surface-muted]']"
        @click="$emit('select', node)"
      >
        <span class="w-3 text-[--muted-foreground] text-xs">·</span>
        <span class="text-xs text-[--muted-foreground] mr-1">{{ node.code }}</span>
        <span>{{ node.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Location } from '@/api/mock/warehouse';

defineProps<{ node: Location & { selected?: boolean; expanded?: boolean; children?: (Location & { selected?: boolean; expanded?: boolean })[] } }>();
defineEmits<{ select: [node: Location & { selected?: boolean; expanded?: boolean }] }>();
</script>
