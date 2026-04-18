
import { AtSign, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";
import { Toaster } from "react-hot-toast";

const Login = () => {
const [state, setState] = useState("login");
const [username, setUsername] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);

const navigate = useNavigate();
const { login, signup, user } = useAppContext();
const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsSubmitting(true);
  try {
    if (state === "login") {
      await login({ email, password });
    } else {
      await signup({ username, email, password });
    }
  } catch (error) {
    // error is handled inside AppContext
  } finally {
    setIsSubmitting(false);
  }
};
useEffect(() => {
  if (user) {
    navigate("/");
  }
}, [user, navigate]);



  return (
    <>
     <Toaster />
      <main className="login-page-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="text-3xl font-medium text-gray-900 dark:text-white">
          {state==='login'?"Sign In":"Sign up"}

        </h2>
        <p className="mt-2 text-sm text-gray-500/900 dark:text-gray-400">
          {state==='login'?"Please enter your Email & Password to access":'Please enter your details to create your account'}
        </p>
      {/*Username*/}
      {state!== 'login'&&(
        <div className="mt-4">
          <label className="font-medium text-sm text-gray-700 dark:text-grey-300">Username</label>
        <div className="relative mt-2">
          <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
        <input onChange={(e)=>setUsername(e.target.
          value)} value={username}
         type="text" placeholder="enter Username"
        className="login-input" required/>
        </div>
        </div>
      )}
      {/*Email*/}
       <div className="mt-4">
          <label className="font-medium text-sm text-gray-700 dark:text-grey-300">Email</label>
        <div className="relative mt-2">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
        <input onChange={(e)=>setEmail(e.target.
         value)} value={email}
         type="email" placeholder="enter email"
        className="login-input" required/>
        </div>
        </div>
        {/*Password*/}
         <div className="mt-4">
          <label className="font-medium text-sm text-gray-700 dark:text-grey-300">Password</label>
        <div className="relative mt-2">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
        <input onChange={(e)=>setPassword(e.target.
         value)} value={password}
         placeholder="enter your password"
        className="login-input pr-10" required
        type={showPassword? 'text':'password'}/>
        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-400 hover:text-gray-600"
        onClick={() => setShowPassword((p) => !p)}>
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        </div>
        </div>
        <button type="submit" disabled={isSubmitting}
        className="login-button">
          {isSubmitting?"Singing in...":state==="login"? 'Login':'sign up'}
        
        </button>
        {state === 'login' ? (
          <p className="text-center py-6 text-gray-500 dark:text-grey-400">
            Don't have an account?
            <button
              type="button"
              onClick={() => setState('sign-up')}
              className="ml-1 cursor-pointer text-green-600 hover:underline"
            >
              Sign up
            </button>
          </p>
        ) : (
          <p className="text-center py-6 text-gray-500 dark:text-grey-400">
            Already have an account?
            <button
              type="button"
              onClick={() => setState('login')}
              className="ml-1 cursor-pointer text-green-600 hover:underline"
            >
              Login
            </button>
          </p>
        )}
      </form>
      </main>
    </>
  )
}

export default Login