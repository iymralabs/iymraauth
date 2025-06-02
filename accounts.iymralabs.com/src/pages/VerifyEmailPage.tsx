import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';
import Button from '../components/ui/Button';

enum VerificationStatus {
  VERIFYING,
  SUCCESS,
  EXPIRED,
  INVALID
}

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>(VerificationStatus.VERIFYING);
  const [message, setMessage] = useState<string>('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus(VerificationStatus.INVALID);
        setMessage('Invalid verification link. No token provided.');
        return;
      }
      
      try {
        await axios.get(`${API_URL}/api/verify-email?token=${token}`);
        setStatus(VerificationStatus.SUCCESS);
        setMessage('Your email has been successfully verified! You can now log in to your account.');
      } catch (error: any) {
        if (error.response?.status === 410) {
          setStatus(VerificationStatus.EXPIRED);
          setMessage('This verification link has expired. Please request a new one.');
        } else {
          setStatus(VerificationStatus.INVALID);
          setMessage('Invalid or already used verification link. Please try logging in or contact support.');
        }
      }
    };
    
    verifyEmail();
  }, [searchParams]);
  
  const renderContent = () => {
    switch (status) {
      case VerificationStatus.VERIFYING:
        return (
          <div className="flex flex-col items-center">
            <Loader className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
            <h2 className="text-2xl font-bold mb-2">Verifying your email</h2>
            <p className="text-gray-600 dark:text-gray-300">Please wait while we verify your email address...</p>
          </div>
        );
        
      case VerificationStatus.SUCCESS:
        return (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">{message}</p>
            <Button
              variant="primary"
              onClick={() => navigate('/login')}
            >
              Log In
            </Button>
          </div>
        );
        
      case VerificationStatus.EXPIRED:
        return (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Link Expired</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">{message}</p>
            <Button
              variant="primary"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
          </div>
        );
        
      case VerificationStatus.INVALID:
        return (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Invalid Link</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">{message}</p>
            <Button
              variant="primary"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 text-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default VerifyEmailPage;