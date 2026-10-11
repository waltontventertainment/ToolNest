import React from 'react';
import { Wrench } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

const LEGACY_AUTHOR_NAMES = new Set([
  '',
  'admin',
  'toolzaro editorial',
  'toolzaro team',
  'dr. marcus vance',
  'elena rostova',
  'kavita sundaram',
  'tariq al-mansoor',
  'alexander chen',
]);

const LEGACY_AUTHOR_ROLES = new Set([
  '',
  'chief editor',
  'lead editor',
  'editor',
  'senior tech writer',
  'principal security architect & systems engineer',
  'head of search strategy & information architecture',
  'staff frontend performance architect',
  'content strategist & digital publishing director',
  'senior staff security researcher & cryptographer',
]);

export function isDefaultOrLegacyAvatar(avatar?: string): boolean {
  if (!avatar || !avatar.trim()) return true;
  const clean = avatar.trim().toLowerCase();
  if (clean === 'toolzaro-logo') return true;
  if (clean.includes('ui-avatars.com')) return true;
  if (
    clean.includes('photo-1534528741775-53994a69daeb') ||
    clean.includes('photo-1573496359142-b8d87734a5a2') ||
    clean.includes('photo-1580489944761-15a19d654956') ||
    clean.includes('photo-1507003211169-0a1dd7228f2d') ||
    clean.includes('photo-1500648767791-00dcc994a43e')
  ) {
    return true;
  }
  return false;
}

export function resolveBlogAuthorDisplay(
  author?: { name?: string; role?: string; avatar?: string },
  branding?: {
    blogAuthorName?: string;
    blogAuthorRole?: string;
    showBlogAuthorRole?: boolean;
    blogAuthorAvatar?: string;
  }
) {
  const defaultName = branding?.blogAuthorName?.trim() || 'Toolzaro';
  const defaultRole =
    branding?.blogAuthorRole !== undefined ? branding.blogAuthorRole.trim() : 'Admin';
  const showRole = branding?.showBlogAuthorRole !== false;
  const globalAvatar = branding?.blogAuthorAvatar?.trim() || '';

  const rawName = (author?.name || '').trim();
  const displayName =
    !rawName || LEGACY_AUTHOR_NAMES.has(rawName.toLowerCase()) ? defaultName : rawName;

  const rawRole = (author?.role || '').trim();
  const displayRole =
    !rawRole || LEGACY_AUTHOR_ROLES.has(rawRole.toLowerCase()) ? defaultRole : rawRole;

  const customAvatar =
    !isDefaultOrLegacyAvatar(author?.avatar)
      ? author!.avatar!.trim()
      : !isDefaultOrLegacyAvatar(globalAvatar)
      ? globalAvatar
      : '';

  return {
    name: displayName,
    role: showRole ? displayRole : '',
    customAvatar,
  };
}

interface BlogAuthorBadgeProps {
  author?: {
    name?: string;
    role?: string;
    avatar?: string;
  };
  size?: 'sm' | 'md';
  showRoleOnSmall?: boolean;
}

/**
 * Renders the official Toolzaro Blog Profile Badge with the exact same 3D Wrench Logo
 * as the top-left Header, 'Toolzaro' as default name, and 'Admin' underneath (configurable in Admin Panel).
 */
export const BlogAuthorBadge: React.FC<BlogAuthorBadgeProps> = ({
  author,
  size = 'md',
  showRoleOnSmall = true,
}) => {
  const { settings } = useSiteSettings();
  const resolved = resolveBlogAuthorDisplay(author, settings.branding);

  const isSmall = size === 'sm';

  return (
    <div className="flex items-center gap-2.5 min-w-0">
      {resolved.customAvatar ? (
        <img
          src={resolved.customAvatar}
          alt={resolved.name}
          loading="lazy"
          decoding="async"
          width={isSmall ? 28 : 40}
          height={isSmall ? 28 : 40}
          className={`${
            isSmall ? 'w-7 h-7 rounded-xl' : 'w-10 h-10 rounded-2xl'
          } object-cover border border-border shrink-0 shadow-2xs`}
        />
      ) : (
        /* Exact same 3D Extruded Toolzaro Wrench Logo as the top-left site Header */
        <div
          className={`logo-3d relative ${
            isSmall ? 'w-7 h-7 rounded-xl!' : 'w-10 h-10 rounded-2xl'
          } flex items-center justify-center text-white shrink-0`}
          aria-hidden="true"
        >
          <div
            className={`absolute inset-0 ${
              isSmall ? 'rounded-xl' : 'rounded-2xl'
            } bg-gradient-to-t from-transparent via-white/10 to-white/35 pointer-events-none`}
          />
          <Wrench
            className={`${
              isSmall ? 'w-3.5 h-3.5' : 'w-5 h-5'
            } drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] text-white`}
          />
        </div>
      )}

      <div className="min-w-0 flex flex-col justify-center">
        <span
          className={`${
            isSmall ? 'text-xs font-bold' : 'text-sm font-extrabold'
          } text-foreground leading-tight truncate`}
        >
          {resolved.name}
        </span>
        {resolved.role && (!isSmall || showRoleOnSmall) && (
          <span
            className={`${
              isSmall ? 'text-[10px]' : 'text-xs'
            } text-muted-foreground font-medium leading-tight truncate mt-0.5`}
          >
            {resolved.role}
          </span>
        )}
      </div>
    </div>
  );
};
