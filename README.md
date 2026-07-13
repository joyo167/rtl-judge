# RTL Judge

An online judge for **Verilog / RTL design**. Write synthesizable Verilog in a browser editor, submit, and get a verdict in seconds — compiled and simulated inside an isolated Docker container with [Icarus Verilog](https://steveicarus.github.io/iverilog/).

---

## Architecture

```
                          USER BROWSER
                               │
                               │  HTTPS
                               ▼
         ┌─────────────────────────────────────────────┐
         │          VERCEL  ·  Next.js 14               │
         │                                             │
         │  /                     Landing page         │
         │  /problems             Problem list         │
         │  /problems/[slug]      Editor + submit      │
         │  /contests             Contest list         │
         │  /contests/[id]        Contest arena        │
         │  /leaderboard          Global rankings      │
         │  /profile/[user]       User stats           │
         │  /admin/blog           Blog CMS             │
         │  /admin/contests       Contest manager      │
         │                                             │
         │  API Routes                                 │
         │  /api/auth         ──► GitHub OAuth         │
         │  /api/submissions  ──► enqueue BullMQ job   │
         │  /api/leaderboard  ──► Redis ZRANGE         │
         │  /api/problems                              │
         │  /api/contests                              │
         │  /api/blog                                  │
         │  /api/stats                                 │
         └──────────────────┬──────────────────────────┘
                            │ Prisma ORM (SSL)
                            ▼
         ┌─────────────────────────────────────────────┐
         │         SUPABASE  ·  PostgreSQL              │
         │                                             │
         │  User              Problem                  │
         │  Submission        UserSolve                │
         │  Contest           ContestProblem           │
         │  ContestSubmission BlogPost                 │
         └─────────────────────────────────────────────┘
                            ▲
                            │
         ┌──────────────────┴──────────────────────────┐
         │          UPSTASH  ·  Redis                   │
         │                                             │
         │  BullMQ queues                              │
         │    submissions                              │
         │    contest-submissions                      │
         │                                             │
         │  Sorted sets                                │
         │    leaderboard:global   score = points      │
         │    contest:{id}:solved  score = solve count │
         │    contest:{id}:penalty score = penalty min │
         └──────────────────┬──────────────────────────┘
                            │  worker pulls jobs
                            ▼
         ┌─────────────────────────────────────────────┐
         │       AWS EC2  ·  Judge Service              │
         │       Node.js + PM2 + Docker                │
         │                                             │
         │  For every submission job:                  │
         │  1. Write solution.v + testbench.v          │
         │     to /tmp/jobs/<submissionId>/            │
         │  2. docker.createContainer({                │
         │       image : rtl-judge:latest              │
         │       bind  : /tmp/jobs/<id>:/judge:ro      │
         │       memory: 256 MB                        │
         │       cpus  : 1   pids: 50                  │
         │       net   : none   AutoRemove: true        │
         │     })                                      │
         │  3. iverilog compile → timeout 5 simulate   │
         │  4. parse stdout for verdict token          │
         │  5. UPDATE Submission in Supabase           │
         │  6. if AC + first solve:                    │
         │       ZADD leaderboard:global               │
         │       INSERT UserSolve                      │
         │       UPDATE User(points, solveCount)       │
         └─────────────────────────────────────────────┘
```

---

## Verdicts

| Code  | Meaning |
|-------|---------|
| `AC`  | Accepted — testbench printed `VERDICT: ACCEPTED` |
| `WA`  | Wrong Answer — testbench printed `VERDICT: WRONG_ANSWER` |
| `CE`  | Compile Error — `iverilog` rejected the source |
| `TLE` | Time Limit Exceeded — simulation ran longer than 5 s |
| `RE`  | Runtime Error — any other non-passing outcome |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 · App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Code editor | Monaco Editor |
| Auth | NextAuth.js · GitHub OAuth |
| ORM | Prisma |
| Database | PostgreSQL · Supabase |
| Job queue | BullMQ |
| Queue broker / cache | Upstash Redis |
| Judge execution | Docker · dockerode |
| Verilog toolchain | Icarus Verilog (`iverilog`) |
| App hosting | Vercel |
| Judge hosting | AWS EC2 · PM2 |

---

## Project Structure

```
rtl-judge/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Landing page
│   │   ├── problems/                 # /problems and /problems/[slug]
│   │   ├── contests/                 # /contests and /contests/[id]
│   │   ├── leaderboard/
│   │   ├── profile/[user]/
│   │   ├── admin/                    # blog + contest admin panels
│   │   └── api/                      # all route handlers
│   │       ├── auth/
│   │       ├── submissions/
│   │       ├── problems/
│   │       ├── contests/
│   │       ├── leaderboard/
│   │       ├── blog/
│   │       └── stats/
│   ├── components/                   # shared React components
│   └── lib/                          # prisma client, auth config, helpers
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── judge-service/
    ├── src/index.js                  # BullMQ workers + Docker judge logic
    ├── sync-leaderboard.js           # Redis ↔ Postgres leaderboard sync
    └── package.json
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) project (PostgreSQL)
- [Upstash](https://upstash.com) Redis database
- [GitHub OAuth App](https://github.com/settings/developers)

### 1. Install

```bash
git clone https://github.com/joyo167/rtl-judge.git
cd rtl-judge
npm install
```

### 2. Environment variables

Create `.env.local`:

```env
DATABASE_URL=postgresql://...@...supabase.co:5432/postgres
REDIS_URL=rediss://default:...@...upstash.io:6379

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<any-random-string>

GITHUB_CLIENT_ID=<your-oauth-app-id>
GITHUB_CLIENT_SECRET=<your-oauth-app-secret>
```

### 3. Database

```bash
npx prisma migrate dev   # apply schema
npm run db:seed          # seed sample problems
```

### 4. Run

```bash
npm run dev              # http://localhost:3000
```

> Submissions will queue but won't be judged without the judge service running locally or on EC2.

---

## Judge Service

Runs as a separate Node.js process on an EC2 instance. Requires Docker.

### Build the judge image (once on EC2)

```bash
docker build -t rtl-judge:latest - <<'EOF'
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y iverilog && rm -rf /var/lib/apt/lists/*
EOF
```

### Setup

```bash
cd judge-service
npm install
cp .env.example .env
# set REDIS_URL and DATABASE_URL in .env
```

### Run

```bash
# development
npm run dev

# production
npm install -g pm2
pm2 start src/index.js --name rtl-judge
pm2 save && pm2 startup
```

Startup output:

```
[redis] connected
[judge] worker started, waiting for jobs...
```

Per-job output:

```
[judge] processing job 3, submission <uuid>
[judge] verdict: AC in 218ms
[worker] job 3 done: AC
```

### Sandbox limits

| Resource | Limit |
|----------|-------|
| Memory | 256 MB |
| CPUs | 1 |
| PIDs | 50 |
| Network | none |
| Wall-clock time | 5 s |
| Filesystem | read-only bind mount |

---

## Writing a Testbench

The judge mounts submitted code at `/judge/solution.v` and the stored testbench at `/judge/testbench.v`. Your testbench **must** emit exactly one of these lines to stdout before calling `$finish`:

```verilog
$display("VERDICT: ACCEPTED");
$display("VERDICT: WRONG_ANSWER");
```

Minimal skeleton:

```verilog
`timescale 1ns/1ps
module tb;

  // instantiate student module
  // drive inputs
  // check outputs

  initial begin
    #100;
    if (pass)
      $display("VERDICT: ACCEPTED");
    else
      $display("VERDICT: WRONG_ANSWER");
    $finish;
  end
endmodule
```

---

## Deployment

| Service | Platform | How to deploy |
|---------|----------|---------------|
| Next.js app | Vercel | Auto-deploy on `git push main` |
| Judge service | AWS EC2 + PM2 | `git pull` → `pm2 restart rtl-judge` |
| Database | Supabase | `npx prisma migrate deploy` |
| Redis / Queues | Upstash | Managed — no action needed |
