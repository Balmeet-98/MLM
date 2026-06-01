# Samriddhi Network — MLM Web Application

> "Plan your work and work your plan" | Sales Promotion with Exciting Rewards

A full-stack MLM web application for Samriddhi Network, Jammu.

**Full documentation:** See [PROJECT_GUIDE.md](./PROJECT_GUIDE.md) for complete system architecture, flows, income rules, API, and deployment.

---

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Cron Jobs**: node-cron (monthly income + installment checks)
- **Tree UI**: react-d3-tree

---

## Quick Start

### Prerequisites
- Node.js v18+
- A Supabase account (free tier works)

---

### Step 1 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the Supabase dashboard, go to **SQL Editor**
3. Copy the entire contents of `backend/src/utils/schema.sql` and run it
4. Go to **Project Settings > API** and copy:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

### Step 2 — Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
JWT_SECRET=your_random_secret_min_32_chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

Install dependencies and seed the database:
```bash
npm install
npm run seed
```

Start the backend:
```bash
npm run dev      # development (nodemon)
npm start        # production
```

Backend runs on: `http://localhost:5000`

Default admin credentials (created by seed):
- Email: `admin@samriddhi.com`
- Password: `Admin@123`

---

### Step 3 — Frontend Setup

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Install and start:
```bash
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## Project Structure

```
MLM/
├── backend/
│   ├── src/
│   │   ├── config/supabase.js
│   │   ├── controllers/         (8 controllers)
│   │   ├── middleware/           (auth, adminAuth, errorHandler)
│   │   ├── routes/               (8 route files)
│   │   ├── services/             (5 business logic services)
│   │   └── utils/               (jwt, cronJobs, seed, schema.sql)
│   └── server.js
└── frontend/
    └── src/
        ├── components/           (layout, dashboard, tree, ui)
        ├── context/              (AuthContext, AppContext)
        ├── pages/                (9 user pages + 9 admin pages)
        └── services/api.js
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register with sponsor code |
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/auth/me | Get current user |

### User
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/user/dashboard | Dashboard stats |
| GET | /api/user/profile | User profile |

### Tree
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/tree/my | My binary tree |
| GET | /api/tree/referrals | My direct referrals |
| GET | /api/tree/:userId | Any user's tree |

### Wallet & Income
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/wallet | Balance + transactions |
| POST | /api/wallet/withdraw | Request withdrawal |
| GET | /api/wallet/withdrawals | My withdrawal history |
| GET | /api/wallet/income | Income logs |

### Payments (Razorpay)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/payments/create-order | No | Create order for registration (₹1,200) |
| POST | /api/payments/installment-order | Yes | Create order for a monthly installment |

### Installments
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/installments/my | My 16-month schedule |
| POST | /api/installments/pay | Confirm installment after Razorpay (body: `monthNumber`, `razorpay_*`) |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/products | List products (by tier) |
| GET | /api/products/my | My selected products |
| POST | /api/products/purchase | Select/purchase product |

### Rewards
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/rewards | My rewards + rank progress |
| GET | /api/rewards/ranks | My achieved ranks |

### Admin (all require admin JWT)
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/admin/stats | Dashboard stats |
| GET | /api/admin/users | All users |
| PATCH | /api/admin/users/:id/block | Block user |
| PATCH | /api/admin/users/:id/unblock | Unblock user |
| GET | /api/admin/products | All products |
| POST | /api/admin/products | Create product |
| GET | /api/admin/groups | All groups |
| POST | /api/admin/groups | Create group |
| GET | /api/admin/withdrawals | Pending withdrawals |
| PATCH | /api/admin/withdrawals/:id/approve | Approve withdrawal |
| PATCH | /api/admin/withdrawals/:id/reject | Reject withdrawal |
| POST | /api/admin/lucky-draw/:groupId | Run lucky draw |
| GET | /api/admin/lucky-draw/history | Draw history |
| GET | /api/admin/rewards/pending | Pending reward pickups |
| PATCH | /api/admin/rewards/:id/mark-collected | Mark reward collected |
| GET | /api/admin/income-logs | Global income monitor |

---

## Database Schema

15 tables in Supabase PostgreSQL:
`users`, `groups`, `tree_nodes`, `tree_edges`, `wallets`, `products`, `user_products`,
`transactions`, `income_logs`, `pairs`, `installments`, `reward_catalog`,
`lucky_draws`, `ranks`, `user_ranks`, `user_rewards`, `withdrawals`

Full schema: `backend/src/utils/schema.sql`

---

## Cron Jobs (auto-run by backend)

| Schedule | Job | Description |
|---|---|---|
| 1st of every month, midnight | Monthly Rank Income | Credits rank-based monthly income to eligible members (4-Star Gold+) |
| 11th of every month, midnight | Installment Check | Marks overdue installments as missed, cancels IDs after 4 consecutive misses |

---

## Business Rules

- Monthly installment: Rs.1,200 | Due: 1st–10th of each month
- Group size: 2,500 members | Duration: 16 months
- 4 consecutive missed installments → ID auto-cancelled
- 100% compliance required for any reward
- Rewards are products only — no cash equivalent
- Vehicles given as base models only
- Rewards released after 2nd installment received
- ID proof mandatory for reward collection
- Members cannot work with another MLM company
- Governed by Sale of Goods Act, 1930

---

## Deployment (Railway)

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Create new project → Deploy from GitHub
4. Add **Service 1** (backend folder):
   - Root: `backend/`
   - Start: `npm start`
   - Add all env vars from `.env`
5. Add **Service 2** (frontend folder):
   - Root: `frontend/`
   - Build: `npm run build`
   - Set `VITE_API_URL` to your backend Railway URL

---

## Contact

**Samriddhi Network**
- Phone: 9419185768
- Email: samriddhinetwork349@gmail.com
- Address: Opp. General Bus Stand, B.C. Road, Ground Floor, Jammu
