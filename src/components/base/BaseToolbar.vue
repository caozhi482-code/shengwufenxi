<template>
  <div class="flex items-center justify-between gap-4 mb-4 flex-wrap">
    <div class="flex items-center gap-2 flex-wrap">
      <slot name="left" />
    </div>
    <div class="flex items-center gap-2 flex-wrap">
      <slot name="right" />
    </div>
  </div>
</template>
