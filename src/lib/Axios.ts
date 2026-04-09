// src/lib/Axios.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { baseURL } from "../constants/SummaryApi";
import { store } from "../redux/store";
import { logout, setUser } from "../redux/slices/auth.slice";

const API_BASE = import.meta.env.VITE_API_BASE ?? baseURL ?? "";

const raw = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

const Axios = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

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
      url.includes("/auth/logout");

    if (status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;

      try {
        const me = await raw.get("/api/auth/me");
        const user = (me.data as any)?.user ?? (me.data as any)?.data ?? null;

        if (user) {
          store.dispatch(setUser(user));
          return Axios(original);
        }
      } catch {
        store.dispatch(logout());
      }
    }

    return Promise.reject(error);
  }
);

export { raw };
export default Axios;