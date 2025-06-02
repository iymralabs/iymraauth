import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Eye, EyeOff, Calendar, Phone, Map } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
}

const RegisterPage: React.FC = () => {
  const { register: registerUser, error, loading, clearError } = useAuth();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormValues>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showExtendedFields, setShowExtendedFields] = useState(false);
  
  const password = watch('password');
  
  const onSubmit = async (data: RegisterFormValues) => {
    // Remove confirmPassword before submitting
    const { confirmPassword, ...userData } = data;
    await registerUser(userData);
  };
  
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Join Iymra and access all services with a single account
          </p>
        </div>
        
        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={clearError} 
          />
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              autoComplete="given-name"
              fullWidth
              leftIcon={<User className="w-5 h-5 text-gray-400" />}
              error={errors.firstName?.message}
              {...register('firstName', { required: 'First name is required' })}
            />
            
            <Input
              label="Last Name"
              autoComplete="family-name"
              fullWidth
              leftIcon={<User className="w-5 h-5 text-gray-400" />}
              error={errors.lastName?.message}
              {...register('lastName', { required: 'Last name is required' })}
            />
          </div>
          
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
            autoComplete="new-password"
            fullWidth
            leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
            rightIcon={
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
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
            helperText="Must be at least 8 characters with letters, numbers and symbols"
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters'
              },
              pattern: {
                value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
                message: 'Password must include letters, numbers and symbols'
              }
            })}
          />
          
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            fullWidth
            leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
            rightIcon={
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            }
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', { 
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match'
            })}
          />
          
          <div className="flex justify-center pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowExtendedFields(!showExtendedFields)}
            >
              {showExtendedFields ? 'Hide Additional Info' : 'Add Additional Info'}
            </Button>
          </div>
          
          {showExtendedFields && (
            <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Date of Birth"
                  type="date"
                  fullWidth
                  leftIcon={<Calendar className="w-5 h-5 text-gray-400" />}
                  error={errors.dateOfBirth?.message}
                  {...register('dateOfBirth')}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gender
                  </label>
                  <select
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md shadow-sm border border-gray-300 dark:border-gray-600 py-2 px-3 w-full focus:border-indigo-500 focus:ring-indigo-500"
                    {...register('gender')}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>
              
              <Input
                label="Phone Number"
                type="tel"
                fullWidth
                leftIcon={<Phone className="w-5 h-5 text-gray-400" />}
                error={errors.phoneNumber?.message}
                {...register('phoneNumber')}
              />
              
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address (Optional)
                </label>
                
                <Input
                  label="Address Line 1"
                  fullWidth
                  leftIcon={<Map className="w-5 h-5 text-gray-400" />}
                  {...register('address.line1')}
                />
                
                <Input
                  label="Address Line 2"
                  fullWidth
                  {...register('address.line2')}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="City"
                    fullWidth
                    {...register('address.city')}
                  />
                  
                  <Input
                    label="State/Province"
                    fullWidth
                    {...register('address.state')}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Postal/ZIP Code"
                    fullWidth
                    {...register('address.zip')}
                  />
                  
                  <Input
                    label="Country"
                    fullWidth
                    {...register('address.country')}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              I agree to the{' '}
              <Link to="/terms" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                Privacy Policy
              </Link>
            </label>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={loading}
          >
            Create Account
          </Button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;