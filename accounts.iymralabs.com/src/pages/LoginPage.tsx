import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';

interface LoginFormValues {
  email: string;
  password: string;
}

interface LocationState {
  message?: string;
}

const LoginPage: React.FC = () => {
  const { login, error, loading, clearError, user } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>();
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);
  
  // Check for message in location state (e.g., from registration)
  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.message) {
      setNotification(state.message);
      // Clean up the location state after reading the message
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);
  
  const onSubmit = async (data: LoginFormValues) => {
    await login(data.email, data.password);
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const dismissNotification = () => {
    setNotification(null);
  };
  
  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Access your Iymra account securely
          </p>
        </div>
        
        {notification && (
          <Alert 
            type="success" 
            message={notification} 
            onClose={dismissNotification} 
          />
        )}
        
        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={clearError} 
          />
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            autoComplete="email"
            fullWidth
            leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
            error={errors.email?.message}
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
          />
          
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            fullWidth
            leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
            rightIcon={
              <button 
                type="button" 
                onClick={togglePasswordVisibility}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            }
            error={errors.password?.message}
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters'
              }
            })}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                Forgot your password?
              </Link>
            </div>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={loading}
          >
            Sign in
          </Button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;