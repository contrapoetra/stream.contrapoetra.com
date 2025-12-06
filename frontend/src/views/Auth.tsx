import { useState, useContext, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DarkModeContext } from '../context/DarkModeContext';
import { useAuth } from '../context/AuthContext';

interface FormData {
  email: string;
  password: string;
  username: string;
  confirmPassword: string;
}

function Auth() {
  const { darkMode } = useContext(DarkModeContext);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login
        const success = await login(formData.email, formData.password);

        if (success) {
          navigate('/');
        } else {
          setError('Invalid email or password');
        }
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords don't match!");
          setLoading(false);
          return;
        }

        const success = await register(formData.username, formData.email, formData.password);

        if (success) {
          navigate('/');
        } else {
          setError('Registration failed. Email might already be in use.');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (): void => {
    setIsLogin(!isLogin);
    setError('');
    // Reset form when switching between login/signup
    setFormData({
      email: '',
      password: '',
      username: '',
      confirmPassword: ''
    });
  };

  return (
    <div className={`min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 ${darkMode ? 'bg-neutral-900' : 'bg-neutral-100'}`}>
      <div className={`w-full max-w-md ${darkMode ? 'bg-neutral-800' : 'bg-white'} rounded-2xl shadow-xl p-8`}>
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className={`mt-2 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            {isLogin ? 'Sign in to your account to continue' : 'Sign up to get started with Streamin'}
          </p>
        </div>

        {error && (
          <div className={`p-3 rounded-lg text-sm ${darkMode ? 'bg-red-900/50 text-red-300 border border-red-800' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label htmlFor="username" className={`block text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'} mb-2`}>
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required={!isLogin}
                className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-500'} focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent`}
                placeholder="Enter your username"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'} mb-2`}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-500'} focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent`}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'} mb-2`}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-500'} focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent`}
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className={`block text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'} mb-2`}>
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required={!isLogin}
                className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-500'} focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent`}
                placeholder="Confirm your password"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            {isLogin && (
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className={`h-4 w-4 rounded ${darkMode ? 'bg-neutral-700 border-neutral-600' : 'border-neutral-300'} text-neutral-600 focus:ring-neutral-500`}
                />
                <label htmlFor="remember-me" className={`ml-2 block text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Remember me
                </label>
              </div>
            )}

            {isLogin && (
              <div className="text-sm">
                <a href="#" className={`font-medium ${darkMode ? 'text-neutral-400 hover:text-neutral-300' : 'text-neutral-600 hover:text-neutral-500'}`}>
                  Forgot your password?
                </a>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition duration-300 ${loading
              ? (darkMode ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed' : 'bg-neutral-400 text-neutral-200 cursor-not-allowed')
              : (darkMode ? 'bg-neutral-600 hover:bg-neutral-700 text-white' : 'bg-neutral-600 hover:bg-neutral-700 text-white')
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                {isLogin ? 'Signing In...' : 'Signing Up...'}
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Sign Up'
            )}
          </button>
        </form>

        <div className="mt-6">
          <button
            type="button"
            onClick={toggleMode}
            className={`w-full py-2 px-4 rounded-lg font-medium ${darkMode ? 'bg-neutral-700 hover:bg-neutral-600 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'} transition duration-300`}
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${darkMode ? 'border-neutral-700' : 'border-neutral-300'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${darkMode ? 'bg-neutral-800 text-neutral-400' : 'bg-white text-neutral-500'}`}>
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className={`w-full inline-flex justify-center py-3 px-4 rounded-lg border ${darkMode ? 'bg-neutral-700 border-neutral-600 hover:bg-neutral-600 text-white' : 'bg-white border-neutral-300 hover:bg-neutral-50 text-neutral-700'} transition duration-300`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
              </svg>
              <span className="ml-2">Twitter</span>
            </button>

            <button
              type="button"
              className={`w-full inline-flex justify-center py-3 px-4 rounded-lg border ${darkMode ? 'bg-neutral-700 border-neutral-600 hover:bg-neutral-600 text-white' : 'bg-white border-neutral-300 hover:bg-neutral-50 text-neutral-700'} transition duration-300`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-2">GitHub</span>
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            By continuing, you agree to our{' '}
            <a href="#" className={`font-medium ${darkMode ? 'text-neutral-400 hover:text-neutral-300' : 'text-neutral-600 hover:text-neutral-500'}`}>
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className={`font-medium ${darkMode ? 'text-neutral-400 hover:text-neutral-300' : 'text-neutral-600 hover:text-neutral-500'}`}>
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
