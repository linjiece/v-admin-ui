import type { SetupMyTable } from './types';

import { useVbenForm } from '@vben/common-ui';

// 是否加载过
let isInit = false;

// eslint-disable-next-line import/no-mutable-exports
export let useTableForm: typeof useVbenForm;

export function initMyTable() {
  if (isInit) {
    return;
  }
  isInit = true;
}

export function setupMyTable(setupOptions: SetupMyTable) {
  const { useVbenForm: _useVbenForm } = setupOptions;
  useTableForm = _useVbenForm;
  initMyTable();
}
