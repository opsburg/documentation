import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import llmsTxt from './plugins/llms-txt';

// This runs in Node.js: no browser APIs or JSX here.

const config: Config = {
  title: 'Opsburg',
  tagline: 'Keep your cloud up and running. Play it like a city.',
  favicon: 'img/favicon.png',

  future: {
    v4: true,
  },

  // Served by GitHub Pages from the opsburg/documentation repository, under the
  // opsburg.dev custom domain of the organization site.
  url: 'https://opsburg.dev',
  baseUrl: '/documentation/',

  // GitHub Pages serves every page from <path>/index.html and 301s /<path> to
  // /<path>/. Emitting the slash ourselves keeps sitemap entries, canonicals and
  // internal links on the URL the host actually serves.
  trailingSlash: true,

  organizationName: 'opsburg',
  projectName: 'documentation',

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',

  // English only. A locale without translations would publish duplicate pages.
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Diagrams are ```mermaid fences, so they stay diffable and follow the theme.
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },
  themes: ['@docusaurus/theme-mermaid'],

  plugins: [
    [
      '@docusaurus/plugin-google-gtag',
      {
        // The same GA4 property as the rest of opsburg.dev, so a visit that
        // starts on the site and continues into the docs is one journey.
        trackingID: 'G-SX41W7EVTN',
      },
    ],
    // Emits /llms.txt, /llms-full.txt and a .md next to every doc page.
    llmsTxt,
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/opsburg/documentation/blob/main',
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          lastmod: 'date',
          changefreq: null,
          priority: null,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Opsburg',
      logo: {
        alt: 'Opsburg',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Documentation',
        },
        {
          to: '/docs/quick-start',
          label: 'Quick start',
          position: 'left',
        },
        {
          to: '/docs/self-hosting/docker',
          label: 'Self-hosting',
          position: 'left',
        },
        {
          href: 'https://opsburg.dev',
          label: 'opsburg.dev',
          position: 'right',
        },
        {
          href: 'https://github.com/opsburg',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Start',
          items: [
            {label: 'What is Opsburg', to: '/docs/intro'},
            {label: 'Quick start', to: '/docs/quick-start'},
            {label: 'Core concepts', to: '/docs/core-concepts'},
          ],
        },
        {
          title: 'Run it yourself',
          items: [
            {label: 'Docker', to: '/docs/self-hosting/docker'},
            {label: 'Helm', to: '/docs/self-hosting/helm'},
            {label: 'Environment variables', to: '/docs/self-hosting/environment-variables'},
          ],
        },
        {
          title: 'Opsburg',
          items: [
            {label: 'Website', href: 'https://opsburg.dev'},
            {label: 'Design system', href: 'https://opsburg.dev/design-system/'},
            {label: 'GitHub', href: 'https://github.com/opsburg'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Opsburg`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.nightOwl,
      additionalLanguages: ['bash', 'yaml', 'json', 'docker'],
    },
    mermaid: {
      theme: {light: 'neutral', dark: 'dark'},
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
