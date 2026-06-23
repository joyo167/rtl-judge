# RTL Judge Service

A standalone Node.js worker that picks up submission jobs from the BullMQ
(`submissions`) queue, compiles and runs the Verilog submission with
[Icarus Verilog](https://steveicarus.github.io/iverilog/) (`iverilog` + the
generated simulation binary), and writes the verdict back to PostgreSQL.

This service is meant to run **separately** from the Next.js web app (e.g. on
an EC2 instance) where the `iverilog` toolchain is installed.

## Verdicts

| Verdict | Meaning |
|---------|---------|
| `AC`  | Accepted — output contained `VERDICT: ACCEPTED` |
| `WA`  | Wrong Answer — output contained `VERDICT: WRONG_ANSWER` |
| `CE`  | Compile Error — `iverilog` failed to build the sources |
| `TLE` | Time Limit Exceeded — simulation killed after 5s |
| `RE`  | Runtime Error — any other non-passing outcome |

Your problem testbenches must print `VERDICT: ACCEPTED` or
`VERDICT: WRONG_ANSWER` to stdout for the judge to classify correctly.

## Prerequisites

- **Node.js 18+** (uses `node --watch` for dev)
- **Icarus Verilog** must be installed and on `PATH`:

  ```bash
  # macOS
  brew install icarus-verilog

  # Ubuntu / Debian (e.g. EC2)
  sudo apt-get update && sudo apt-get install -y iverilog
  ```

  Verify with: `iverilog -V`

## Setup

```bash
# 1. install dependencies
npm install

# 2. configure environment
cp .env.example .env
# then edit .env and fill in REDIS_URL and DATABASE_URL
```

`.env` values:

- `REDIS_URL` — your Upstash `rediss://` connection string (same one the web app uses)
- `DATABASE_URL` — your PostgreSQL/Supabase connection string

## Running

```bash
# production
node src/index.js
# or
npm start

# development (auto-restart on file changes)
npm run dev
```

On startup you should see:

```
[redis] connected
[judge] worker started, waiting for jobs...
```

Submit a problem from the web app and watch the logs:

```
[judge] processing job 1, submission <uuid>
[judge] verdict: AC in 142ms
[worker] job 1 done: AC
```

## Deploying on EC2

1. Launch an instance and SSH in.
2. Install Node.js and Icarus Verilog (see Prerequisites).
3. Clone the repo and `cd judge-service`.
4. `npm install`, create `.env`, then run under a process manager:

   ```bash
   npm install -g pm2
   pm2 start src/index.js --name rtl-judge
   pm2 save
   ```
