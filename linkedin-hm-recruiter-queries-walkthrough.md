# LinkedIn HM/Recruiter Post Queries — Walkthrough

Think of this less as a list to skim and more as a routine I'm walking you through. I'll explain what each piece of the URL is doing, why the queries are shaped the way they are, and then give you the full set organized by your skill areas.

## First, the one URL you need to understand
Every query below is a variation on this:
```
https://www.linkedin.com/search/results/content/?keywords=YOUR+KEYWORDS&datePosted="past-24h"&sortBy="date_posted"&geoUrn=["103644278"]
```
Here's what each part is actually doing when you click it:
- `keywords=` is your search string. This is where the hiring phrase and skill terms go.
- `datePosted="past-24h"` tells LinkedIn to only show posts from the last day. This is the freshness filter, and it's the one that matters most, since a hiring post from two weeks ago has probably already been flooded with replies.
- `sortBy="date_posted"` sorts newest-first instead of by "relevance." You want this because relevance sorting buries today's post under something more popular from months ago.
- `geoUrn=["103644278"]` is LinkedIn's internal code for "United States." I confirmed this one specifically (it showed up independently in three separate places, one of them scraped straight from LinkedIn's own page code), so it's baked into every URL below rather than something you have to set by hand.

So when you click a URL, you're not doing four separate steps, you're doing all four at once. That's the whole point of using URLs instead of typing into the search bar every time.

## Why there are multiple queries per skill area instead of one big one
My first instinct was to jam every hiring phrase and every skill word into one search per category. That breaks. LinkedIn caps free accounts at roughly 3-4 "OR" operators before it just refuses to run the search and shows an error screen instead of results. I confirmed this on LinkedIn's own help page, so it's not a guess.

That's why, for something like Kubernetes, you're not getting one giant query, you're getting three or four small ones: one for "hiring," one for "we're hiring"/"we are hiring," one for "now hiring," and so on, each paired with just two skill terms. It's more queries to run, but each one actually works instead of erroring out.

## What "hiring phrase" actually means here
Real recruiters and hiring managers don't all write "hiring" the same way. Some write "we're hiring," some write "now hiring," some just write "my team is hiring" with no hashtag at all. I pulled this list straight from your playbook and then checked it against real 2026 LinkedIn usage:

`hiring` · `we're hiring` · `we are hiring` · `now hiring` · `my team is hiring` · `open role` · `join our team` · `join my team` · `growing the team` · `backfilling` · `new headcount` · `looking for` (+ `reach out`) · `#hiring`

That's why each cluster below rotates through 3-4 of these instead of just searching "hiring" once and calling it done. Different recruiters, different phrasing, same underlying signal.

---

## How to actually run these, step by step

1. **Open a URL, or paste a Boolean string.** If you're using one of the ready-made URLs, just click it, it does everything. If you're pasting a plain Boolean string (the ones without a URL next to them), type it into LinkedIn's search bar, hit enter, then click the **Posts** tab near the top, since LinkedIn defaults to showing People results otherwise.
2. **Check three things loaded correctly before you start reading:** Date posted should say "Past 24 hours," the sort should say "Latest," and Location should say "United States." The URLs set all three automatically. If you pasted a Boolean string instead, you'll need to set Location once yourself via "All filters," but it should stick for the rest of your session so you're not redoing it every time.
3. **Scroll from the top down.** Because it's sorted newest-first, the moment you hit a post you already logged from an earlier pass, you can stop, everything below it is older.
4. **If you get an error screen instead of results,** that's the OR-operator limit again, delete one of the OR groups in the query and try again.
5. **If you get zero or almost no results,** don't assume the query is broken, some of your niches (CockroachDB, perception, HIL) genuinely have lower posting volume. Try the same query with `past-24h` changed to `past-week` before giving up on it.
6. **For every real hit,** open the poster's profile. Are they an EM, a recruiter, or a future teammate (the playbook's Tier 1-3)? Log the company, role, contact, and the post's actual age (not just "under 24h," but "3h ago" versus "23h ago") in your tracker.
7. **Want California specifically, SF first then LA?** Run the national search first, then click "All filters" → Locations and type "California," or type "San Francisco Bay Area" and then separately "Los Angeles" if you want city-level instead of statewide. I didn't bake numbers for these into the URLs, since I could only independently confirm the US-wide code, not the city-level ones, and I'd rather have you do one extra click than hand you a number I can't stand behind.
8. **Do it twice a day, not once.** There's no real "past 48 hours" option on LinkedIn, so the way you cover that window is by rerunning the same Past-24h search again about 12 hours after your first pass. Anything that posted in between shows up fresh the second time.

