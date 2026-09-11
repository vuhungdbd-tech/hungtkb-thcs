import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfigInfo {
  url: string;
  anonKey: string;
  isCustom: boolean;
  defaultUrl: string;
  defaultAnonKey: string;
}

const DEFAULT_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mqvxqmpsclimxhxaoigw.supabase.co';
const DEFAULT_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xdnhxbXBzY2xpbXhoeGFvaWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NjAxMzgsImV4cCI6MjEwNDIzNjEzOH0.wLUk02c2ikoVzzty8LqYiRl6PhRSqGL2uWeXyUvPD6U';

export function getSupabaseConfig(): SupabaseConfigInfo {
  let customUrl = '';
  let customAnonKey = '';
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      customUrl = window.localStorage.getItem('custom_supabase_url') || '';
      customAnonKey = window.localStorage.getItem('custom_supabase_anon_key') || '';
    }
  } catch {}

  const url = customUrl.trim() || DEFAULT_URL;
  const anonKey = customAnonKey.trim() || DEFAULT_ANON_KEY;

  return {
    url,
    anonKey,
    isCustom: !!(customUrl.trim() || customAnonKey.trim()),
    defaultUrl: DEFAULT_URL,
    defaultAnonKey: DEFAULT_ANON_KEY,
  };
}

export function setCustomSupabaseConfig(url: string, anonKey: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (url && url.trim()) {
        window.localStorage.setItem('custom_supabase_url', url.trim());
      } else {
        window.localStorage.removeItem('custom_supabase_url');
      }
      if (anonKey && anonKey.trim()) {
        window.localStorage.setItem('custom_supabase_anon_key', anonKey.trim());
      } else {
        window.localStorage.removeItem('custom_supabase_anon_key');
      }
    }
  } catch {}
}

export function resetSupabaseConfig(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('custom_supabase_url');
      window.localStorage.removeItem('custom_supabase_anon_key');
    }
  } catch {}
}

