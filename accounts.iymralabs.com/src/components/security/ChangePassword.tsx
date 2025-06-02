import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { useForm } from 'react-hook-form';
import { Lock, ShieldCheck } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';

type Step = 'verifyCurrent' | 'enterCode';

interface VerifyForm {
  currentPassword: string;
}

interface CodeForm {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePassword: React.FC = () => {
  const [step, setStep] = useState<Step>('verifyCurrent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* --- STEP 1 : verify current password --------------------------- */
  const {
    register: verifyRegister,
    handleSubmit: handleVerifySubmit,
    formState: { errors: verifyErrors },
  } = useForm<VerifyForm>();

  const requestCode = async (data: VerifyForm) => {
    try {
      setLoading(true);
      setError(null);
      await axios.post(`${API_URL}/api/password/change/request`, data);
      setStep('enterCode');
      setSuccess('Verification code sent to your email');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  /* --- STEP 2 : submit code + new password ------------------------ */
  const {
    register: codeRegister,
    handleSubmit: handleCodeSubmit,
    watch,
    formState: { errors: codeErrors },
  } = useForm<CodeForm>();

  const confirmChange = async (data: CodeForm) => {
    try {
      setLoading(true);
      setError(null);
      await axios.post(`${API_URL}/api/password/change/confirm`, {
        code: data.code,
        newPassword: data.newPassword,
      });
      setSuccess('Password changed successfully!');
      setStep('verifyCurrent');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  /* --- RENDER ----------------------------------------------------- */
  return (
    <div>
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {step === 'verifyCurrent' && (
        <form onSubmit={handleVerifySubmit(requestCode)} className="space-y-6">
          <Input
            label="Current Password"
            type="password"
            leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
            error={verifyErrors.currentPassword?.message}
            {...verifyRegister('currentPassword', { required: 'Current password required' })}
          />

          <div className="flex justify-end">
            <Button type="submit" variant="primary" isLoading={loading}>
              Send Verification Code
            </Button>
          </div>
        </form>
      )}

      {step === 'enterCode' && (
        <form onSubmit={handleCodeSubmit(confirmChange)} className="space-y-6">
          <Input
            label="6-digit Code"
            leftIcon={<ShieldCheck className="w-5 h-5 text-gray-400" />}
            error={codeErrors.code?.message}
            {...codeRegister('code', {
              required: 'Verification code required',
              minLength: { value: 6, message: '6-digit code' },
              maxLength: { value: 6, message: '6-digit code' },
            })}
          />

          <Input
            label="New Password"
            type="password"
            leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
            helperText="Must be 8+ chars with letters, numbers & symbols"
            error={codeErrors.newPassword?.message}
            {...codeRegister('newPassword', {
              required: 'New password required',
              pattern: {
                value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/,
                message: 'Password not strong enough',
              },
            })}
          />

          <Input
            label="Confirm New Password"
            type="password"
            leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
            error={codeErrors.confirmPassword?.message}
            {...codeRegister('confirmPassword', {
              validate: (v) => v === watch('newPassword') || 'Passwords do not match',
            })}
          />

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('verifyCurrent')}
              disabled={loading}
            >
              Go back
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              Change Password
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ChangePassword;
