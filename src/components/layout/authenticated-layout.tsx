'use client';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
