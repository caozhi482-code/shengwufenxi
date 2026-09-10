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
      { path: 'project-resource-allocation', component: () => import('@/pages/experiments/project-resource-allocation.vue') },
      { path: 'special-resource-request', component: () => import('@/pages/experiments/special-resource-request.vue') },
      { path: 'ledger-discovery', component: () => import('@/pages/experiments/ledger-discovery.vue') },
      { path: 'plans/new/task-assignment', component: () => import('@/pages/experiments/plan-task-assignment.vue') },
      { path: 'plans/:planId/items/:itemId/sequence-template', component: () => import('@/pages/experiments/sequence-table.vue') },
      { path: 'method-management', component: () => import('@/pages/experiments/method-management.vue') },
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
  {
    path: '/warehouse',
    redirect: '/warehouse/dashboard',
    children: [
      { path: 'dashboard', component: () => import('@/views/warehouse/Dashboard.vue') },
      { path: 'inventory', component: () => import('@/views/warehouse/Inventory.vue') },
      { path: 'inbound', component: () => import('@/views/warehouse/InboundApplication.vue') },
      { path: 'outbound', component: () => import('@/views/warehouse/Outbound.vue') },
      { path: 'stock-count', component: () => import('@/views/warehouse/StockCount.vue') },
      { path: 'locations', component: () => import('@/views/warehouse/Locations.vue') },
      { path: 'categories', component: () => import('@/views/warehouse/Categories.vue') },
      { path: 'barcodes', component: () => import('@/views/warehouse/Barcodes.vue') },
      { path: 'alerts', component: () => import('@/views/warehouse/Alerts.vue') },
    ],
  },
  {
    path: '/procurement',
    redirect: '/procurement/requests',
    children: [
      { path: 'requests', component: () => import('@/views/procurement/Requests.vue') },
      { path: 'requests/:id', component: () => import('@/views/procurement/RequestDetail.vue') },
      { path: 'records', component: () => import('@/views/procurement/Records.vue') },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
