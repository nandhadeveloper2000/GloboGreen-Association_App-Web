import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { baseURL } from "../constants/SummaryApi";
import { store } from "../redux/store";
import { logout, setUser } from "../redux/slices/auth.slice";

const API_BASE = import.meta.env.VITE_API_BASE ?? baseURL ?? "";

const raw = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const Axios = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

function getStoredToken() {
  try {
    return localStorage.getItem("accessToken");
  } catch {
    return null;
  }
}

function clearStoredToken() {
  try {
    localStorage.removeItem("accessToken");
  } catch {
    //
  }
}

function attachToken(config: InternalAxiosRequestConfig) {
  const token = getStoredToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}

raw.interceptors.request.use(
  (config) => attachToken(config),
  (error) => Promise.reject(error)
);

Axios.interceptors.request.use(
  (config) => attachToken(config),
  (error) => Promise.reject(error)
);

Axios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as RetryableRequestConfig | undefined;

    if (!original) {
      return Promise.reject(error);
    }

    const url = String(original.url ?? "");

    const isAuthEndpoint =
      url.includes("/auth/me") ||
      url.includes("/auth/login") ||
      url.includes("/auth/google-login") ||
      url.includes("/auth/logout") ||
      url.includes("/auth/register") ||
      url.includes("/auth/send-login-otp") ||
      url.includes("/auth/login-otp") ||
      url.includes("/auth/send-verify-email-otp") ||
      url.includes("/auth/verify-email-otp") ||
      url.includes("/auth/forgot-password-otp") ||
      url.includes("/auth/verify-forgot-password-otp") ||
      url.includes("/auth/reset-password");

    if (status === 401) {
      clearStoredToken();
      store.dispatch(logout());

      if (!isAuthEndpoint && !original._retry) {
        original._retry = true;
      }
    }

    return Promise.reject(error);
  }
);

export async function fetchCurrentUser() {
  const response = await raw.get("/api/auth/me");
  const payload = response.data as any;

  const user =
    payload?.user ??
    payload?.data?.user ??
    payload?.data ??
    null;

  if (user) {
    store.dispatch(setUser(user));
  }

  return user;
}

export { raw };
export default Axios;