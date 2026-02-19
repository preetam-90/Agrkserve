// Auth Components - Shared primitives for authentication pages
// Eliminates boilerplate duplication across login, reset-password, forgot-password, onboarding, and phone-setup pages

export { AuthLayout } from './AuthLayout';
export { AuthBackground } from './AuthBackground';
export { AuthForm, AuthFormHeader, AuthError, AuthSubmitButton, AuthDivider } from './AuthForm';
export { AuthField, AuthFieldError, AuthPasswordRequirements } from './AuthField';
export { AuthSuccessState, AuthSuccessIcon } from './AuthSuccessState';
export { useAuthForm, usePasswordValidation, useEmailValidation } from './useAuthForm';
