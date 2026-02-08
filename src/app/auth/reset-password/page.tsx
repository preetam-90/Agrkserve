import { Metadata } from 'next';
import ResetPasswordClient from './ResetPasswordClient';

export const metadata: Metadata = {
  title: 'Set New Password - AgriServe',
  description: 'Create a new password for your account.',
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
