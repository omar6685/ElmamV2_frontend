import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

// NOTE: We did not use React Components for Icons, because
//  you may one to get the config from the server.

// NOTE: First level elements are groups.

export interface LayoutConfig {
  navItems: NavItemConfig[];
}

export const layoutConfig = {
  navItems: [
    {
      key: 'dashboards',
      title: 'Dashboard',
      items: [{ key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'house' }],
    },
    {
      key: 'general',
      title: 'General',
      items: [
        {
          key: 'reports',
          title: 'Reports',
          icon: 'folder',
          items: [
            { key: 'reports', title: 'List reports', href: paths.dashboard.reports.list },
          ],
        },
        {
          key: 'entities',
          title: 'Entities',
          icon: 'building-office',
          items: [
            { key: 'entities', title: 'List entities', href: paths.dashboard.entities.list },
          ],
        },
        {
          key: 'products',
          title: 'Products',
          icon: 'shopping-bag-open',
          items: [
            { key: 'products', title: 'List products', href: paths.dashboard.products.list },
            { key: 'products:create', title: 'Create product', href: paths.dashboard.products.create },
            { key: 'products:details', title: 'Product details', href: paths.dashboard.products.details('1') },
          ],
        },
        {
          key: 'orders',
          title: 'Orders',
          icon: 'shopping-cart-simple',
          items: [
            { key: 'orders', title: 'List orders', href: paths.dashboard.orders.list },
            { key: 'orders:create', title: 'Create order', href: paths.dashboard.orders.create },
            { key: 'orders:details', title: 'Order details', href: paths.dashboard.orders.details('1') },
          ],
        },
        {
          key: 'invoices',
          title: 'Invoices',
          icon: 'receipt',
          items: [
            { key: 'invoices', title: 'List invoices', href: paths.dashboard.invoices.list },
            { key: 'invoices:create', title: 'Create invoice', href: paths.dashboard.invoices.create },
            { key: 'invoices:details', title: 'Invoice details', href: paths.dashboard.invoices.details('1') },
          ],
        },
        {
          key: 'jobs',
          title: 'Jobs',
          icon: 'read-cv-logo',
          items: [
            { key: 'jobs:browse', title: 'Browse jobs', href: paths.dashboard.jobs.browse },
            { key: 'jobs:create', title: 'Create job', href: paths.dashboard.jobs.create },
            {
              key: 'jobs:company',
              title: 'Company details',
              href: paths.dashboard.jobs.companies.overview('1'),
              matcher: { type: 'startsWith', href: '/dashboard/jobs/companies/1' },
            },
          ],
        },
        {
          key: 'logistics',
          title: 'Logistics',
          icon: 'truck',
          items: [
            { key: 'logistics:metrics', title: 'Metrics', href: paths.dashboard.logistics.metrics },
            { key: 'logistics:fleet', title: 'Fleet', href: paths.dashboard.logistics.fleet },
          ],
        },
        {
          key: 'blog',
          title: 'Blog',
          icon: 'text-align-left',
          items: [
            { key: 'blog', title: 'List posts', href: paths.dashboard.blog.list },
            { key: 'blog:create', title: 'Create post', href: paths.dashboard.blog.create },
            { key: 'blog:details', title: 'Post details', href: paths.dashboard.blog.details('1') },
          ],
        },
        {
          key: 'social',
          title: 'Social',
          icon: 'share-network',
          items: [
            {
              key: 'social:profile',
              title: 'Profile',
              href: paths.dashboard.social.profile.timeline,
              matcher: { type: 'startsWith', href: '/dashboard/social/profile' },
            },
            { key: 'social:feed', title: 'Feed', href: paths.dashboard.social.feed },
          ],
        },
        {
          key: 'academy',
          title: 'Academy',
          icon: 'graduation-cap',
          items: [
            { key: 'academy:browse', title: 'Browse courses', href: paths.dashboard.academy.browse },
            { key: 'academy:course', title: 'Course details', href: paths.dashboard.academy.details('1') },
          ],
        },
        { key: 'file-storage', title: 'File storage', href: paths.dashboard.fileStorage, icon: 'upload' },
        {
          key: 'mail',
          title: 'Mail',
          href: paths.dashboard.mail.list('inbox'),
          icon: 'envelope-simple',
          matcher: { type: 'startsWith', href: '/dashboard/mail' },
        },
        {
          key: 'chat',
          title: 'Chat',
          href: paths.dashboard.chat.base,
          icon: 'chats-circle',
          matcher: { type: 'startsWith', href: '/dashboard/chat' },
        },
        { key: 'calendar', title: 'Calendar', href: paths.dashboard.calendar, icon: 'calendar-check' },
        { key: 'tasks', title: 'Tasks', href: paths.dashboard.tasks, icon: 'kanban' },
      ],
    },
    {
      key: 'other',
      title: 'Other',
      items: [
        { key: 'pricing', title: 'Pricing', href: paths.pricing, icon: 'credit-card' },
        { key: 'checkout', title: 'Checkout', href: paths.checkout, icon: 'sign-out' },
        { key: 'contact', title: 'Contact', href: paths.contact, icon: 'address-book' },
        {
          key: 'error',
          title: 'Error',
          icon: 'file-x',
          items: [
            { key: 'error:not-authorized', title: 'Not authorized', href: paths.notAuthorized },
            { key: 'error:not-found', title: 'Not found', href: paths.notFound },
            { key: 'error:internal-server-error', title: 'Internal server error', href: paths.internalServerError },
          ],
        },
      ],
    },
    {
      key: 'misc',
      title: 'Misc',
      items: [
        { key: 'i18n', title: 'i18n', href: paths.dashboard.i18n, icon: 'translate' },
        {
          key: 'levels:level-0',
          title: 'Level 0',
          icon: 'align-left',
          items: [
            {
              key: 'levels:level-1a',
              title: 'Level 1a',
              items: [
                {
                  key: 'levels:level-2a',
                  title: 'Level 2a',
                  items: [
                    { key: 'levels:level-3a', title: 'Level 3a' },
                    { key: 'levels:level-3b', title: 'Level 3b', disabled: true },
                  ],
                },
                { key: 'levels:level-2b', title: 'Level 2b' },
              ],
            },
            { key: 'levels:level-1b', title: 'Level 1b' },
          ],
        },
        { key: 'disabled', title: 'Disabled', disabled: true, icon: 'warning-diamond' },
        { key: 'label', title: 'Label', icon: 'file', label: 'New' },
        { key: 'blank', title: 'Blank', href: paths.dashboard.blank, icon: 'file-dashed' },
        { key: 'external', title: 'External link', href: 'https://devias.io', external: true, icon: 'link' },
      ],
    },
  ],
} satisfies LayoutConfig;
