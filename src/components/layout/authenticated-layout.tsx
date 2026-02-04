'use client';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="flex min-h-screen w-full max-w-full overflow-x-hidden">
      <div className="flex-1 w-full max-w-full overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
