/**
 * All 21 query categories from the updated walkthrough.
 *
 * Each category contains an array of raw query strings, exactly as specified
 * in linkedin-queries-FINAL.md. The query builder prepends
 * `site:linkedin.com/posts` to each one.
 *
 * Queries now include location targeting (US, SF, LA) baked in.
 */

export const categories = [
  {
    id: 1,
    name: 'Cloud Automation / DevOps / Platform',
    description: 'Your actual job title — lead with this.',
    tier: 'core',
    queries: [
      'hiring ("cloud automation" OR "devops engineer") "united states"',
      'hiring ("cloud automation" OR "devops engineer") "san francisco"',
      'hiring ("cloud automation" OR "devops engineer") "los angeles"',
      '("we\'re hiring" OR "we are hiring") ("cloud automation" OR "devops engineer") "united states"',
      '"my team is hiring" (DevOps OR cloud) "united states"',
    ],
  },
  {
    id: 2,
    name: 'SRE / Infrastructure',
    description: 'Site reliability and infrastructure engineering roles.',
    tier: 'core',
    queries: [
      'hiring (SRE OR "infrastructure engineer") "united states"',
      'hiring (SRE OR "infrastructure engineer") "san francisco"',
      'hiring (SRE OR "infrastructure engineer") "los angeles"',
      '("we\'re hiring" OR "we are hiring") (SRE OR infrastructure) "united states"',
      '"join our team" ("infrastructure engineer" OR SRE) "united states"',
    ],
  },
  {
    id: 3,
    name: 'Kubernetes / Containers',
    description: 'Container orchestration and Kubernetes ecosystem.',
    tier: 'core',
    queries: [
      'hiring (Kubernetes OR Docker) "united states"',
      'hiring (Kubernetes OR Helm) "san francisco"',
      'hiring (Kubernetes OR Docker) "los angeles"',
      '"we are hiring" (Kubernetes OR EKS) "united states"',
      '"now hiring" (Kubernetes OR Docker) "united states"',
    ],
  },
  {
    id: 4,
    name: 'Terraform / Ansible / IaC',
    description: 'Infrastructure as Code tooling.',
    tier: 'core',
    queries: [
      'hiring (Terraform OR Ansible) "united states"',
      'hiring (Terraform OR Ansible) "san francisco"',
      'hiring (Terraform OR Ansible) "los angeles"',
      '"we\'re hiring" (Terraform OR "infrastructure as code") "united states"',
      '"open role" (Terraform OR Ansible) "united states"',
    ],
  },
  {
    id: 5,
    name: 'AWS',
    description: 'Amazon Web Services specific roles.',
    tier: 'cloud',
    queries: [
      'hiring AWS (Lambda OR "Step Functions") "united states"',
      'hiring AWS (ECS OR EKS) "san francisco"',
      'hiring AWS (CloudWatch OR "Secrets Manager") "los angeles"',
      '"we are hiring" AWS "united states"',
      '"now hiring" AWS "united states"',
    ],
  },
  {
    id: 6,
    name: 'Azure',
    description: 'Microsoft Azure specific roles.',
    tier: 'cloud',
    queries: [
      'hiring Azure ("Azure DevOps" OR "Azure Pipelines") "united states"',
      'hiring Azure ("Blob Storage" OR "Azure VM") "san francisco"',
      'hiring Azure ("Azure DevOps" OR "Blob Storage") "los angeles"',
      '"we\'re hiring" Azure "united states"',
    ],
  },
  {
    id: 7,
    name: 'CockroachDB / Database Migration / CDC',
    description: 'Sharpest differentiator — fewer hits but stronger matches.',
    tier: 'cloud',
    queries: [
      'hiring (CockroachDB OR "database migration") "united states"',
      'hiring (CockroachDB OR CDC) "san francisco"',
      'hiring (CockroachDB OR CDC) "los angeles"',
      '"we are hiring" (CockroachDB OR "change data capture") "united states"',
      '"now hiring" ("database engineer" OR CDC) "united states"',
    ],
  },
  {
    id: 8,
    name: 'CI/CD Tooling',
    description: 'Continuous integration and deployment pipeline roles.',
    tier: 'cloud',
    queries: [
      'hiring ("GitHub Actions" OR Jenkins) "united states"',
      'hiring ("GitHub Actions" OR "GitLab CI") "san francisco"',
      'hiring (Bazel OR "GitHub Actions") "los angeles"',
      '"we\'re hiring" (Bazel OR "CI/CD") "united states"',
    ],
  },
  {
    id: 9,
    name: 'AI Infrastructure / Agentic AI / MLOps',
    description: 'Deploying and operating AI systems.',
    tier: 'specialty',
    queries: [
      'hiring ("AI infrastructure" OR MLOps) "united states"',
      'hiring ("AI infrastructure" OR MLOps) "san francisco"',
      'hiring ("AI infrastructure" OR MLOps) "los angeles"',
      '"we are hiring" ("ML infrastructure" OR "agentic AI") "united states"',
      '"now hiring" ("LLM platform" OR "AI infrastructure") "united states"',
    ],
  },
  {
    id: 10,
    name: 'Full-Stack Engineer',
    description: 'React/Next.js + FastAPI/Node.js/PostgreSQL roles.',
    tier: 'specialty',
    queries: [
      'hiring ("full stack engineer" OR "full-stack developer") "united states"',
      'hiring (React OR "Next.js") "san francisco"',
      'hiring (Node.js OR TypeScript) "los angeles"',
      '("we\'re hiring" OR "we are hiring") (Node.js OR TypeScript) "united states"',
      '"my team is hiring" (FastAPI OR PostgreSQL) "united states"',
    ],
  },
  {
    id: 11,
    name: 'AI Engineer / MLOps / Perception',
    description: 'Building models — computer vision, NLP/RAG, object detection.',
    tier: 'specialty',
    queries: [
      'hiring ("AI engineer" OR "machine learning engineer") "united states"',
      'hiring ("computer vision" OR perception) "san francisco"',
      'hiring ("computer vision" OR perception) "los angeles"',
      '"we are hiring" (YOLO OR "object detection") "united states"',
      '"now hiring" (LLM OR RAG) "united states"',
    ],
  },
  {
    id: 12,
    name: 'HIL / Software Test Automation',
    description: 'Hardware-in-the-loop and test infrastructure roles.',
    tier: 'specialty',
    queries: [
      'hiring ("test automation" OR "hardware in the loop") "united states"',
      'hiring (HIL OR "test infrastructure") "san francisco"',
      'hiring ("automation engineer" OR "software test engineer") "los angeles"',
      '"we are hiring" ("automation engineer" OR "software test engineer") "united states"',
      '"my team is hiring" (Bazel OR "fleet automation") "united states"',
    ],
  },
  {
    id: 13,
    name: 'General Software Engineering',
    description: 'Widest net — use when specialty searches come up dry.',
    tier: 'specialty',
    queries: [
      'hiring ("software engineer" OR "software developer") "united states"',
      'hiring ("software engineer" OR SWE) "san francisco"',
      'hiring ("software engineer" OR "backend engineer") "los angeles"',
      '("we\'re hiring" OR "we are hiring") ("software engineer" OR "backend engineer") "united states"',
      '"now hiring" (engineer OR "software engineer") "united states"',
    ],
  },
  {
    id: 14,
    name: 'Data Engineering / ETL',
    description: 'Snowflake, dbt, Kafka, and data pipeline roles.',
    tier: 'specialty',
    queries: [
      'hiring (Snowflake OR dbt) "united states"',
      'hiring (Snowflake OR dbt) "san francisco"',
      'hiring (Snowflake OR "data pipeline") "los angeles"',
      '("we\'re hiring" OR "we are hiring") ("data engineer" OR Snowflake) "united states"',
      '"now hiring" (Kafka OR "data engineer") "united states"',
    ],
  },
  {
    id: 15,
    name: 'Web Scraping / Data Extraction',
    description: 'Scrapy, Selenium, and data extraction roles.',
    tier: 'specialty',
    queries: [
      'hiring (Scrapy OR Selenium) "united states"',
      'hiring ("web scraping" OR Scrapy) "san francisco"',
      'hiring (Selenium OR "data extraction") "los angeles"',
      '"we are hiring" ("web scraping" OR OpenSearch) "united states"',
    ],
  },
  {
    id: 16,
    name: 'Linux / RHEL System Administration',
    description: 'Linux admin, RHEL, and systems administration roles.',
    tier: 'specialty',
    queries: [
      'hiring (RHEL OR "linux administrator") "united states"',
      'hiring ("systems administrator" OR Linux) "san francisco"',
      'hiring (SELinux OR "linux administrator") "los angeles"',
      '("we\'re hiring" OR "we are hiring") ("systems administrator" OR RHEL) "united states"',
    ],
  },
  {
    id: 17,
    name: 'NoSQL / Graph Databases',
    description: 'MongoDB, DynamoDB, and graph database roles.',
    tier: 'specialty',
    queries: [
      'hiring (MongoDB OR DynamoDB) "united states"',
      'hiring (MongoDB OR "graph database") "san francisco"',
      'hiring (DynamoDB OR NoSQL) "los angeles"',
      '"we are hiring" (MongoDB OR DynamoDB) "united states"',
    ],
  },
  {
    id: 18,
    name: 'GCP (Google Cloud)',
    description: 'Google Cloud Platform roles.',
    tier: 'cloud',
    queries: [
      'hiring (GCP OR "Google Cloud") "united states"',
      'hiring ("Google Cloud" OR GCP) "san francisco"',
      'hiring (GCP OR "cloud engineer") "los angeles"',
    ],
  },
  {
    id: 19,
    name: 'Security Engineering / DevSecOps',
    description: 'Security engineering, DevSecOps, and data security roles.',
    tier: 'specialty',
    queries: [
      'hiring ("security engineer" OR DevSecOps) "united states"',
      'hiring ("data security" OR "application security") "san francisco"',
      'hiring ("security engineer" OR encryption) "los angeles"',
      '("we\'re hiring" OR "we are hiring") ("security engineer" OR DevSecOps) "united states"',
    ],
  },
  {
    id: 20,
    name: 'IoT / Embedded Systems',
    description: 'IoT engineering and embedded systems roles.',
    tier: 'specialty',
    queries: [
      'hiring ("IoT engineer" OR embedded) "united states"',
      'hiring ("embedded systems" OR "IoT") "san francisco"',
      'hiring ("embedded engineer" OR "sensor fusion") "los angeles"',
    ],
  },
  {
    id: 21,
    name: 'Internal Tooling / ChatOps / Integration',
    description: 'Internal tools, developer productivity, and integration engineering.',
    tier: 'specialty',
    queries: [
      'hiring ("internal tools" OR "developer productivity") "united states"',
      'hiring ("integration engineer" OR "developer experience") "san francisco"',
      'hiring ("internal tooling" OR "platform tools") "los angeles"',
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
  'backfilling',
  'new headcount',
  'looking for',
  '#hiring',
];
