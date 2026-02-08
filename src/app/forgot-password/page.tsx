import { Metadata } from 'next';
import ForgotPasswordClient from './ForgotPasswordClient';

export const metadata: Metadata = {
  title: 'Reset Password - AgriServe',
  description: 'Reset your account password.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
