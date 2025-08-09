helpedge
├── client                # Frontend (Next.js App Router UI)
│   ├── app
│   │   ├── auth
│   │   │   ├── login
│   │   │   │   └── page.tsx
│   │   │   └── register
│   │   │       └── page.tsx
│   │   ├── dashboard
│   │   │   ├── page.tsx
│   │   │   └── stats
│   │   │       └── route.ts          # If this is client-side stats fetching, keep here
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── tickets
│   │       └── page.tsx
│   ├── components
│   │   ├── auth
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── layout
│   │   │   ├── Header.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ui
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       └── select.tsx
│   ├── public
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   ├── middleware.ts       # Only if you have frontend route protection logic
│   ├── components.json
│   ├── tsconfig.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.ts
│   └── .env.local          # If frontend needs public env vars (NEXT_PUBLIC_*)
│
├── server                # Backend (API + DB + Models)
│   ├── app                # API routes stay here
│   │   ├── api
│   │   │   ├── auth
│   │   │   │   ├── login
│   │   │   │   │   └── route.ts
│   │   │   │   ├── logout
│   │   │   │   │   └── route.ts
│   │   │   │   └── register
│   │   │   │       └── route.ts
│   │   │   ├── categories
│   │   │   │   └── route.ts
│   │   │   ├── cron
│   │   │   │   └── fetch-emails
│   │   │   │       └── route.ts
│   │   │   ├── tickets
│   │   │   │   ├── assign
│   │   │   │   │   └── route.ts
│   │   │   │   ├── status
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   └── users
│   │   │       ├── route.ts
│   │   │       └── ...
│   │   └── middleware.ts   # If backend uses separate middleware
│   ├── lib
│   │   ├── auth.ts
│   │   ├── constants.ts
│   │   ├── emailReader.ts
│   │   ├── mongodb.ts
│   │   ├── utils.ts
│   │   └── validation.ts
│   ├── models
│   │   ├── Category.ts
│   │   ├── User.ts
│   │   └── ticket.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.local          # Sensitive backend env vars
│   └── README.md
│
├── shared                 # (Optional) Shared code between client & server
│   ├── types
│   │   ├── ticket.ts
│   │   └── user.ts
│   └── utils
│       └── formatDate.ts
│
├── README.md
├── .gitignore
└── package.json           # Root config for workspaces

| Cron Pattern | Runs...               |
|--------------|-----------------------|
| */5 * * * *  | Every 5 minutes       |
| 0 * * * *    | Every hour on the hour|
| 0 9 * * *    | Every day at 9:00 AM  |
| 0 */2 * * *  | Every 2 hours         |
