import React, { createContext, useContext, useEffect, useState } from "react";
import { initialState, type AppContextType, type ActivityEntry, type Credentials, type FoodEntry, type User } from "../Types";
import { useNavigate } from "react-router-dom";
import api from "../configs/api";
import toast from "react-hot-toast";

const AppContext = createContext<AppContextType>(initialState);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>(null);
  const [isUserFetched, setIsUserFetched] = useState<boolean>(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);
  const [allFoodLogs, setAllFoodLogs] = useState<FoodEntry[]>([]);
  const [allActivityLogs, setAllActivityLogs] = useState<ActivityEntry[]>([]);

  const normalizeDateToISO = (val: unknown): string | null => {
    if (val == null) return null;
    const d = new Date(val as string | number | Date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  };

  const safeToastError = (err: unknown, fallback = "Something went wrong") => {
    try {
      const error = err as Error & { response?: { data?: { message?: string } } };
      let msg = error?.response?.data?.message || error?.message || fallback;
      if (msg?.toString().includes("ECONNREFUSED") || msg?.toString().includes("Network Error")) {
        msg = "Cannot connect to the backend. Start the Strapi server on localhost:1337.";
      }
      toast.error(msg);
    } catch {
      toast.error(fallback);
    }
  };

  const fetchUser = async (token: string) => {
    if (!token) {
      setUser(null);
      setIsUserFetched(true);
      return null;
    }

    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const { data } = await api.get("/api/users/me");
      setUser({ ...data, token });
      if (data?.age && data?.weight && data?.goal) setOnboardingCompleted(true);
      return data;
    } catch (error: unknown) {
      safeToastError(error, "Failed to fetch user");
      setUser(null);
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      return null;
    } finally {
      setIsUserFetched(true);
    }
  };

  const fetchFoodLogs = async (token: string) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const { data } = await api.get("/api/food-logs", { headers });
      const normalized = (data || []).map((f: Record<string, unknown>) => ({
        ...f,
        calories: Number(f?.calories ?? 0),
        createdAt: normalizeDateToISO(f?.createdAt),
      }));
      setAllFoodLogs(normalized);
      return normalized;
    } catch {
      setAllFoodLogs([]);
      return [];
    }
  };

  const fetchActivityLogs = async (token: string) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const { data } = await api.get("/api/activity-logs", { headers });
      const normalized = (data || []).map((a: Record<string, unknown>) => ({
        ...a,
        calories: Number(a?.calories ?? 0),
        duration: Number(a?.duration ?? 0),
        createdAt: normalizeDateToISO(a?.createdAt),
      }));
      setAllActivityLogs(normalized);
      return normalized;
    } catch {
      setAllActivityLogs([]);
      return [];
    }
  };

  const populateDevFallbackIfNeeded = (food: FoodEntry[], activity: ActivityEntry[]) => {
    const isLocal =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    if (!isLocal) return;
    if ((food && food.length > 0) || (activity && activity.length > 0)) return;

    const today = new Date();
    const sampleFood: FoodEntry[] = [];
    const sampleActivity: ActivityEntry[] = [];

    for (let i = 0; i < 4; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      sampleFood.push({
        id: `dev-food-${i}`,
        name: `Sample Meal ${i}`,
        calories: 300 + 50 * i,
        mealType: "lunch",
        date: d.toISOString(),
        createdAt: d.toISOString(),
      });
      sampleActivity.push({
        id: i,
        name: "run",
        calories: 150 + 20 * i,
        duration: 20 + 5 * i,
        date: d.toISOString(),
        documentId: `dev-act-${i}`,
        createdAt: d.toISOString(),
      });
    }

    setAllFoodLogs(sampleFood);
    setAllActivityLogs(sampleActivity);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    (async () => {
      try {
        if (token) {
          await fetchUser(token);
          await fetchFoodLogs(token);
          await fetchActivityLogs(token);
        } else {
          setIsUserFetched(true);
          try {
            const foodResp = await fetchFoodLogs("");
            const activityResp = await fetchActivityLogs("");
            populateDevFallbackIfNeeded(foodResp, activityResp);
          } catch {
            // Ignore errors in dev fallback
          }
        }
        populateDevFallbackIfNeeded(allFoodLogs, allActivityLogs);
      } catch {
        // Ignore initialization errors
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signup = async (credentials: Credentials) => {
    try {
      const { data } = await api.post("/api/auth/local/register", credentials);
      setUser({ ...data.user, token: data.jwt });
      if (data?.user?.age && data?.user?.weight && data?.user?.goal) setOnboardingCompleted(true);
      localStorage.setItem("token", data.jwt);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.jwt}`;
      return data;
    } catch (error: unknown) {
      safeToastError(error, "Signup failed");
      throw error;
    }
  };

  const login = async (credentials: Credentials) => {
    try {
      const { data } = await api.post("/api/auth/local", {
        identifier: credentials.email,
        password: credentials.password,
      });
      setUser({ ...data.user, token: data.jwt });
      if (data?.user?.age && data?.user?.weight && data?.user?.goal) setOnboardingCompleted(true);
      localStorage.setItem("token", data.jwt);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.jwt}`;
      return data;
    } catch (error: unknown) {
      safeToastError(error, "Login failed");
      throw error;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("token");
      setUser(null);
      setOnboardingCompleted(false);
      navigate("/");
      delete api.defaults.headers.common["Authorization"];
    } catch {
      // Ignore logout errors
    }
  };

  const value = {
    user,
    setUser,
    isUserFetched,
    fetchUser,
    signup,
    login,
    logout,
    onboardingCompleted,
    setOnboardingCompleted,
    allFoodLogs,
    setAllFoodLogs,
    allActivityLogs,
    setAllActivityLogs,
  } as unknown as AppContextType;

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);