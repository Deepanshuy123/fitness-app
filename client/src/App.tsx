import { Routes, Route } from "react-router-dom"
import Layout from "./Pages/Layout"
import Dashboard from "./Pages/Dashboard"
import FoodLog from "./Pages/FoodLog"
import ActivityLog from "./Pages/ActivityLog"
import Profile from "./Pages/Profile"
import Onboarding from "./Pages/Onboarding"
import { useAppContext } from "./Context/AppContext"
import Login from "./Pages/Login"
import Loading from "./components/Loading"
import ErrorBoundary from "./components/ui/ErrorBoundary"
import { Toaster } from "react-hot-toast"


const App = () => {
  const{user,isUserFetched,onboardingCompleted}=useAppContext()

if (!user) {
  return isUserFetched ? <Login /> : <Loading />
}
if(!onboardingCompleted){
  return <Onboarding />
}

 return (
  <>
   <Toaster />  
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
      <Route path="food" element={<FoodLog />} />
      <Route path="activity" element={<ActivityLog />} />
      <Route path="profile" element={<Profile />} />
    </Route>
  </Routes>
  </>
 )
}

export default App