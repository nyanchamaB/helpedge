# HELPEDGE

helpedge/
├── app/                      # Next.js 14+ App Router structure
│   └── dashboard/            # Tickets dashboard
│   └── ticket/[id]/          # Ticket details & status
├── lib/
│   └── emailReader.ts        # IMAP + mailparser
│   └── db.ts                 # MongoDB connection
├── models/
│   └── ticket.ts             # Ticket schema
│   └── user.ts               # User schema
├── auth/
│   └── [...nextauth].ts      # Role-based login
├── components/
│   └── TicketCard.tsx        # Ticket display component
├── public/
├── .env.local
└── README.md
