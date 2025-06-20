// Config Imports
import { i18n } from '@configs/i18n';
 
// Util Imports
import { ensurePrefix } from '@/utils/string';
import { adminRole, teamMemberRole, tradeProfessionalRole, retailCustomerRole } from '@/configs/constant';
 
// Check if the url is missing the locale
export const isUrlMissingLocale = url => {
  return i18n.locales.every(locale => !(url.startsWith(`/${locale}/`) || url === `/${locale}`));
};
 
// Get the localized url
export const getLocalizedUrl = (url, languageCode) => {
 
  if (!url || !languageCode) throw new Error("URL or Language Code can't be empty");
 
  return isUrlMissingLocale(url) ? `/${languageCode}${ensurePrefix(url, '/')}` : url;
};
 
// Get role-based URL for support tickets
export const getRoleBasedSupportTicketUrl = (id, userRoles, languageCode) => {
  if (!id || !userRoles || !languageCode) {
    throw new Error("Ticket ID, User Roles, or Language Code can't be empty");
  }
 
  let basePath = '';
  if (userRoles.includes(adminRole.id) || userRoles.includes(teamMemberRole.id)) {
    basePath = '/admin/support-tickets/view';
  } else if (userRoles.includes(tradeProfessionalRole.id)) {
    basePath = '/trade-professional/support-tickets/view';
  } else if (userRoles.includes(retailCustomerRole.id)) {
    basePath = '/user/support-tickets/view';
  } else {
    // Default fallback
    basePath = '/admin/support-tickets/view';
  }
 
  return getLocalizedUrl(`${basePath}/${id}`, languageCode);
};
 
// Get role-based URL for any resource
export const getRoleBasedUrl = (resourcePath, resourceId, userRoles, languageCode) => {
  if (!resourcePath || !resourceId || !userRoles || !languageCode) {
    throw new Error("Resource Path, Resource ID, User Roles, or Language Code can't be empty");
  }
 
 
  let basePath = '';
  if (userRoles.includes(adminRole.id) || userRoles.includes(teamMemberRole.id)) {
    basePath = `/admin/${resourcePath}`;
  } else if (userRoles.includes(tradeProfessionalRole.id)) {
    basePath = `/trade-professional/${resourcePath}`;
  } else if (userRoles.includes(retailCustomerRole.id)) {
    basePath = `/user/${resourcePath}`;
  } else {
    // Default fallback
    basePath = `/admin/${resourcePath}`;
  }
 
  return getLocalizedUrl(`${basePath}/${resourceId}`, languageCode);
};
 