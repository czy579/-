import { createServerClient } from '@supabase/ssr';

/**
 * 带 service_role 的 Supabase 客户端（服务端专用）
 * 绕过 RLS 策略，直接访问数据库
 * 仅应在 API 路由中使用
 */
export function getServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createServerClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
  });
}
