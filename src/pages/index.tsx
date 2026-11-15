import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './index.module.css';

const SECTIONS = [
  {
    plaque: 'Start',
    title: 'Quick start',
    text: 'Run the all-in-one image, open the city gate and found your first city.',
    to: '/docs/quick-start',
  },
  {
    plaque: 'Learn',
    title: 'Core concepts',
    text: 'What a city, a world, a quest and a building stand for in your cloud.',
    to: '/docs/core-concepts',
  },
  {
    plaque: 'The city',
    title: 'Your organization',
    text: 'Git connections, Kubernetes clusters, DNS registrars, AI models and logging rules.',
    to: '/docs/city/overview',
  },
  {
    plaque: 'Worlds',
    title: 'Your projects',
    text: 'The three kinds of world, their environments and the applications inside them.',
    to: '/docs/worlds/overview',
  },
  {
    plaque: 'Run it yourself',
    title: 'Self-hosting',
    text: 'Docker, Docker Compose or Helm, and every environment variable the console reads.',
    to: '/docs/self-hosting/docker',
  },
  {
    plaque: 'Connect',
    title: 'MCP server',
    text: 'Drive Opsburg from your AI client through the Model Context Protocol.',
    to: '/docs/integrations/mcp',
  },
];

export default function Home(): ReactNode {
  return (
    <Layout
      title="Documentation"
      description="How to run Opsburg, found a city and keep its worlds flying: self-hosting, organizations, projects, environments, GitOps clusters and the MCP server.">
      <header className={styles.hero}>
        <div className="container">
          <img className={styles.logo} src={useBaseUrl('/img/logo.png')} alt="" width={96} height={96} />
          <p className={styles.plaque}>Opsburg documentation</p>
          <h1 className={styles.title}>The Mayor's Handbook</h1>
          <p className={styles.lead}>
            Opsburg builds and ships your apps and AI agents, from the repository to your Kubernetes. Then it
            turns running them into a city you keep flying. This is how it works.
          </p>
          <div className={styles.actions}>
            <Link className="button button--primary button--lg" to="/docs/quick-start">
              Quick start
            </Link>
            <Link className={`button button--lg ${styles.secondary}`} to="/docs/intro">
              What is Opsburg
            </Link>
          </div>
        </div>
      </header>
      <main className="container margin-vert--xl">
        <div className={styles.grid}>
          {SECTIONS.map((s) => (
            <Link key={s.to} to={s.to} className={styles.card}>
              <span className={styles.cardPlaque}>{s.plaque}</span>
              <span className={styles.cardTitle}>{s.title}</span>
              <span className={styles.cardText}>{s.text}</span>
            </Link>
          ))}
        </div>
      </main>
    </Layout>
  );
}
