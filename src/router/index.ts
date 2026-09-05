import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/experiments',
    children: [
      { path: 'plans', component: () => import('@/pages/experiments/plan-list.vue') },
      { path: 'plans/new', component: () => import('@/pages/experiments/plan-wizard.vue') },
      { path: 'plans/new/items', component: () => import('@/pages/experiments/plan-item-selector.vue') },
      { path: 'plans/new/forms', component: () => import('@/pages/experiments/plan-form-selector.vue') },
      { path: 'plans/:planId/items/:itemId/forms', component: () => import('@/pages/experiments/plan-form-workspace.vue') },
      { path: 'plans/new/publish', component: () => import('@/pages/experiments/plan-publish.vue') },
      { path: 'plans/new/sd-planning', component: () => import('@/pages/experiments/plan-sd-planning.vue') },
      { path: 'plans/new/task-assignment', component: () => import('@/pages/experiments/plan-task-assignment.vue') },
      { path: 'plans/:planId/items/:itemId/sequence-template', component: () => import('@/pages/experiments/sequence-table.vue') },
      { path: 'form-templates', component: () => import('@/pages/experiments/form-templates.vue') },
      { path: 'form-templates/:id', component: () => import('@/pages/experiments/form-template-detail.vue') },
      { path: 'form-templates/:id/preview', component: () => import('@/pages/experiments/form-template-preview.vue') },
      { path: 'form-templates/:id/editor', component: () => import('@/pages/experiments/form-template-editor.vue') },
      { path: 'plans/:id/tasks', component: () => import('@/pages/experiments/task-builder.vue') },
      { path: 'plans/:id/tasks/new', component: () => import('@/pages/experiments/task-creation.vue') },
      { path: 'tasks/:taskId/forms/:formTemplateId', component: () => import('@/pages/experiments/form-editor.vue') },
      { path: 'daily-sheets', component: () => import('@/pages/experiments/daily-sheets.vue') },
      { path: 'sequence-tables/:id', component: () => import('@/pages/experiments/sequence-table.vue') },
      { path: 'my-sheets', component: () => import('@/pages/experiments/my-sheets.vue') },
      { path: 'execute-step', component: () => import('@/pages/experiments/execute-step.vue') },
      { path: 'sheets/:id/execute', component: () => import('@/pages/experiments/execute-step.vue') },
      { path: 'tasks/:taskId/execute', component: () => import('@/pages/experiments/execute-step.vue') },
      { path: 'review', component: () => import('@/pages/experiments/data-review.vue') },
      { path: 'results', component: () => import('@/pages/experiments/result-judgment.vue') },
      { path: 'deviations', component: () => import('@/pages/experiments/deviation-list.vue') },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