---

## The queries, by skill area

### 1. Cloud Automation / DevOps / Platform
This is your actual job title, so start here most days.
- **Click this (phrase: hiring):** https://www.linkedin.com/search/results/content/?keywords=hiring%20(%22cloud%20automation%22%20OR%20%22devops%20engineer%22)&datePosted=%22past-24h%22&sortBy=%22date_posted%22&geoUrn=%5B%22103644278%22%5D
- Paste this for the "we're/we are hiring" variant: `("we're hiring" OR "we are hiring") ("cloud automation" OR "devops engineer")`
- Paste this for "now hiring"/"open role": `("now hiring" OR "open role") ("cloud automation" OR "devops engineer")`
- Paste this for "my team is hiring": `"my team is hiring" (DevOps OR "cloud automation")`

### 2. SRE / Infrastructure
- **Click:** https://www.linkedin.com/search/results/content/?keywords=hiring%20(SRE%20OR%20%22infrastructure%20engineer%22)&datePosted=%22past-24h%22&sortBy=%22date_posted%22&geoUrn=%5B%22103644278%22%5D
- `("we're hiring" OR "we are hiring") (SRE OR "site reliability engineer")`
- `"join our team" ("distributed systems" OR "infrastructure engineer")`
- `("backfilling" OR "new headcount") (infrastructure OR SRE)`

### 3. Kubernetes / Containers
- **Click:** https://www.linkedin.com/search/results/content/?keywords=hiring%20(Kubernetes%20OR%20Docker)&datePosted=%22past-24h%22&sortBy=%22date_posted%22&geoUrn=%5B%22103644278%22%5D
- `"we are hiring" (Kubernetes OR Helm)`
- `"now hiring" (Kubernetes OR EKS)`
- `"my team is hiring" (Kubernetes OR Docker)`

### 4. Terraform / Ansible / IaC
- **Click:** https://www.linkedin.com/search/results/content/?keywords=hiring%20(Terraform%20OR%20Ansible)&datePosted=%22past-24h%22&sortBy=%22date_posted%22&geoUrn=%5B%22103644278%22%5D
- `"we're hiring" (Terraform OR Ansible)`
- `"open role" ("infrastructure as code" OR Terraform)`
- `"looking for" (Terraform OR Ansible) "reach out"`

### 5. AWS
- **Click:** https://www.linkedin.com/search/results/content/?keywords=hiring%20AWS%20(Lambda%20OR%20%22Step%20Functions%22)&datePosted=%22past-24h%22&sortBy=%22date_posted%22&geoUrn=%5B%22103644278%22%5D
- `"we are hiring" AWS (ECS OR EKS)`
- `"now hiring" AWS (CloudWatch OR "Secrets Manager")`
- `"my team is hiring" AWS`

### 6. Azure
- **Click:** https://www.linkedin.com/search/results/content/?keywords=hiring%20Azure%20(%22Azure%20DevOps%22%20OR%20%22Azure%20Pipelines%22)&datePosted=%22past-24h%22&sortBy=%22date_posted%22&geoUrn=%5B%22103644278%22%5D
- `"we're hiring" Azure ("Blob Storage" OR "Azure VM")`
- `"open role" Azure DevOps`

### 7. CockroachDB / Database Migration / CDC
This is your sharpest differentiator, so expect fewer hits, but each one is a much stronger match than a generic DevOps post.
- **Click:** https://www.linkedin.com/search/results/content/?keywords=hiring%20(CockroachDB%20OR%20%22database%20migration%22)&datePosted=%22past-24h%22&sortBy=%22date_posted%22&geoUrn=%5B%22103644278%22%5D
- `"we are hiring" (CockroachDB OR "change data capture")`
- `"now hiring" (CDC OR "database migration")`
- `"looking for" (CockroachDB OR "database engineer") "reach out"`

### 8. CI/CD Tooling
- **Click:** https://www.linkedin.com/search/results/content/?keywords=hiring%20(%22GitHub%20Actions%22%20OR%20Jenkins)&datePosted=%22past-24h%22&sortBy=%22date_posted%22&geoUrn=%5B%22103644278%22%5D
- `"we're hiring" ("GitLab CI" OR Bazel)`
- `"join our team" ("CI/CD" OR "GitHub Actions")`