// Custom resilient fetch: tries direct fetch first, and automatically falls back to local server proxy
// if direct fetch is blocked by ISP firewalls (VNPT/Viettel in Vietnam), adblockers, or iframe restrictions.
const safeFetch: typeof fetch = async (input, init) => {
  const urlStr = typeof input === 'string' ? input : (input && 'url' in input ? (input as any).url : String(input));
  const isSupabaseRequest = urlStr.includes('.supabase.co') || urlStr.includes('/rest/v1/') || urlStr.includes('/auth/v1/') || urlStr.includes('/storage/v1/');

  // Helper to ensure Supabase client NEVER crashes on HTML responses (like 404 HTML, captive portals, Cloudflare errors)
  const wrapResponseIfHtml = async (resp: Response): Promise<Response> => {
    if (!isSupabaseRequest) return resp;

    const contentType = resp.headers.get('content-type') || '';
    if (contentType.includes('text/html') || contentType.includes('text/plain')) {
      try {
        const clone = resp.clone();
        const text = await clone.text();
        const trimmed = text.trim();
        if (trimmed.startsWith('<') || contentType.includes('text/html')) {
          let msg = 'Máy chủ phản hồi bằng trang HTML thay vì JSON. Dự án Supabase có thể không tồn tại hoặc đang bị tạm dừng.';
          let code = 'PGRST_HTML_RESPONSE';

          if (resp.status === 404 || text.includes('not found') || text.includes('Project not found')) {
            msg = 'Dự án Supabase không tồn tại hoặc đã bị tạm dừng (Paused). Vui lòng kiểm tra lại Project URL trên Supabase.';
            code = 'PGRST_PROJECT_NOT_FOUND';
          } else if (resp.status === 521 || resp.status === 522 || resp.status === 525) {
            msg = 'Máy chủ Supabase không thể phản hồi (Lỗi Cloudflare).';
            code = 'PGRST_SERVER_UNREACHABLE';
          }

          return new Response(
            JSON.stringify({
              code,
              message: msg,
              details: `HTTP ${resp.status}: HTML response received.`,
              hint: 'Kiểm tra lại Supabase Project URL hoặc bấm "Khôi phục mặc định" để dùng máy chủ mặc định.',
            }),
            {
              status: resp.status >= 400 ? resp.status : 502,
              statusText: resp.statusText || 'Bad Gateway',
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      } catch {}
    }

    return resp;
  };

  // Helper to query via local proxy
  const fetchViaProxy = async () => {
    const proxyUrl = `/api/supabase/proxy?url=${encodeURIComponent(urlStr)}`;
    const headers = new Headers(init?.headers || {});
    const proxyResp = await fetch(proxyUrl, {
      method: init?.method || 'GET',
      headers,
      body: init?.body,
    });
    return await wrapResponseIfHtml(proxyResp);
  };

  // 1. Try direct fetch first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      try {
        controller.abort();
      } catch {}
    }, 6000);

    let signal = controller.signal;
    if (init?.signal) {
      if (init.signal.aborted) {
        controller.abort();
      } else {
        init.signal.addEventListener('abort', () => {
          try {
            controller.abort();
          } catch {}
        }, { once: true });
      }
    }

    const response = await fetch(input, {
      ...init,
      signal,
    });
    clearTimeout(timeoutId);

    // If direct response is HTML or unhandled gateway error, try proxy fallback
    const contentType = response.headers.get('content-type') || '';
    if (isSupabaseRequest && (contentType.includes('text/html') || response.status === 502 || response.status === 504 || response.status === 521 || response.status === 522)) {
      try {
        const proxyRes = await fetchViaProxy();
        if (proxyRes.ok) return proxyRes;
      } catch {}
    }

    return await wrapResponseIfHtml(response);
  } catch (directErr: any) {
    // 2. Direct fetch failed (e.g. Failed to fetch, DNS lookup error, network timeout, adblocker)
    if (isSupabaseRequest && typeof window !== 'undefined') {
      try {
        const proxyResponse = await fetchViaProxy();
        return proxyResponse;
      } catch (proxyErr) {
        // Both direct and proxy failed
      }
    }

    // Return friendly error response for auth
    if (urlStr.includes('/auth/v1/')) {
      return new Response(
        JSON.stringify({
          error: 'network_unavailable',
          error_description: 'Không thể kết nối đến máy chủ xác thực',
          message: 'Không thể kết nối đến máy chủ xác thực',
        }),
        {
          status: 400,
          statusText: 'Bad Request',
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Return friendly error response for database queries
    return new Response(
      JSON.stringify({
        code: 'PGRST_OFFLINE',
        message: 'Không thể kết nối đến máy chủ Supabase qua mạng trực tiếp lẫn máy chủ Proxy.',
        details: directErr?.message || 'Network failure',
        hint: 'Dữ liệu được lưu trữ an toàn trong máy tính (localStorage).',
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// Clean up any corrupt or incomplete Supabase auth tokens in storage before initializing
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const val = localStorage.getItem(key);
        if (val) {
          try {
            const parsed = JSON.parse(val);
            if (!parsed || !parsed.access_token) {
              localStorage.removeItem(key);
            }
          } catch {
            localStorage.removeItem(key);
          }
        }
      }
    }
  }
} catch {}

function createConfiguredClient(): SupabaseClient {
  const cfg = getSupabaseConfig();
  const client = createClient(cfg.url, cfg.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: false,
      lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
        try {
          return await fn();
        } catch {
          return null;
        }
      },
    },
    global: {
      fetch: safeFetch,
    },
  });

  if (client.auth) {
    const origGetSession = client.auth.getSession.bind(client.auth);
    client.auth.getSession = async () => {
      try {
        const res = await origGetSession();
        return res || { data: { session: null }, error: null };
      } catch {
        return { data: { session: null }, error: null };
      }
    };

    const origGetUser = client.auth.getUser.bind(client.auth);
    client.auth.getUser = async (jwt?: string) => {
      try {
        const res = await origGetUser(jwt);
        return res || { data: { user: null }, error: null };
      } catch {
        return { data: { user: null }, error: null };
      }
    };

    const origSignOut = client.auth.signOut.bind(client.auth);
    client.auth.signOut = async (options?: any) => {
      try {
        const res = await origSignOut(options);
        return res || { error: null };
      } catch {
        return { error: null };
      }
    };

    const origRefreshSession = client.auth.refreshSession.bind(client.auth);
    client.auth.refreshSession = async (currentSession?: any) => {
      try {
        const res = await origRefreshSession(currentSession);
        return res || { data: { session: null, user: null }, error: null };
      } catch {
        return { data: { session: null, user: null }, error: null };
      }
    };
  }

  return client;
}

export let supabase: SupabaseClient = createConfiguredClient();

export function reloadSupabaseClient(): SupabaseClient {
  supabase = createConfiguredClient();
  return supabase;
}

