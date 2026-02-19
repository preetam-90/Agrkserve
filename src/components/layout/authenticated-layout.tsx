'use client';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="flex min-h-screen w-full max-w-full overflow-x-hidden">
      <div className="w-full max-w-full flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
