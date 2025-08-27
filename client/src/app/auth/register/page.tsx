import AuthLayout from '@/components/auth/AuthLayout';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Join the adventure"
      subtitle="Create your account to discover personalized travel destinations"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
