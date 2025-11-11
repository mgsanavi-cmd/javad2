import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/Input';
import Button from '../components/Button';
import { useLanguage } from '../hooks/useLanguage';

const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const validateIdentifier = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10,11}$/; // Simple check for 10 or 11 digits
    return emailRegex.test(value) || phoneRegex.test(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (identifier.trim() === '') {
      setError(t('login.error.empty'));
      return;
    }
    if (!validateIdentifier(identifier)) {
        setError(t('login.error.invalid'));
        return;
    }
    setError('');
    login(identifier);
    navigate(from, { replace: true });
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-70px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-200/80">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-emerald-500">
            {t('home.karma')}
          </h1>
          <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
            {t('login.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('login.subtitle')}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Input
                label={t('login.emailOrPhone')}
                id="identifier"
                name="identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError('');
                }}
                placeholder={t('login.placeholder')}
                aria-invalid={error ? "true" : "false"}
                aria-describedby="identifier-error"
                hasError={!!error}
              />
            </div>
            {error && <p id="identifier-error" className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <div>
            <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 focus:ring-amber-500">
              {t('login.login')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;