/**
 * All 13 query categories + extras from the walkthrough.
 *
 * Each category contains an array of `queries`. Each query has:
 *   - hiring: array of hiring-phrase strings (will be OR'd together)
 *   - skills: array of skill-term strings (will be OR'd together)
 *
 * The query builder turns these into:
 *   site:linkedin.com/posts (<hiring phrases OR'd>) (<skills OR'd>)
 *
 * Every single Boolean string from the walkthrough is captured below,
 * including the clickable-URL variants and the paste-only variants.
 */

export const categories = [
  {
    id: 1,
    name: 'Cloud Automation / DevOps / Platform',
    description: 'Your actual job title — start here most days.',
    queries: [
      { hiring: ['hiring'], skills: ['"cloud automation"', '"devops engineer"'] },
      { hiring: ['"we\'re hiring"', '"we are hiring"'], skills: ['"cloud automation"', '"devops engineer"'] },
      { hiring: ['"now hiring"', '"open role"'], skills: ['"cloud automation"', '"devops engineer"'] },
      { hiring: ['"my team is hiring"'], skills: ['DevOps', '"cloud automation"'] },
    ],
  },
  {
    id: 2,
    name: 'SRE / Infrastructure',
    description: 'Site reliability and infrastructure engineering roles.',
    queries: [
      { hiring: ['hiring'], skills: ['SRE', '"infrastructure engineer"'] },
      { hiring: ['"we\'re hiring"', '"we are hiring"'], skills: ['SRE', '"site reliability engineer"'] },
      { hiring: ['"join our team"'], skills: ['"distributed systems"', '"infrastructure engineer"'] },
      { hiring: ['"backfilling"', '"new headcount"'], skills: ['infrastructure', 'SRE'] },
    ],
  },
  {
    id: 3,
    name: 'Kubernetes / Containers',
    description: 'Container orchestration and Kubernetes ecosystem.',
    queries: [
      { hiring: ['hiring'], skills: ['Kubernetes', 'Docker'] },
      { hiring: ['"we are hiring"'], skills: ['Kubernetes', 'Helm'] },
      { hiring: ['"now hiring"'], skills: ['Kubernetes', 'EKS'] },
      { hiring: ['"my team is hiring"'], skills: ['Kubernetes', 'Docker'] },
    ],
  },
  {
    id: 4,
    name: 'Terraform / Ansible / IaC',
    description: 'Infrastructure as Code tooling.',
    queries: [
      { hiring: ['hiring'], skills: ['Terraform', 'Ansible'] },
      { hiring: ['"we\'re hiring"'], skills: ['Terraform', 'Ansible'] },
      { hiring: ['"open role"'], skills: ['"infrastructure as code"', 'Terraform'] },
      { hiring: ['"looking for"'], skills: ['Terraform', 'Ansible'], suffix: '"reach out"' },
    ],
  },
  {
    id: 5,
    name: 'AWS',
    description: 'Amazon Web Services specific roles.',
    queries: [
      { hiring: ['hiring'], skills: ['AWS'], extra: ['Lambda', '"Step Functions"'] },
      { hiring: ['"we are hiring"'], skills: ['AWS'], extra: ['ECS', 'EKS'] },
      { hiring: ['"now hiring"'], skills: ['AWS'], extra: ['CloudWatch', '"Secrets Manager"'] },
      { hiring: ['"my team is hiring"'], skills: ['AWS'] },
    ],
  },
  {
    id: 6,
    name: 'Azure',
    description: 'Microsoft Azure specific roles.',
    queries: [
      { hiring: ['hiring'], skills: ['Azure'], extra: ['"Azure DevOps"', '"Azure Pipelines"'] },
      { hiring: ['"we\'re hiring"'], skills: ['Azure'], extra: ['"Blob Storage"', '"Azure VM"'] },
      { hiring: ['"open role"'], skills: ['"Azure DevOps"'] },
    ],
  },
  {
    id: 7,
    name: 'CockroachDB / Database Migration / CDC',
    description: 'Your sharpest differentiator — fewer hits but much stronger matches.',
    queries: [
      { hiring: ['hiring'], skills: ['CockroachDB', '"database migration"'] },
      { hiring: ['"we are hiring"'], skills: ['CockroachDB', '"change data capture"'] },
      { hiring: ['"now hiring"'], skills: ['CDC', '"database migration"'] },
      { hiring: ['"looking for"'], skills: ['CockroachDB', '"database engineer"'], suffix: '"reach out"' },
    ],
  },
  {
    id: 8,
    name: 'CI/CD Tooling',
    description: 'Continuous integration and deployment pipeline roles.',
    queries: [
      { hiring: ['hiring'], skills: ['"GitHub Actions"', 'Jenkins'] },
      { hiring: ['"we\'re hiring"'], skills: ['"GitLab CI"', 'Bazel'] },
      { hiring: ['"join our team"'], skills: ['"CI/CD"', '"GitHub Actions"'] },
    ],
  },
  {
    id: 9,
    name: 'AI Infrastructure / Agentic AI / MLOps-as-tooling',
    description: 'Deploying and operating AI systems — distinct from building models.',
    queries: [
      { hiring: ['hiring'], skills: ['"AI infrastructure"', 'MLOps'] },
      { hiring: ['"we are hiring"'], skills: ['"ML infrastructure"', '"agentic AI"'] },
      { hiring: ['"now hiring"'], skills: ['"LLM platform"', '"AI infrastructure"'] },
      { hiring: ['"my team is hiring"'], skills: ['"AI infrastructure"', 'MLOps'] },
    ],
  },
  {
    id: 10,
    name: 'Full-Stack Engineer',
    description: 'React/Next.js + FastAPI/Node.js/PostgreSQL roles.',
    queries: [
      { hiring: ['hiring'], skills: ['"full stack engineer"', '"full-stack developer"'] },
      { hiring: ['"we\'re hiring"', '"we are hiring"'], skills: ['React', '"Next.js"'] },
      { hiring: ['"now hiring"'], skills: ['"Node.js"', 'TypeScript'] },
      { hiring: ['"my team is hiring"'], skills: ['FastAPI', 'PostgreSQL'] },
      { hiring: ['"open role"'], skills: ['"full stack"', '"full-stack"'] },
    ],
  },
  {
    id: 11,
    name: 'AI Engineer / MLOps / Perception',
    description: 'Building models — computer vision, NLP/RAG, object detection.',
    queries: [
      { hiring: ['hiring'], skills: ['"AI engineer"', '"machine learning engineer"'] },
      { hiring: ['"we\'re hiring"', '"we are hiring"'], skills: ['"computer vision"', 'perception'] },
      { hiring: ['"now hiring"'], skills: ['YOLO', '"object detection"'] },
      { hiring: ['"my team is hiring"'], skills: ['LLM', 'RAG'] },
      { hiring: ['"open role"'], skills: ['"computer vision engineer"', '"perception engineer"'] },
    ],
  },
  {
    id: 12,
    name: 'HIL / Software Test Automation',
    description: 'Hardware-in-the-loop and test infrastructure roles.',
    queries: [
      { hiring: ['hiring'], skills: ['"test automation"', '"hardware in the loop"'] },
      { hiring: ['"we\'re hiring"', '"we are hiring"'], skills: ['HIL', '"test infrastructure"'] },
      { hiring: ['"now hiring"'], skills: ['"automation engineer"', '"software test engineer"'] },
      { hiring: ['"my team is hiring"'], skills: ['Bazel', '"fleet automation"'] },
    ],
  },
  {
    id: 13,
    name: 'General Software Engineering',
    description: 'Widest net — use when specialty searches come up dry.',
    queries: [
      { hiring: ['hiring'], skills: ['"software engineer"', '"software developer"'] },
      { hiring: ['"we\'re hiring"', '"we are hiring"'], skills: ['"software engineer"', '"backend engineer"'] },
      { hiring: ['"now hiring"'], skills: ['"software engineer"', 'SWE'] },
      { hiring: ['"my team is hiring"'], skills: ['engineer', '"software engineer"'] },
      { hiring: ['"join our team"'], skills: ['"engineering team"', '"software engineer"'] },
    ],
  },
  {
    id: 14,
    name: 'Extras — Cross-category',
    description: 'Not tied to any one skill area — catch-all phrases.',
    queries: [
      { hiring: ['"growing the team"'], skills: ['DevOps', 'cloud', 'infrastructure'] },
      { hiring: ['"backfilling"', '"new headcount"'], skills: ['DevOps', 'cloud', 'platform'] },
      { hiring: ['#hiring'], skills: ['DevOps', 'cloud', 'Kubernetes', 'SRE'] },
    ],
  },
];

/**
 * All hiring phrases used across the walkthrough, for reference.
 */
export const hiringPhrases = [
  'hiring',
  "we're hiring",
  'we are hiring',
  'now hiring',
  'my team is hiring',
  'open role',
  'join our team',
  'join my team',
  'growing the team',
  'backfilling',
  'new headcount',
  'looking for',
  '#hiring',
];
