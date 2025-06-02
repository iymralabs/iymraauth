// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import { User } from "../types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}
interface RegisterUserData
  extends Omit<User, "$id" | "createdAt" | "updatedAt" | "emailVerified"> {
  password: string;
  address?: Address;
}
interface AuthCtx {
  user: User | null;
  loading: boolean;
  error: string | null;
  login(e: string, p: string): Promise<void>;
  register(d: RegisterUserData): Promise<void>;
  logout(): void;
  updateProfile(d: Partial<User> & { address?: Address }): Promise<void>;
  clearError(): void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const mapApiUser = (api: any): User => {
  // 👉 সাপোর্ট করে দুই রকম স্ট্রাকচার—ফ্ল্যাট আর নেস্টেড
  const flat = {
    line1: api.addressLine1,
    line2: api.addressLine2,
    city: api.addressCity,
    state: api.addressState,
    zip: api.addressZip,
    country: api.addressCountry,
  };
  const nested = api.address ?? {};

  return {
    ...api,
    address: {
      line1: nested.line1 ?? flat.line1 ?? "",
      line2: nested.line2 ?? flat.line2 ?? "",
      city: nested.city ?? flat.city ?? "",
      state: nested.state ?? flat.state ?? "",
      zip: nested.zip ?? flat.zip ?? "",
      country: nested.country ?? flat.country ?? "",
    },
  };
};

const flattenAddress = (addr: Address | undefined) => ({
  addressLine1: addr?.line1,
  addressLine2: addr?.line2,
  addressCity: addr?.city,
  addressState: addr?.state,
  addressZip: addr?.zip,
  addressCountry: addr?.country,
});

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */
const AuthContext = createContext<AuthCtx | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoad] = useState(true);
  const [error, setErr] = useState<string | null>(null);
  const nav = useNavigate();

  /* 1️⃣ ইনিশিয়াল অথেন্টিকেশন চেক */
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          axios.defaults.headers.common.Authorization = `Bearer ${token}`;
          const { data } = await axios.get(`${API_URL}/api/me`);
          setUser(mapApiUser(data));
        }
      } catch {
        localStorage.clear();
      } finally {
        setLoad(false);
      }
    })();
  }, []);

  /* 2️⃣ রিফ্রেশ-টোকেন ইন্টারসেপ্টর */
  useEffect(() => {
    const id = axios.interceptors.response.use(
      (r) => r,
      async (err) => {
        const orig = err.config;
        if (err.response?.status === 401 && !orig._retry) {
          orig._retry = true;
          try {
            const rt = localStorage.getItem("refreshToken");
            if (!rt) throw new Error();
            const { data } = await axios.post(`${API_URL}/api/token/refresh`, {
              refreshToken: rt,
            });
            localStorage.setItem("accessToken", data.accessToken);
            axios.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
            return axios(orig);
          } catch {
            logout();
            return Promise.reject(err);
          }
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(id);
  }, []);

  /* 3️⃣ হেলপার মেথডস */
  const login = async (email: string, password: string) => {
    try {
      setLoad(true);
      setErr(null);
      const { data } = await axios.post(`${API_URL}/api/login`, {
        email,
        password,
      });
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      axios.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
      setUser(mapApiUser(data.user));
      nav("/profile");
    } catch (e: any) {
      setErr(e.response?.data?.message || "Login failed");
    } finally {
      setLoad(false);
    }
  };

  const register = async (info: RegisterUserData) => {
    try {
      setLoad(true);
      setErr(null);
      const payload: any = { ...info, ...flattenAddress(info.address) };
      delete payload.address;
      await axios.post(`${API_URL}/api/register`, payload);
      nav("/login", {
        state: { message: "Registration successful! Verify your email." },
      });
    } catch (e: any) {
      setErr(e.response?.data?.message || "Registration failed");
    } finally {
      setLoad(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    delete axios.defaults.headers.common.Authorization;
    setUser(null);
    nav("/login");
  };

  const updateProfile = async (
    values: Partial<User> & { address?: Address }
  ) => {
    try {
      setLoad(true);
      setErr(null);
      const payload: any = { ...values, ...flattenAddress(values.address) };
      delete payload.address;
      const { data } = await axios.put(`${API_URL}/api/me`, payload);
      setUser(mapApiUser(data));
    } catch (e: any) {
      setErr(e.response?.data?.message || "Profile update failed");
    } finally {
      setLoad(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: error ? false : loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        clearError: () => setErr(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

