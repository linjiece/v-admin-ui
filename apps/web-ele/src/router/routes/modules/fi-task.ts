import type { RouteRecordRaw } from 'vue-router';

const taskRoute: RouteRecordRaw[] = [
  {
    path: '/fi/task/detail/:taskId',
    name: 'FiTaskDetail',
    component: () => import('#/views/fi/task/detail.vue'),
    meta: {
      title: '任务详情',
      hideInBreadcrumb: true,
      hideInMenu: true,
      hideInTab: true,
    },
  },
];

export default taskRoute;
