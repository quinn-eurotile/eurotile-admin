'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Component Imports
import LangRedirect from '@components/LangRedirect'

// Config Imports
import { i18n } from '@configs/i18n'

// ℹ️ We've to create this array because next.js makes request with `_next` prefix for static/asset files
const invalidLangs = ['_next']

const TranslationWrapper = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If we're at the root path, redirect to the login page
    if (pathname === '/') {
      router.push('/en/login');
    }
  }, [pathname, router]);

  const doesLangExist = i18n.locales.includes(pathname.split('/')[1])

  // ℹ️ This doesn't mean MISSING, it means INVALID
  const isInvalidLang = invalidLangs.includes(pathname.split('/')[1])

  return doesLangExist || isInvalidLang ? children : <LangRedirect />
}

export default TranslationWrapper
