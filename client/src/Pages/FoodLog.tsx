// src/Pages/FoodLog.tsx
import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../Context/AppContext";
import type { FoodEntry } from "../Types";
import api from "../configs/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

type FormDataType = {
  name: string;
  calories: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "";
};

const defaultForm: FormDataType = { name: "", calories: 0, mealType: "" };

const FoodLog = () => {
  const { allFoodLogs, setAllFoodLogs } = useAppContext();

  // local UI state
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormDataType>(defaultForm);
  const [drawerMeal, setDrawerMeal] = useState<FormDataType["mealType"]>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // keep local entries synced with context (today's entries)
  useEffect(() => {
    const arr: FoodEntry[] = Array.isArray(allFoodLogs)
      ? allFoodLogs
      : (Object.values(allFoodLogs || {}) as FoodEntry[]);
    const today = new Date().toLocaleDateString("en-CA");
    const todays = arr.filter((f) => f?.createdAt && new Date(f.createdAt).toLocaleDateString("en-CA") === today);
    setEntries(todays);
  }, [allFoodLogs]);

  const totalCalories = entries.reduce((s, e) => s + (e.calories || 0), 0);

  // Add a new entry and update context
  const handleAddEntry = () => {
    if (!formData.name || !formData.mealType) return alert("Please enter name and select meal type");
    const newEntry: FoodEntry = {
      id: `local_${Date.now()}`,
      name: formData.name,
      calories: Number(formData.calories) || 0,
      mealType: formData.mealType,
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    };

    // Update context (preserve shape as array)
    const current = Array.isArray(allFoodLogs) ? allFoodLogs : [];
    const updated = [newEntry, ...current];
    setAllFoodLogs?.(updated);
    // reset form & close
    setFormData(defaultForm);
    setShowForm(false);
  };

  // Delete entry (from context)
  const handleDelete = (id: string | number) => {
    const current = Array.isArray(allFoodLogs) ? allFoodLogs : [];
    const updated = current.filter((it) => it.id !== id);
    setAllFoodLogs?.(updated);
    setEntries((prev) => prev.filter((p) => p.id !== id));
  };

  // open drawer for a meal type and show its entries
  const openMealHistory = (meal: FormDataType["mealType"]) => {
    setDrawerMeal(meal);
    // ensure the drawer has current entries (already from effect)
  };

  // quick add handler (if you want buttons to add by name quickly)
  const handleQuickAdd = (mealType: FormDataType["mealType"]) => {
    setFormData((f) => ({ ...f, mealType }));
    setShowForm(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAiError(null);
    setAiLoading(true);
    const formBody = new FormData();
    formBody.append("image", file);

    try {
      const { data } = await api.post("/api/image-analysis", formBody);

      if (!data?.success || !data?.foodName || typeof data?.calories !== "number") {
        throw new Error("Invalid response from AI image analysis");
      }

      setFormData({
        name: data.foodName,
        calories: data.calories,
        mealType: "",
      });
      setShowForm(true);
      toast.success("AI food analysis succeeded. Review and save the entry.");
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "AI food upload failed";
      setAiError(message);
      toast.error(message);
    } finally {
      setAiLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  // group entries by meal type for right column summary
  const groupByMeal = (arr: FoodEntry[]) => {
    const map: Record<string, FoodEntry[]> = { breakfast: [], lunch: [], dinner: [], snack: [] };
    arr.forEach((e) => {
      const mt = (e.mealType || "snack") as keyof typeof map;
      map[mt] = map[mt] || [];
      map[mt].push(e);
    });
    return map;
  };

  const grouped = groupByMeal(entries);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Food Log</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track your daily intake</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500 dark:text-slate-400">Today's total</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{totalCalories} kcal</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">
        {/* left column: quick add + buttons + form */}
        <div>
          <Card className="mb-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Quick add</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { emoji: "🍳", name: "breakfast" },
                  { emoji: "🍱", name: "lunch" },
                  { emoji: "🌙", name: "dinner" },
                  { emoji: "🍪", name: "snack" },
                ].map((act) => (
                  <button
                    key={act.name}
                    onClick={() => handleQuickAdd(act.name as FormDataType["mealType"])}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    {act.emoji} {act.name}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <Button className="w-full" onClick={() => setShowForm(true)}>
              <Plus className="mr-2" /> Add Food Entry
            </Button>
            <Button className="w-full" onClick={() => inputRef.current?.click()} disabled={aiLoading}>
              <Sparkles className="mr-2" /> {aiLoading ? "Analyzing photo..." : "AI Food Snap"}
            </Button>
            <input onChange={handleImageChange} type="file" accept="image/*" hidden ref={inputRef} />
          </div>
          {aiError && <div className="text-red-400 text-sm mt-2">{aiError}</div>}

          {/* New Food Entry form (keeps structure/style you used earlier) */}
          {showForm && (
            <Card className="mt-6">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4">New Food Entry</h3>

              <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Food Name *</label>
              <input
                className="w-full p-3 rounded-lg bg-slate-800 text-white mb-4"
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Rice"
              />

              <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Calories *</label>
              <input
                type="number"
                className="w-full p-3 rounded-lg bg-slate-800 text-white mb-4"
                value={formData.calories}
                onChange={(e) => setFormData((f) => ({ ...f, calories: Number(e.target.value) }))}
                placeholder="e.g. 250"
              />

              <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Meal Type *</label>
              <select
                className="w-full p-3 rounded-lg bg-slate-800 text-white mb-4"
                value={formData.mealType}
                onChange={(e) => setFormData((f) => ({ ...f, mealType: e.target.value as FormDataType["mealType"] }))}
              >
                <option value="">Select meal</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>

              <div className="flex gap-3 mt-4">
                <button onClick={() => { setShowForm(false); setFormData(defaultForm); }} className="px-6 py-3 rounded-xl bg-slate-700 text-white w-1/2">
                  Cancel
                </button>
                <button onClick={handleAddEntry} className="px-6 py-3 rounded-xl bg-emerald-500 text-white w-1/2">
                  Add Entry
                </button>
              </div>
            </Card>
          )}
        </div>

        {/* right column: grouped meal cards */}
        <div className="space-y-4">
          {(["breakfast", "lunch", "dinner", "snack"] as const).map((meal) => (
            <Card key={meal} className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-200 capitalize">{meal}</h4>
                <p className="text-sm text-slate-400">{grouped[meal].length} items</p>
                <div className="mt-2 space-y-2">
                  {grouped[meal].slice(0, 3).map((it) => (
                    <div key={it.id} className="flex justify-between items-center bg-slate-800 p-3 rounded-md">
                      <span className="text-slate-200">{it.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{it.calories} kcal</span>
                        <button onClick={() => handleDelete(it.id)} className="p-1 rounded hover:bg-slate-700">
                          <Trash2 className="w-4 h-4 text-rose-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{grouped[meal].reduce((s, e) => s + (e.calories || 0), 0)} kcal</p>
                <button onClick={() => openMealHistory(meal)} className="mt-2 text-sm text-emerald-400">View</button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* RIGHT DRAWER: Meal history + delete (slides in when drawerMeal is set) */}
      <div
        aria-hidden={!drawerMeal}
        className={`fixed right-0 top-0 h-full w-96 bg-slate-900/95 p-6 transition-transform ${drawerMeal ? "translate-x-0" : "translate-x-full"}`}
        style={{ boxShadow: "-12px 0 24px rgba(2,6,23,0.6)" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white capitalize">{drawerMeal} history</h3>
          <button onClick={() => setDrawerMeal("")} className="text-slate-300">Close</button>
        </div>

        <div className="mt-6 space-y-4">
          {(entries.filter((e) => e.mealType === drawerMeal)).length === 0 && (
            <p className="text-slate-400">No entries for {drawerMeal}</p>
          )}

          {entries.filter((e) => e.mealType === drawerMeal).map((e) => (
            <div key={e.id} className="flex justify-between items-center bg-slate-800 p-3 rounded">
              <div>
                <div className="text-slate-200 font-medium">{e.name}</div>
                <div className="text-slate-400 text-sm">{e.createdAt ? new Date(e.createdAt).toLocaleTimeString() : ""}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-slate-300">{e.calories} kcal</div>
                <button onClick={() => handleDelete(e.id)} className="text-rose-400 p-2 rounded hover:bg-slate-700">
                  <Trash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FoodLog;