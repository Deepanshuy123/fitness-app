// src/Pages/Profile.tsx
import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../Context/AppContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
// removed Input import (we use native inputs now)
import ProgressBar from "../components/ui/ProgressBar";
import {
  User,
  Calendar,
  Scale,
  LogOut,
  Edit2,
  Ruler,
  Target,
} from "lucide-react";

const Profile = () => {
  const {
    user,
    setUser,
    allFoodLogs = [],
    allActivityLogs = [],
    logout,
  } = useAppContext();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    age: user?.age ?? "",
    weight: user?.weight ?? "",
    height: user?.height ?? "",
    goal: user?.goal ?? "",
  });

  useEffect(() => {
    setForm({
      age: user?.age ?? "",
      weight: user?.weight ?? "",
      height: user?.height ?? "",
      goal: user?.goal ?? "",
    });
  }, [user?.age, user?.weight, user?.height, user?.goal]);

  const foodCount = useMemo(() => {
    if (Array.isArray(allFoodLogs)) return allFoodLogs.length;
    return Object.values(allFoodLogs || {}).length;
  }, [allFoodLogs]);

  const activityCount = useMemo(() => {
    if (Array.isArray(allActivityLogs)) return allActivityLogs.length;
    return Object.values(allActivityLogs || {}).length;
  }, [allActivityLogs]);

  const memberSince = useMemo(() => {
    const created = user?.createdAt;
    if (!created) return null;
    try {
      const d = new Date(created);
      return d.toLocaleDateString();
    } catch {
      return created;
    }
  }, [user]);

  const bmi = useMemo(() => {
    if (!user?.weight || !user?.height) return 0;
    const heightM = user.height / 100;
    if (!heightM) return 0;
    return +(user.weight / (heightM * heightM)).toFixed(1);
  }, [user]);

  const bmiColor =
    bmi === 0
      ? "bg-gray-400"
      : bmi < 18.5
      ? "bg-blue-500"
      : bmi < 25
      ? "bg-green-500"
      : bmi < 30
      ? "bg-yellow-500"
      : "bg-red-500";

  const handleChange = (key: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // client-side update only
      if (!user || !setUser) return;
      const updated = {
        ...user,
        age: form.age === "" ? undefined : Number(form.age),
        weight: form.weight === "" ? undefined : Number(form.weight),
        height: form.height === "" ? undefined : Number(form.height),
        goal: form.goal,
      } as NonNullable<typeof user>;
      setUser(updated);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save profile", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Profile</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Manage your settings
            </p>
          </div>

          <div />
        </div>
      </div>

      <div className="mt-6 dashboard-grid grid grid-cols-2 gap-6 items-start">
        {/* left: profile card */}
        <Card className="space-y-4 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm text-slate-400">Your Profile</div>
                <div className="font-medium text-slate-200">
                  {user?.username ?? "-"}
                </div>
                {memberSince && (
                  <div className="text-xs text-slate-400">
                    Member since {memberSince}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setForm({
                        age: user?.age ?? "",
                        weight: user?.weight ?? "",
                        height: user?.height ?? "",
                        goal: user?.goal ?? "",
                      });
                    }}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    Save
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* profile form / view */}
          <div className="space-y-3">
            {/* Age */}
            <div>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Age
              </div>
              {!isEditing ? (
                <div className="mt-2 px-4 py-3 bg-slate-800 rounded-md text-slate-200">
                  {user?.age ?? "-"} years
                </div>
              ) : (
                <input
                  value={String(form.age)}
                  onChange={(e) => handleChange("age", e.target.value)}
                  type="number"
                  placeholder="Age"
                  className="mt-2 w-full px-4 py-3 bg-slate-800 rounded-md text-slate-200 outline-none"
                />
              )}
            </div>

            {/* Weight */}
            <div>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Scale className="w-4 h-4" /> Weight
              </div>
              {!isEditing ? (
                <div className="mt-2 px-4 py-3 bg-slate-800 rounded-md text-slate-200">
                  {user?.weight ?? "0"} kg
                </div>
              ) : (
                <input
                  value={String(form.weight)}
                  onChange={(e) => handleChange("weight", e.target.value)}
                  type="number"
                  placeholder="Weight (kg)"
                  className="mt-2 w-full px-4 py-3 bg-slate-800 rounded-md text-slate-200 outline-none"
                />
              )}
            </div>

            {/* Height */}
            <div>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Ruler className="w-4 h-4" /> Height
              </div>
              {!isEditing ? (
                <div className="mt-2 px-4 py-3 bg-slate-800 rounded-md text-slate-200">
                  {user?.height ?? "-"} cm
                </div>
              ) : (
                <input
                  value={String(form.height)}
                  onChange={(e) => handleChange("height", e.target.value)}
                  type="number"
                  placeholder="Height (cm)"
                  className="mt-2 w-full px-4 py-3 bg-slate-800 rounded-md text-slate-200 outline-none"
                />
              )}
            </div>

            {/* Goal */}
            <div>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Target className="w-4 h-4" /> Goal
              </div>
              {!isEditing ? (
                <div className="mt-2 px-4 py-3 bg-slate-800 rounded-md text-slate-200">
                  {user?.goal ?? "Maintain Weight"}
                </div>
              ) : (
                <input
                  value={String(form.goal)}
                  onChange={(e) => handleChange("goal", e.target.value)}
                  placeholder="Goal (e.g. Lose Weight / Maintain Weight)"
                  className="mt-2 w-full px-4 py-3 bg-slate-800 rounded-md text-slate-200 outline-none"
                />
              )}
            </div>
          </div>
        </Card>

        {/* right column: stats & BMI */}
        <div className="space-y-4 min-w-0">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">Your Stats</div>
                <div className="mt-2 flex gap-3">
                  <div className="px-4 py-3 bg-slate-900 rounded-md text-center">
                    <div className="text-xs text-slate-400">Food entries</div>
                    <div className="text-lg font-bold text-emerald-400">{foodCount}</div>
                  </div>
                  <div className="px-4 py-3 bg-slate-900 rounded-md text-center">
                    <div className="text-xs text-slate-400">Activities</div>
                    <div className="text-lg font-bold text-sky-400">{activityCount}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="space-y-3">
            <div className="text-sm text-slate-400">Body Metrics</div>
            <div className="pt-2 space-y-2">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Weight</span>
                <span>{user?.weight ?? "0"} kg</span>
              </div>
              <div className="flex justify-between text-sm text-slate-400">
                <span>Height</span>
                <span>{user?.height ?? "-"} cm</span>
              </div>

              <div>
                <div className="text-xs text-slate-400 mb-2">BMI</div>
                <ProgressBar value={bmi} max={40} color={bmiColor} />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>18.5</span>
                  <span>{bmi ? bmi.toFixed(1) : 0}</span>
                  <span>40</span>
                </div>
              </div>
            </div>
          </Card>

          <div>
            <Button
              variant="danger"
              onClick={() => logout && logout()}
              className="w-full flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;