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
    plaque: 'What changed',
    title: 'Release notes',
    text: 'What each Opsburg release added and fixed, linked to the pages that explain it.',
    to: '/docs/release-notes',
  },
];

export default function Home(): ReactNode {
  return (
    <Layout
      title="Documentation"
      description="How to run Opsburg, found a city and keep its worlds flying: self-hosting, organizations, projects, environments and GitOps clusters.">
      <header className={styles.hero}>
        <div className="container">
          <img className={styles.logo} src={useBaseUrl('/img/logo.png')} alt="" width={96} height={96} />
          <p className={styles.plaque}>Opsburg documentation</p>
          <h1 className={styles.title}>The Mayor's Handbook</h1>
          <p className={styles.lead}>
            Your organization is a city, your projects are worlds around it, and your Kubernetes clusters
            take their platform by pull request. This is how to run Opsburg and keep the city flying.
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
