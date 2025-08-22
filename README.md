# Project Structure

```
client
├── .env.local
├── .gitignore
├── app
│   ├── auth
│   │   ├── login
│   │   │   └── page.tsx
│   │   └── register
│   │       └── page.tsx
│   ├── dashboard
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── tickets
│       └── [id]
│           └── page.tsx
├── components
│   ├── auth
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── layout
│   │   ├── Header.tsx
│   │   ├── Layout.tsx
│   │   └── Sidebar.tsx
│   └── ui
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── select.tsx
├── components.json
├── eslint.config.mjs
├── lib
│   └── utils.ts
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
└── tsconfig.json 
```


```
server
├── .env
├── .gitignore
├── lib
│   ├── auth.ts
│   ├── constants.ts
│   ├── db(backup).ts
│   ├── emailReader.ts
│   ├── mongodb.ts
│   └── validation.ts
├── middleware.ts
├── models
│   ├── Category.ts
│   ├── Ticket.ts
│   └── User.ts
├── package-lock.json
├── package.json
├── src
│   ├── api
│   │   ├── auth
│   │   │   ├── login
│   │   │   │   └── route.ts
│   │   │   ├── logout
│   │   │   │   └── route.ts
│   │   │   └── register
│   │   │       └── route.ts
│   │   ├── categories
│   │   │   └── route.ts
│   │   ├── cron
│   │   │   └── fetch-emails
│   │   │       └── route.ts
│   │   ├── dashboard
│   │   │   └── stats
│   │   │       └── route.ts
│   │   ├── tickets
│   │   │   ├── [id]
│   │   │   │   ├── assign
│   │   │   │   │   └── route.ts
│   │   │   │   ├── route.ts
│   │   │   │   └── status
│   │   │   │       └── route.ts
│   │   │   └── route.ts
│   │   └── users
│   │       ├── [id]
│   │       │   └── route.ts
│   │       └── route.ts
│   └── index.ts
└── tsconfig.json 
```


| Cron Pattern | Runs...               |
|--------------|-----------------------|
| */5 * * * *  | Every 5 minutes       |
| 0 * * * *    | Every hour on the hour|
| 0 9 * * *    | Every day at 9:00 AM  |
| 0 */2 * * *  | Every 2 hours         |



