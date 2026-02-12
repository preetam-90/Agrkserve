export function shouldShowGlobalAppNavbar(pathname: string): boolean {
  if (pathname === '/') {
    return false;
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return false;
  }

  return true;
}
