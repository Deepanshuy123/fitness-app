// src/Pages/ActivityLog.tsx
import { useState, useEffect } from "react";
import { useAppContext } from "../Context/AppContext";
import type { ActivityEntry } from "../Types";
import Card from "../components/ui/Card";
import * as Lucide from "lucide-react";

/* defensive icon helper (same approach we used earlier) */
const getIcon = (name: string, defaultElement: JSX.Element) => {
  const IconComp = (Lucide as any)[name];
  return IconComp ? (props: any) => <IconComp {...props} /> : (props: any) => <span {...props}>{defaultElement}</span>;
};

const PlusIcon = getIcon("Plus", <span className="inline-block w-5 h-5">＋</span>);
const ClockIcon = getIcon("Clock", <span className="inline-block w-5 h-5">⏱</span>);
const ActivityIcon = getIcon("Activity", <span className="inline-block w-5 h-5">⚡</span>);
const FireIcon = getIcon("Zap", <span className="inline-block w-5 h-5">🔥</span>);
const Trash2Icon = getIcon("Trash2", <span className="inline-block w-5 h-5">🗑</span>);

const ActivityLog = () => {
  const { allActivityLogs, setAllActivityLogs } = useAppContext();

  const [activityLogs, setActivityLogs] = useState<ActivityEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", calories: 0, duration: 0 });
  const [error, setError] = useState("");

  const defaultForm = { name: "", calories: 0, duration: 0 };
  const today = new Date().toISOString().split("T")[0];

  const quickActivity = [
    { name: "run", rate: 10 },
    { name: "bike", rate: 8 },
    { name: "run/walk", rate: 6 },
    { name: "lift weights", rate: 7 },
    { name: "workout", rate: 5 },
  ];

  const loadActivities = () => {
    const arr: ActivityEntry[] = Array.isArray(allActivityLogs)
      ? allActivityLogs
      : (Object.values(allActivityLogs || {}) as ActivityEntry[]);
    const todaysActivities = arr.filter((a) => a.createdAt?.split("T")[0] === today);
    setActivityLogs(todaysActivities);
  };

  useEffect(() => {
    loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allActivityLogs]);

  const handleQuickAdd = (activity: { name: string; calories: number; rate: number }) => {
    setFormData({
      name: activity.name,
      calories: 30 * activity.rate,
      duration: 30,
    });
    setShowForm(true);
  };

  const handleDurationChange = (value: string) => {
    const duration = Number(value) || 0;
    let calories = formData.calories;
    const activity = quickActivity.find((a) => a.name === formData.name);
    if (activity) calories = activity.rate * duration;
    setFormData({ ...formData, duration, calories });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setError("Please enter an activity name.");
      return;
    }
    if (formData.duration <= 0) {
      setError("Duration must be greater than 0.");
      return;
    }

    const entryId = Date.now();
    const newEntry: ActivityEntry = {
      id: entryId,
      name: formData.name,
      duration: formData.duration,
      calories: formData.calories,
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      documentId: String(entryId),
    };

    setActivityLogs((prev) => [newEntry, ...prev]);
    if (typeof setAllActivityLogs === "function") {
      setAllActivityLogs((prev: any) => {
        if (Array.isArray(prev)) return [newEntry, ...prev];
        return [newEntry, ...(Array.isArray(prev) ? prev : [])];
      });
    }

    setShowForm(false);
    setFormData(defaultForm);
    setError("");
  };

  const deleteActivity = (createdAtOrId: string | number) => {
    setActivityLogs((prev) => prev.filter((a) => a.createdAt !== String(createdAtOrId) && a.id !== createdAtOrId));
    if (typeof setAllActivityLogs === "function") {
      setAllActivityLogs((prev: any) => {
        if (!Array.isArray(prev)) return prev;
        return prev.filter((p: any) => p.createdAt !== String(createdAtOrId) && p.id !== createdAtOrId);
      });
    }
  };

  const totalMinutes: number = activityLogs.reduce((s, e) => s + (e.duration || 0), 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Activity Log</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track your daily activity</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500 dark:text-slate-400">Active total</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalMinutes} min</p>
          </div>
        </div>
      </div>

      <div className="mt-6" />

      {/* Use a 12-column grid so left/right widths are predictable */}
      <div className="page-content-grid grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* left column (8/12 on lg) */}
        <div className="lg:col-span-8 space-y-4">
          {!showForm && (
            <div className="space-y-4">
              <Card>
                <h3 className="font-semibold text-slate-700 dark:text-white mb-3"> Quick add</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { emoji: "🏃", name: "run" },
                    { emoji: "🚴", name: "bike" },
                    { emoji: "🏃‍♂️", name: "run/walk" },
                    { emoji: "🏋️‍♂️", name: "lift weights" },
                    { emoji: "💪", name: "workout" },
                  ].map((act) => (
                    <button
                      key={act.name}
                      onClick={() => {
                        const q = quickActivity.find((x) => x.name === act.name);
                        handleQuickAdd({ name: act.name, calories: 0, rate: q ? q.rate : 5 });
                      }}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      {act.emoji} {act.name}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Wrapper controls the button sizing: full on mobile, compact on lg */}
              <div className="flex items-center">
                <button
                  className="w-full lg:w-48 px-4 py-2 rounded-xl bg-blue-600 text-white flex items-center justify-center gap-2"
                  onClick={() => setShowForm(true)}
                >
                  <PlusIcon className="h-5 w-5" /> <span className="hidden lg:inline">Add Activity</span>
                  {/* show text on mobile too if you want; using hidden on lg keeps button compact while still labeled */}
                </button>
              </div>
            </div>
          )}

          {showForm && (
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4">New Activity Entry</h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <input
                  placeholder="e.g., Morning Run"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
                <div className="flex gap-4">
                  <input
                    placeholder="e.g., 30"
                    min={1}
                    max={1440}
                    required
                    value={formData.duration}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    className="w-1/2 px-3 py-2 border rounded"
                  />
                  <input
                    placeholder="e.g., 200"
                    min={1}
                    max={20000}
                    required
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                    className="w-1/2 px-3 py-2 border rounded"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setError("");
                      setFormData(defaultForm);
                    }}
                    className="px-6 py-3 rounded-xl bg-slate-700 text-white w-1/2"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-3 rounded-xl bg-emerald-500 text-white w-1/2">
                    Add Entry
                  </button>
                </div>
              </form>
            </Card>
          )}

          {/* existing list view */}
          <div className="space-y-4">
            {activityLogs.length === 0 && <p className="text-slate-500 dark:text-slate-400 text-sm">No activity logs yet.</p>}
            {activityLogs.map((a, idx) => (
              <div key={a.id ?? a.createdAt ?? idx} className="flex justify-between items-center bg-slate-800 p-3 rounded-md">
                <div className="flex items-center gap-3">
                  <ClockIcon className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="text-slate-200 font-medium">{a.name}</div>
                    <div className="text-slate-400 text-xs">{new Date(a.createdAt || "").toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FireIcon className="h-4 w-4" />
                    <span className="text-slate-400 text-sm">{a.calories} kcal</span>
                  </div>
                  <span className="text-slate-400 text-sm">{a.duration} min</span>
                  <button onClick={() => deleteActivity(a.createdAt ?? a.id)} className="p-2 rounded hover:bg-slate-700">
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* right column (4/12 on lg) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ActivityIcon className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-slate-800 dark:text-white font-semibold">Today's Activities</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{activityLogs.length} logged</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 dark:text-slate-400">Active Today</div>
                <div className="font-bold text-blue-600 dark:text-blue-400">{totalMinutes} min</div>
              </div>
            </div>

            <div className="space-y-3">
              {activityLogs.map((a, idx) => (
                <div key={`right-${a.id ?? a.createdAt ?? idx}`} className="flex items-center justify-between bg-slate-900/40 p-3 rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-800 rounded-full p-2">
                      <ClockIcon className="h-4 w-4 text-blue-300" />
                    </div>
                    <div>
                      <div className="text-slate-200 font-medium">{a.name}</div>
                      <div className="text-xs text-slate-400">{new Date(a.createdAt || "").toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-slate-200 font-semibold">{a.duration} min</div>
                      <div className="text-xs text-slate-400">{a.calories} kcal</div>
                    </div>
                    <button onClick={() => deleteActivity(a.createdAt ?? a.id)} className="p-2 rounded hover:bg-slate-700">
                      <Trash2Icon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ActivityIcon className="h-5 w-5 text-blue-400" />
                  <div className="text-sm text-slate-400">Total Active Time</div>
                </div>
                <div className="text-blue-600 dark:text-blue-400 font-bold">{totalMinutes} minutes</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;