// Deep health test function to diagnose connection and database status
export async function testSupabaseHealth(): Promise<{
  success: boolean;
  message: string;
  tableExists: boolean;
  canWrite: boolean;
  connectionMode: 'direct' | 'proxy' | 'unknown';
  details?: string;
}> {
  const cfg = getSupabaseConfig();

  if (!supabase || !cfg.url) {
    return {
      success: false,
      message: 'Chưa cấu hình Supabase URL hoặc Anon Key.',
      tableExists: false,
      canWrite: false,
      connectionMode: 'unknown',
    };
  }

  try {
    // 1. Check Read on app_data table
    const readRes = await supabase
      .from('app_data')
      .select('id')
      .limit(1);

    if (readRes.error) {
      const errCode = readRes.error.code || '';
      const errMsg = readRes.error.message || '';
      const fullErrorStr = `${errCode} ${errMsg} ${JSON.stringify(readRes.error)}`;

      if (
        errCode === 'PGRST_PROJECT_NOT_FOUND' || 
        errCode === 'PGRST_HTML_RESPONSE' || 
        errCode === 'PGRST_PROXY_FAILED' ||
        fullErrorStr.includes('ENOTFOUND') || 
        fullErrorStr.includes('fetch failed') ||
        fullErrorStr.includes('Unexpected token') ||
        fullErrorStr.includes('HTML') ||
        fullErrorStr.includes('not found')
      ) {
        return {
          success: false,
          message: `Dự án Supabase (${cfg.url}) không thể kết nối. Tên miền này không tồn tại trong hệ thống DNS, sai đường dẫn URL hoặc dự án đang bị Tạm dừng (Paused).`,
          tableExists: false,
          canWrite: false,
          connectionMode: 'unknown',
          details: 'Vui lòng kiểm tra lại Project URL trên dashboard.supabase.com hoặc bấm "Khôi phục mặc định" để dùng máy chủ mặc định đang hoạt động.',
        };
      }

      if (errCode === '42P01' || errMsg.includes('does not exist') || errMsg.includes('relation "public.app_data"')) {
        return {
          success: false,
          message: 'Bảng app_data chưa tồn tại trên dự án Supabase này. Vui lòng sao chép đoạn mã SQL bên dưới và chạy trong SQL Editor trên Supabase.',
          tableExists: false,
          canWrite: false,
          connectionMode: 'unknown',
          details: errMsg,
        };
      }

      if (errMsg.includes('Invalid API key') || errMsg.includes('JWT') || readRes.error.code === 'PGRST301') {
        return {
          success: false,
          message: 'Khóa API (Anon Key) không đúng hoặc đã hết hạn. Vui lòng kiểm tra lại Anon Key trong Project Settings -> API của Supabase.',
          tableExists: false,
          canWrite: false,
          connectionMode: 'unknown',
          details: errMsg,
        };
      }

      return {
        success: false,
        message: `Lỗi kết nối bảng app_data: ${errMsg || errCode}. Vui lòng chạy mã SQL bên dưới trên Supabase SQL Editor.`,
        tableExists: false,
        canWrite: false,
        connectionMode: 'unknown',
        details: errMsg,
      };
    }

    // 2. Test Write/Upsert permission on app_data table
    const pingId = '__ping_test__' + Date.now();
    let canWrite = false;
    try {
      const writeRes = await supabase
        .from('app_data')
        .upsert({
          id: pingId,
          data: { ping: true, time: new Date().toISOString() },
          updated_at: new Date().toISOString(),
        });

      if (!writeRes.error) {
        canWrite = true;
        // Clean up ping record
        try {
          await supabase.from('app_data').delete().eq('id', pingId);
        } catch {}
      }
    } catch {
      canWrite = false;
    }

    return {
      success: true,
      message: canWrite 
        ? 'Kết nối Supabase & bảng app_data thành công! Quyền đọc và ghi dữ liệu hoạt động hoàn hảo.' 
        : 'Kết nối đọc bảng app_data thành công! (Lưu ý: Quyền ghi dữ liệu RLS cần được kiểm tra nếu có tài khoản riêng).',
      tableExists: true,
      canWrite,
      connectionMode: 'direct',
    };
  } catch (err: any) {
    const rawMsg = err?.message || String(err);
    if (rawMsg.includes('Unexpected token') || rawMsg.includes('doctype') || rawMsg.includes('is not valid JSON') || rawMsg.includes('fetch failed')) {
      return {
        success: false,
        message: `Dự án Supabase (${cfg.url}) không thể kết nối. Tên miền này không tồn tại trong DNS, sai đường dẫn URL hoặc dự án đang bị Tạm dừng (Paused).`,
        tableExists: false,
        canWrite: false,
        connectionMode: 'unknown',
        details: 'Vui lòng kiểm tra lại URL tại dashboard.supabase.com hoặc bấm "Khôi phục mặc định".',
      };
    }

    return {
      success: false,
      message: `Không thể kết nối Supabase: ${rawMsg}. Vui lòng kiểm tra kết nối Internet hoặc tường lửa.`,
      tableExists: false,
      canWrite: false,
      connectionMode: 'unknown',
      details: rawMsg,
    };
  }
}