### 9. AI Infrastructure / Agentic AI / MLOps-as-tooling
This is you *deploying and operating* AI systems (Kubernetes agents, cost agents), which is a different recruiter search lane than cluster 11 below.
- **Click:** https://www.linkedin.com/search/results/content/?keywords=hiring%20(%22AI%20infrastructure%22%20OR%20MLOps)&datePosted=%22past-24h%22&sortBy=%22date_posted%22&geoUrn=%5B%22103644278%22%5D
- `"we are hiring" ("ML infrastructure" OR "agentic AI")`
- `"now hiring" ("LLM platform" OR "AI infrastructure")`
- `"my team is hiring" ("AI infrastructure" OR MLOps)`

### 10. Full-Stack Engineer
Your project pool has a dozen-plus real builds pairing React/Next.js with FastAPI/Node.js/PostgreSQL, this is its own search lane.
- **Click:** https://www.linkedin.com/search/results/content/?keywords=hiring%20(%22full%20stack%20engineer%22%20OR%20%22full-stack%20developer%22)&datePosted=%22past-24h%22&sortBy=%22date_posted%22&geoUrn=%5B%22103644278%22%5D
- `("we're hiring" OR "we are hiring") (React OR "Next.js")`
- `"now hiring" (Node.js OR TypeScript)`
- `"my team is hiring" (FastAPI OR PostgreSQL)`
- `"open role" ("full stack" OR "full-stack")`

### 11. AI Engineer / MLOps / Perception
This is you *building* the models (your NASA JPL computer-vision work, YOLOv11, object detection, plus your NLP/RAG research), different language than cluster 9.
- **Click:** https://www.linkedin.com/search/results/content/?keywords=hiring%20(%22AI%20engineer%22%20OR%20%22machine%20learning%20engineer%22)&datePosted=%22past-24h%22&sortBy=%22date_posted%22&geoUrn=%5B%22103644278%22%5D
- `("we're hiring" OR "we are hiring") ("computer vision" OR perception)`
- `"now hiring" (YOLO OR "object detection")`
- `"my team is hiring" (LLM OR RAG)`
- `"open role" ("computer vision engineer" OR "perception engineer")`

### 12. HIL / Software Test Automation
This maps to your entire Zipline internship (the 330+ node HIL fleet, Bazel-based test infra), a distinct hiring category from generalist DevOps.
- **Click:** https://www.linkedin.com/search/results/content/?keywords=hiring%20(%22test%20automation%22%20OR%20%22hardware%20in%20the%20loop%22)&datePosted=%22past-24h%22&sortBy=%22date_posted%22&geoUrn=%5B%22103644278%22%5D
- `("we're hiring" OR "we are hiring") (HIL OR "test infrastructure")`
- `"now hiring" ("automation engineer" OR "software test engineer")`
- `"my team is hiring" (Bazel OR "fleet automation")`

### 13. General Software Engineering
Your widest net. Use this when the specialty searches above are coming up dry, or when you just want more volume to work through.
- **Click:** https://www.linkedin.com/search/results/content/?keywords=hiring%20(%22software%20engineer%22%20OR%20%22software%20developer%22)&datePosted=%22past-24h%22&sortBy=%22date_posted%22&geoUrn=%5B%22103644278%22%5D
- `("we're hiring" OR "we are hiring") ("software engineer" OR "backend engineer")`
- `"now hiring" ("software engineer" OR SWE)`
- `"my team is hiring" (engineer OR "software engineer")`
- `"join our team" ("engineering team" OR "software engineer")`

### A few extra, not tied to any one skill
- `"growing the team" (DevOps OR cloud OR infrastructure)`
- `("backfilling" OR "new headcount") (DevOps OR cloud OR platform)`
- `#hiring (DevOps OR cloud OR Kubernetes OR SRE)`

---

## How I'd actually spread these across a week, if I were you
Running all 13 categories every single day is a lot, and most of your time would go to categories that just aren't posting much that day. So rotate instead:
- **DevOps/cloud-heavy days:** clusters 1 through 9.
- **AI/ML-heavy days:** clusters 9 and 11.
- **Hardware/test-automation days:** cluster 12.
- **Whenever you want more volume:** cluster 13.
- **Once a week, full sweep:** all 13, so nothing slips through for a whole week.

And twice within any given day: once in the morning at Past 24h, then again roughly 12 hours later, same filter, to cover the gap that a "past 48 hours" option would otherwise close, if LinkedIn actually had one.
