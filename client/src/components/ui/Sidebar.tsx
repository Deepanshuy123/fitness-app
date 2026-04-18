import { Activity, Home, Sun, Moon, PersonStanding, User, Utensils } from "lucide-react"
import { NavLink } from "react-router-dom"
import { useTheme } from "../../Context/ThemeContext"


const Sidebar = () => {
      const navItems = [
            { path: '/', label: 'Home', icon: Home },
            { path: '/food', label: 'Food', icon: Utensils },
            { path: '/activity', label: 'Activity', icon: Activity },
            { path: '/profile', label: 'Profile', icon: User },
      ];
      const { theme, toggleTheme } = useTheme();
  return (
      <nav className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-6 transition-colors duration-200">
            <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <PersonStanding className='w-7 h-7 text-white'/>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-white">FitTrack</h1>
            </div>
            <ul className="flex-1 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 p-2 rounded-lg transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-slate-800 ` +
                        (isActive
                          ? "text-emerald-500"
                          : "text-slate-700 dark:text-slate-200")
                      }
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
            {/* theme toggle */}
            <div className="mt-4">
              <button
                onClick={() => {
                  console.log('Button clicked, current theme:', theme);
                  toggleTheme();
                  setTimeout(() => {
                    console.log('HTML class:', document.documentElement.className);
                  }, 100);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-700" />
                )}
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>
            </div>
      </nav>
  )
}

export default Sidebar