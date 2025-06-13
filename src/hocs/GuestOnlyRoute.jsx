'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { CircularProgress } from '@mui/material';

const GuestOnlyRoute = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return;
    if (session) {
      // Get the language from the URL or default to 'en'
      const lang = pathname.split('/')[1] || 'en';
      const userRole = session?.user?.roleNames;
      if (userRole.includes('Admin') || userRole.includes('Team Member')) {
        router.push(`/${lang}/admin/dashboards/crm`);
      } else if (userRole.includes('Trade Professional')) {
        router.push(`/${lang}/trade-professional/dashboards/crm`);
      } else {
        router.push(`/${lang}/unauthorized`);
      }

    }
  }, [session, status, pathname, router]);

  if (status === 'loading') {
    return <CircularProgress />;
  }

  return !session ? children : null;
};

export default GuestOnlyRoute;
