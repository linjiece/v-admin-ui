/**
 * 请求客户端封装
 */
import type { RequestClientOptions } from '@vben/request';

import { useAppConfig } from '@vben/hooks';
import { preferences } from '@vben/preferences';
import {
  authenticateResponseInterceptor,
  defaultResponseInterceptor,
  errorMessageResponseInterceptor,
  RequestClient,
} from '@vben/request';
import { useAccessStore } from '@vben/stores';

import { ElMessage } from 'element-plus';

import { useAuthStore } from '#/store';

import { refreshTokenApi } from './core';

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

function createRequestClient(baseURL: string, options?: RequestClientOptions) {
  const client = new RequestClient({
    ...options,
    baseURL,
    paramsSerializer: (params) => {
      const searchParams = new URLSearchParams();
      for (const key in params) {
        const value = params[key];
        if (value === undefined || value === null) {
          continue;
        }
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, v));
        } else {
          searchParams.append(key, value);
        }
      }
      return searchParams.toString();
    },
  });

  /**
   * 重新认证逻辑
   */
  async function doReAuthenticate() {
    console.warn('Access token or refresh token is invalid or expired. ');
    const accessStore = useAccessStore();
    const authStore = useAuthStore();
    accessStore.setAccessToken(null);
    if (
      preferences.app.loginExpiredMode === 'modal' &&
      accessStore.isAccessChecked
    ) {
      accessStore.setLoginExpired(true);
    } else {
      await authStore.logout();
    }
  }

  /**
   * 刷新token逻辑
   */
  async function doRefreshToken() {
    const accessStore = useAccessStore();
    if (!accessStore.refreshToken) {
      console.error('No refresh token available, please login again.');
      await doReAuthenticate();
      throw new Error('No refresh token available');
    }
    const resp = await refreshTokenApi(accessStore.refreshToken);
    const newToken = resp.data?.accessToken || '';
    accessStore.setAccessToken(newToken);
    if (typeof resp.data === 'object' && resp.data?.refreshToken) {
      accessStore.setRefreshToken(resp.data.refreshToken);
    }
    return newToken;
  }

  function formatToken(token: null | string) {
    return token ? `Bearer ${token}` : null;
  }

  // 请求头处理
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      const accessStore = useAccessStore();

      config.headers.Authorization = formatToken(accessStore.accessToken);
      config.headers['Accept-Language'] = preferences.app.locale;
      return config;
    },
  });

  // 处理返回的响应数据格式
  client.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: 'code',
      dataField: 'data',
      successCode: 0,
    }),
  );

  // token过期的处理
  client.addResponseInterceptor(
    authenticateResponseInterceptor({
      client,
      doReAuthenticate,
      doRefreshToken,
      enableRefreshToken: preferences.app.enableRefreshToken,
      formatToken,
    }),
  );

  // 通用的错误处理,如果没有进入上面的错误处理逻辑，就会进入这里
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string, error) => {
      // 这里可以根据业务进行定制,你可以拿到 error 内的信息进行定制化处理，根据不同的 code 做不同的提示，而不是直接使用 message.error 提示 msg
      // 当前mock接口返回的错误字段是 error 或者 message
      const responseData = error?.response?.data ?? {};
      const status = error?.response?.status;
      let errorMessage =
        responseData?.message ||
        responseData?.error ||
        responseData?.msg ||
        responseData?.detail ||
        msg;
      // 特殊处理403禁止访问
      if (status === 403) {
        errorMessage = errorMessage || '您没有权限访问此资源';
      }

      // 特殊处理401未授权
      if (status === 401) {
        errorMessage = errorMessage || '认证失败，请重新登录';
      }
      console.error('[API Error]', {
        status,
        message: errorMessage,
        data: responseData,
      });

      if (errorMessage) {
        ElMessage.error(errorMessage || msg);
      }
    }),
  );

  return client;
}

// 创建一个默认的 request client 实例，默认返回响应体数据body
export const requestClient = createRequestClient(apiURL, {
  responseReturn: 'body',
});

export const baseRequestClient = new RequestClient({ baseURL: apiURL });
