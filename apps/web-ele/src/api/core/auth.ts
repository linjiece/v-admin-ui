import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
    refreshToken: string;
  }

  export interface RefreshTokenResult {
    data: LoginResult;
    status: number;
  }

  export interface PermissionsResult {
    permissions: string[];
    is_superuser: boolean;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/api/core/login', data);
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi(refreshToken: string) {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>(
    '/api/core/refresh_token',
    {},
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    },
  );
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return baseRequestClient.post('/api/core/logout', {
    withCredentials: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<AuthApi.PermissionsResult>('/api/core/permissions');
}
