'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { RoleString } from '@/lib/api/auth';

const roleOptions = [
  { value: 'end_user', label: 'End User' },
  { value: 'agent', label: 'Agent' },
  { value: 'admin', label: 'Administrator' },
];

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  department?: string;
  role?: string;
  general?: string;
}
export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    role: 'end_user' as RoleString,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        'Password must contain at least one lowercase letter, one uppercase letter, and one number';
    }

    // Department validation (optional)
    if (formData.department && formData.department.length > 50) {
      newErrors.department = 'Department cannot exceed 50 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Client-side validation
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);

      return;
    }

    try {
      setIsLoading(true);
      const result = await register(formData);

      if (result.success) {
        // Redirect to dashboard on successful registration
        // Use window.location.href for full page reload to ensure auth state is initialized
        sessionStorage.removeItem('register_email');
        router.push('/auth/login');
      } else {
        setErrors({
          general: result.error || 'Registration failed. Please try again.',
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        general: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('register_email');

    if (!savedEmail) {
      router.push('/onboarding');

      return;
    }
    setFormData((prev) => ({ ...prev, email: savedEmail }));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">HelpEdge</CardTitle>
          <p className="text-gray-600">Create your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {errors.general}
              </div>
            )}
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              error={errors.name}
            />
            {/* <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              error={errors.email}
              autoComplete="off"
            /> */}

            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <div className="flex items-center justify-between px-4 py-2 border border-blue-300 bg-blue-50 rounded-md">
                <div className="flex items-center gap-2">
                  <span className="text-blue-500 text-sm">✉</span>
                  <span className="text-sm text-gray-700 font-medium">{formData.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.removeItem('register_email');
                    router.push('/GetStarted');
                  }}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Change
                </button>
              </div>
              {/* Hidden so email is still included in formData submit */}
              <input type="hidden" name="email" value={formData.email} />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              error={errors.password}
              autoComplete="new-password"
            />
            <Input
              label="Department (Optional)"
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              error={errors.department}
            />
            <div className="space-y-1">
              <label className="text-sm font-medium">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/auth/login" className="text-blue-600 hover:underline">
                Sign in
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
