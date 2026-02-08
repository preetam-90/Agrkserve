import { Metadata } from 'next';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: 'Login - AgriServe',
  description: 'Access your AgriServe account.',
};

export default function LoginPage() {
  return <LoginClient />;
}
