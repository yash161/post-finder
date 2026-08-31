# LinkedIn HM/Recruiter Post Queries — Final

## The confirmed mechanism
LinkedIn's Posts search doesn't support a real location filter, no URL parameter, no working facet for that category. The only thing that actually works, confirmed by your own test, is a quoted location phrase sitting inside `keywords` as plain text, alongside the hiring phrase and skill terms:

```
HIRING_PHRASE (SKILL1 OR SKILL2) "LOCATION"
```

`hiring ("cloud automation" OR "devops engineer") "los angeles"` returned real, relevant results. That's the shape every query below follows. Location order is United States first, San Francisco second, Los Angeles third, per your priority.

**Two real limits to know:**
- LinkedIn caps free-tier Boolean at roughly 3-4 OR operators before it throws an error screen instead of results (confirmed on LinkedIn's own help page). That's why each query stays to one skill OR-group plus one hiring phrase, never stacked further.
- There's no native 24-48h date filter, only Past 24 hours / Past week / Past month. Cover the gap by rerunning your Past-24h queries twice a day, roughly 12 hours apart.

**Verified hiring phrases**, pulled from your playbook and cross-checked against real 2026 usage:
`hiring` · `we're hiring` · `we are hiring` · `now hiring` · `my team is hiring` · `open role` · `join our team` · `backfilling` · `new headcount` · `looking for` (+ `reach out`) · `#hiring`

## How to run these
1. Paste a query into LinkedIn's search bar, hit enter, click the **Posts** tab.
2. Set Date posted → Past 24 hours, Sort → Latest.
3. Scroll top to bottom, newest first, stop once you hit a post you already logged.
4. Error screen instead of results → you hit the OR-limit, drop one OR group, retry.
5. Zero or near-zero results → try `past-week` before assuming it's broken, some of your niche clusters (7, 19-21) are naturally low-volume.
6. For every real hit: check the poster's profile for Tier 1-2 fit (hiring manager or recruiter, per your playbook), log company, role, contact, and actual post age in your tracker.
7. Rerun your top clusters ~12 hours after the first pass to cover 24-48h.

---

## 1. Cloud Automation / DevOps / Platform *(your title, lead with this)*
- `hiring ("cloud automation" OR "devops engineer") "united states"`
- `hiring ("cloud automation" OR "devops engineer") "san francisco"`
- `hiring ("cloud automation" OR "devops engineer") "los angeles"`
- `("we're hiring" OR "we are hiring") ("cloud automation" OR "devops engineer") "united states"`
- `"my team is hiring" (DevOps OR cloud) "united states"`

## 2. SRE / Infrastructure
- `hiring (SRE OR "infrastructure engineer") "united states"`
- `hiring (SRE OR "infrastructure engineer") "san francisco"`
- `hiring (SRE OR "infrastructure engineer") "los angeles"`
- `("we're hiring" OR "we are hiring") (SRE OR infrastructure) "united states"`
- `"join our team" ("infrastructure engineer" OR SRE) "united states"`

## 3. Kubernetes / Containers
- `hiring (Kubernetes OR Docker) "united states"`
- `hiring (Kubernetes OR Helm) "san francisco"`
- `hiring (Kubernetes OR Docker) "los angeles"`
- `"we are hiring" (Kubernetes OR EKS) "united states"`
- `"now hiring" (Kubernetes OR Docker) "united states"`

## 4. Terraform / Ansible / IaC
- `hiring (Terraform OR Ansible) "united states"`
- `hiring (Terraform OR Ansible) "san francisco"`
- `hiring (Terraform OR Ansible) "los angeles"`
- `"we're hiring" (Terraform OR "infrastructure as code") "united states"`
- `"open role" (Terraform OR Ansible) "united states"`

## 5. AWS
- `hiring AWS (Lambda OR "Step Functions") "united states"`
- `hiring AWS (ECS OR EKS) "san francisco"`
- `hiring AWS (CloudWatch OR "Secrets Manager") "los angeles"`
- `"we are hiring" AWS "united states"`
- `"now hiring" AWS "united states"`

## 6. Azure
- `hiring Azure ("Azure DevOps" OR "Azure Pipelines") "united states"`
- `hiring Azure ("Blob Storage" OR "Azure VM") "san francisco"`
- `hiring Azure ("Azure DevOps" OR "Blob Storage") "los angeles"`
- `"we're hiring" Azure "united states"`

## 7. CockroachDB / Database Migration / CDC *(sharpest differentiator, lowest volume)*
- `hiring (CockroachDB OR "database migration") "united states"`
- `hiring (CockroachDB OR CDC) "san francisco"`
- `hiring (CockroachDB OR CDC) "los angeles"`
- `"we are hiring" (CockroachDB OR "change data capture") "united states"`
- `"now hiring" ("database engineer" OR CDC) "united states"`

## 8. CI/CD Tooling
- `hiring ("GitHub Actions" OR Jenkins) "united states"`
- `hiring ("GitHub Actions" OR "GitLab CI") "san francisco"`
- `hiring (Bazel OR "GitHub Actions") "los angeles"`
- `"we're hiring" (Bazel OR "CI/CD") "united states"`

## 9. AI Infrastructure / Agentic AI / MLOps-as-tooling *(deploying/operating AI systems)*
- `hiring ("AI infrastructure" OR MLOps) "united states"`
- `hiring ("AI infrastructure" OR MLOps) "san francisco"`
- `hiring ("AI infrastructure" OR MLOps) "los angeles"`
- `"we are hiring" ("ML infrastructure" OR "agentic AI") "united states"`
- `"now hiring" ("LLM platform" OR "AI infrastructure") "united states"`

## 10. Full-Stack Engineer
- `hiring ("full stack engineer" OR "full-stack developer") "united states"`
- `hiring (React OR "Next.js") "san francisco"`
- `hiring (Node.js OR TypeScript) "los angeles"`
- `("we're hiring" OR "we are hiring") (Node.js OR TypeScript) "united states"`
- `"my team is hiring" (FastAPI OR PostgreSQL) "united states"`

## 11. AI Engineer / MLOps / Perception *(building/training models)*
- `hiring ("AI engineer" OR "machine learning engineer") "united states"`
- `hiring ("computer vision" OR perception) "san francisco"`
- `hiring ("computer vision" OR perception) "los angeles"`
- `"we are hiring" (YOLO OR "object detection") "united states"`
- `"now hiring" (LLM OR RAG) "united states"`

## 12. HIL / Software Test Automation
- `hiring ("test automation" OR "hardware in the loop") "united states"`
- `hiring (HIL OR "test infrastructure") "san francisco"`
- `hiring ("automation engineer" OR "software test engineer") "los angeles"`
- `"we are hiring" ("automation engineer" OR "software test engineer") "united states"`
- `"my team is hiring" (Bazel OR "fleet automation") "united states"`

## 13. General Software Engineering *(widest net)*
- `hiring ("software engineer" OR "software developer") "united states"`
- `hiring ("software engineer" OR SWE) "san francisco"`
- `hiring ("software engineer" OR "backend engineer") "los angeles"`
- `("we're hiring" OR "we are hiring") ("software engineer" OR "backend engineer") "united states"`
- `"now hiring" (engineer OR "software engineer") "united states"`

## 14. Data Engineering / ETL
- `hiring (Snowflake OR dbt) "united states"`
- `hiring (Snowflake OR dbt) "san francisco"`
- `hiring (Snowflake OR "data pipeline") "los angeles"`
- `("we're hiring" OR "we are hiring") ("data engineer" OR Snowflake) "united states"`
- `"now hiring" (Kafka OR "data engineer") "united states"`

## 15. Web Scraping / Data Extraction
- `hiring (Scrapy OR Selenium) "united states"`
- `hiring ("web scraping" OR Scrapy) "san francisco"`
- `hiring (Selenium OR "data extraction") "los angeles"`
- `"we are hiring" ("web scraping" OR OpenSearch) "united states"`

## 16. Linux / RHEL System Administration
- `hiring (RHEL OR "linux administrator") "united states"`
- `hiring ("systems administrator" OR Linux) "san francisco"`
- `hiring (SELinux OR "linux administrator") "los angeles"`
- `("we're hiring" OR "we are hiring") ("systems administrator" OR RHEL) "united states"`

## 17. NoSQL / Graph Databases
- `hiring (MongoDB OR DynamoDB) "united states"`
- `hiring (MongoDB OR "graph database") "san francisco"`
- `hiring (DynamoDB OR NoSQL) "los angeles"`
- `"we are hiring" (MongoDB OR DynamoDB) "united states"`

## 18. GCP (Google Cloud)
- `hiring (GCP OR "Google Cloud") "united states"`
- `hiring ("Google Cloud" OR GCP) "san francisco"`
- `hiring (GCP OR "cloud engineer") "los angeles"`

## 19. Security Engineering / DevSecOps / Data Security
- `hiring ("security engineer" OR DevSecOps) "united states"`
- `hiring ("data security" OR "application security") "san francisco"`
- `hiring ("security engineer" OR encryption) "los angeles"`
- `("we're hiring" OR "we are hiring") ("security engineer" OR DevSecOps) "united states"`

## 20. IoT / Embedded Systems
- `hiring ("IoT engineer" OR embedded) "united states"`
- `hiring ("embedded systems" OR "IoT") "san francisco"`
- `hiring ("embedded engineer" OR "sensor fusion") "los angeles"`

## 21. Internal Tooling / ChatOps / Integration Engineering
- `hiring ("internal tools" OR "developer productivity") "united states"`
- `hiring ("integration engineer" OR "developer experience") "san francisco"`
- `hiring ("internal tooling" OR "platform tools") "los angeles"`

---

## Weekly rotation
- **DevOps/cloud days:** 1-9, 14, 16
- **AI/ML days:** 9, 11
- **Hardware/test days:** 12, 20
- **Wide-net days:** 13
- **Security-focused days:** 19
- **Once-a-week full niche sweep:** 14-18, 20, 21
