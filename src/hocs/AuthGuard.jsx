'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import themeConfig from '@configs/themeConfig';
import { CircularProgress } from '@mui/material';

const AuthGuard = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return;
    //console.log('session', session);
    if (pathname.includes('/payment')) return;
    if (!session) {
      // Get the language from the URL or default to 'en'
      const lang = pathname.split('/')[1] || 'en';
      const loginUrl = `/${lang}/login?callbackUrl=${pathname}`;
      router.push(loginUrl);
    }
    // else {
    //   const userRole = session?.user?.roleNames;
    //   console.log('userRole', userRole);

    //   // Check if the current path is products or checkout related
    //   const isProductPath = pathname.includes('/products');
    //   const isCheckoutPath = pathname.includes('/checkout');

    //   // If user is on root path, redirect to appropriate dashboard
    //   if (pathname === '/' || pathname === '/en' || pathname === '/fr') {
    //     const lang = pathname === '/' ? 'en' : pathname.split('/')[1];

    //     let dashboardUrl;
    //     if (userRole.includes('Admin') || userRole.includes('Team Member')) {
    //       dashboardUrl = `/${lang}/admin/dashboards/crm`;
    //     } else if (userRole.includes('Trade Professional')) {
    //       dashboardUrl = `/${lang}/trade-professional/dashboard`;
    //     } else {
    //       dashboardUrl = `/${lang}/unauthorized`;
    //     }

    //     router.push(dashboardUrl);
    //   }
    //   // Check role-based access for protected routes
    //   else if (!isProductPath && !isCheckoutPath) {
    //       if (pathname.includes('/admin') && !userRole.includes('Admin') && !userRole.includes('Team Member')) {
    //       router.push('/en/unauthorized');
    //     }
    //     if (pathname.includes('/trade-professional') && !userRole.includes('Trade Professional')) {
    //        router.push('/en/unauthorized');
    //     }
    //   }
    // }
  }, [session, status, pathname, router]);

  if (status === 'loading') {
    return <CircularProgress />;
  }

  return session ? children : null;
};

export default AuthGuard;
