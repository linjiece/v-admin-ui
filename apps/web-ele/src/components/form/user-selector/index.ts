import { defineAsyncComponent } from 'vue';

export const UserSelector = defineAsyncComponent(() =>
  import('./src/user-selector.vue').then((module) => module.default),
);

export * from './src/types';
