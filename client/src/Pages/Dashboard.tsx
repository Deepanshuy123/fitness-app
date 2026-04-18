import { useEffect, useState } from "react"
import { getMotivationalMessage } from "../assets/assets"
import { useAppContext } from "../Context/AppContext"
import type { FoodEntry, ActivityEntry } from "../Types"
import Card from "../components/ui/Card"
import ProgressBar from "../components/ui/ProgressBar"
import { Menu, Flame, Activity, Zap, TrendingUp, Scale, Ruler, Dumbbell } from "lucide-react";
import CaloriesChart from "../components/CaloriesChart"


const Dashboard = () => {
  const { user, allActivityLogs, allFoodLogs } = useAppContext()
  if (!user) return null;
  
  const [todayFood, setTodayFood] = useState<FoodEntry[]>([]);
  const [todayActivity, setTodayActivity] = useState<ActivityEntry[]>([]);
  const DAILY_CALORIE_LIMIT: number = user?.dailyCalorieIntake || 2000;

 const loadUserData = () => {
  try {
    const today = new Date();

      // --- FIX: handle both array and object-map shapes for allFoodLogs ---
      const foodArray: FoodEntry[] = Array.isArray(allFoodLogs)
        ? allFoodLogs
        : Object.values(allFoodLogs || {});

      const activityArray: ActivityEntry[] = Array.isArray(allActivityLogs)
        ? allActivityLogs
        : Object.values(allActivityLogs || {});

      // Robust parse: accept ISO string or numeric timestamp
      const parseCreatedAt = (val: any): Date | null => {
        if (val == null) return null;
        const d = new Date(val);
        if (!isNaN(d.getTime())) return d;
        const n = Number(val);
        if (!isNaN(n)) return new Date(n);
        return null;
      };

      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const foodData = foodArray.filter((f: FoodEntry) => {
        if (!f?.createdAt) return false;
        const created = parseCreatedAt(f.createdAt);
        if (!created) return false;
        return created >= startOfDay && created <= endOfDay;
      });

      const activityData = activityArray.filter((a: ActivityEntry) => {
        if (!a?.createdAt) return false;
        const created = parseCreatedAt(a.createdAt);
        if (!created) return false;
        return created >= startOfDay && created <= endOfDay;
      });

      setTodayFood(foodData);
      setTodayActivity(activityData);
    } catch (err) {
      console.error("Error loading user data", err);
    }
  }

  useEffect(() => {
    loadUserData();
  }, [allActivityLogs, allFoodLogs]);

  const totalCalories: number = todayFood.reduce((sum, item) => sum + (item.calories || 0), 0)
  const remainingCalories: number = DAILY_CALORIE_LIMIT - totalCalories;
  const totalActiveMinutes: number = todayActivity.reduce((sum, item) =>
    sum + (item.duration || 0), 0)
  const totalBurned: number = todayActivity.reduce((sum, item) => sum + (item.calories || 0), 0)

  const caloriesPercent = DAILY_CALORIE_LIMIT ? Math.round((totalCalories / DAILY_CALORIE_LIMIT) * 100) : 0;

  const motivation = getMotivationalMessage(totalCalories, totalActiveMinutes, DAILY_CALORIE_LIMIT)

  const bmi = user && user.weight && user.height
    ? user.weight / ((user.height / 100) ** 2)
    : 0;
  let bmiColor = "bg-green-500";
  if (bmi < 18.5) bmiColor = "bg-blue-500";
  else if (bmi >= 25 && bmi < 30) bmiColor = "bg-yellow-500";
  else if (bmi >= 30) bmiColor = "bg-red-500";

  return (
    <div className="page-container">
      {/* Header */}
      <div className="dashboard-header">
        <p className="text-emerald-100 text-sm font-medium">Welcome back</p>
        <h1 className="text-2xl font-bold mt-1">{`Hi there ! 👋 ${user?.username}`}</h1>
        <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{motivation.emoji}</span>
            <p className="text-white font-medium">{motivation.text}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid grid grid-cols-2 gap-6">

        {/* full-width calories card */}
        <Card className="shadow-lg col-span-2 space-y-6 min-w-0">
          {/* Calories consumed block */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Menu className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Calories Consumed
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {totalCalories}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 dark:text-slate-400">Limit</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {DAILY_CALORIE_LIMIT}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <ProgressBar value={totalCalories} max={DAILY_CALORIE_LIMIT} />
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{remainingCalories} kcal remaining</span>
                <span>{caloriesPercent}%</span>
              </div>
            </div>
          </div>
          {/* Calories burned block */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Calories Burned
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {totalBurned}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 dark:text-slate-400">Goal</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {user?.dailyCalorieBurn || 400}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <ProgressBar
                value={totalBurned}
                max={user?.dailyCalorieBurn || 400}
                color="bg-red-500"
              />
            </div>
          </div>
        </Card>

        {/* active minutes card */}
        <Card className="shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-teal-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Active minutes
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {totalActiveMinutes}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">today</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {todayActivity.length} activities
              </p>
            </div>
          </div>
        </Card>

        {/* workouts card */}
        <Card className="shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Workouts Logged
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {todayActivity.length}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">today</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {totalActiveMinutes} min
              </p>
            </div>
          </div>
        </Card>

        {/* goal card */}
        <Card className="shadow-lg space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Your Goal
              </p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {user.goal=== 'lose'&& '🔥 Lose Weight'}
                {user.goal===  'maintain'&& '⚖️ Maintain Weight'}
                {user.goal===  'gain'&& '💪 Gain Weight'}
              </p>
            </div>
          </div>
        </Card>

        {/* body metrics card */}
        <Card className="shadow-lg space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Scale className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Body Metrics
              </p>
              <p className="text-xs text-slate-400">Your stats</p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm items-center">
              <div className="flex items-center gap-1">
                <Dumbbell className="w-4 h-4 text-slate-500" />
                <span>Weight</span>
              </div>
              <span>{user?.weight} kg</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <div className="flex items-center gap-1">
                <Ruler className="w-4 h-4 text-slate-500" />
                <span>Height</span>
              </div>
              <span>{user?.height } cm</span>
            </div>
            {user?.weight && user?.height && (
              <>
                <div className="mt-2">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    BMI
                  </p>
                  <ProgressBar
                    value={bmi}
                    max={40}
                    color={bmiColor}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>18.5</span>
                  <span>{bmi.toFixed(1)}</span>
                  <span>40</span>
                </div>
              </>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Today's summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Meals logged</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{todayFood.length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Total Calories</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{totalCalories} Kcal</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500 dark:text-slate-400">Active time</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{totalActiveMinutes} min</span>
            </div>
          </div>
        </Card>

        {/* FIX: min-w-0 on outer Card + wrapper div with explicit height fixes the Recharts warning */}
        <Card className="col-span-2 min-w-0">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-2">This week progress</h3>
          {/* The wrapper MUST have a defined height and min-w-0 so Recharts can measure it */}
          <div style={{ width: "100%", minWidth: 0, height: 250 }}>
            <CaloriesChart />
          </div>
        </Card>

      </div>
    </div>
  )
}

export default Dashboard