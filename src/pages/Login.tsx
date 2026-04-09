import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation, type Location } from "react-router-dom";
import axios from "axios";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

import Axios from "../lib/Axios";
import SummaryApi from "../constants/SummaryApi";
import { setCredentials, setLoading } from "../redux/slices/auth.slice";

type LocationState = {
  from?: Location;
};

function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string; error?: string }
      | undefined;
    return data?.message || data?.error || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

function persistToken(token?: string) {
  if (!token) return;
  localStorage.setItem("authToken", token);
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const location = useLocation() as Location & { state?: LocationState };
  const from = location.state?.from?.pathname || "/admin";

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.trim().length > 0;
  }, [email, password]);

  const onLocalLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    dispatch(setLoading(true));

    try {
      const { data } = await Axios.request({
        method: SummaryApi.login.method,
        url: SummaryApi.login.url,
        data: { email, password },
        withCredentials: true,
      });

      if (data?.success && data?.user) {
        const accessToken = data?.accessToken || "";

        persistToken(accessToken);
        dispatch(
          setCredentials({
            user: data.user,
            token: accessToken,
          })
        );

        navigate(from, { replace: true });
      } else {
        setError(data?.message || "Login failed");
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Login failed"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#071122] px-4 py-6 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute right-[-100px] top-[10%] h-[280px] w-[280px] rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="absolute bottom-[-120px] left-1/2 h-[260px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_35%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.05] shadow-[0_25px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden min-h-[560px] overflow-hidden lg:block">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(29,78,216,0.28),rgba(168,85,247,0.18),rgba(236,72,153,0.16))]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.16),transparent_30%)]" />

            <div className="relative flex h-full flex-col justify-between p-8 text-white">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-sm font-semibold tracking-wide">
                    TN Tech Connect
                  </span>
                </div>

                <div className="mt-10 max-w-md">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
                    Secure Admin Access
                  </p>
                  <h2 className="text-4xl font-black leading-tight tracking-tight">
                    Premium control panel for your admin operations.
                  </h2>
                  <p className="mt-4 max-w-sm text-sm leading-7 text-white/75">
                    Sign in to manage platform activity, users, approvals, and
                    operational workflows from one secure dashboard.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                  <p className="text-xs text-white/60">Protected Session</p>
                  <p className="mt-1 text-sm font-semibold">JWT-secured login</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                  <p className="text-xs text-white/60">Admin Control</p>
                  <p className="mt-1 text-sm font-semibold">
                    Manage core modules
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md">
              <div className="mb-6">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/70 lg:hidden">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-semibold tracking-wide">
                    TN Tech Connect
                  </span>
                </div>

                <h1 className="text-3xl font-black tracking-tight text-white">
                  Admin Login
                </h1>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  Use your admin credentials to continue securely.
                </p>
              </div>

              <form onSubmit={onLocalLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/75">
                    Email
                  </label>
                  <div className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 transition focus-within:border-blue-400/40 focus-within:bg-white/[0.06]">
                    <Mail className="h-4 w-4 text-white/60 transition group-focus-within:text-white" />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="admin@example.com"
                      required
                      autoComplete="email"
                      className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-white/30"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/75">
                    Password
                  </label>
                  <div className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 transition focus-within:border-blue-400/40 focus-within:bg-white/[0.06]">
                    <Lock className="h-4 w-4 text-white/60 transition group-focus-within:text-white" />
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-white/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/75 transition hover:bg-white/10 hover:text-white"
                      aria-label={showPass ? "Hide password" : "Show password"}
                    >
                      {showPass ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-white/90">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-200" />
                    <p className="leading-6">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-violet-500 to-pink-500 px-4 py-3.5 text-sm font-bold text-white shadow-[0_12px_35px_rgba(59,130,246,0.28)] transition hover:scale-[1.01] hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in
                </button>
              </form>

              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-xs leading-5 text-white/45">
                  By continuing, you agree to the platform security policies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}