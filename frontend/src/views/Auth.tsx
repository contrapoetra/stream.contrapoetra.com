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
