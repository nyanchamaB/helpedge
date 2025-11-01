// app/auth/register/page.tsx
import RegisterForm from '@/components/auth/RegisterForm';
import PublicRoute from '@/components/auth/PublicRoute';

export default function RegisterPage() {
  return (
    <PublicRoute>
      <RegisterForm />
    </PublicRoute>
  );
}