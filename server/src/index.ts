import express from "express";
import cron from "node-cron";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from 'http';
import ngrok from '@ngrok/ngrok';

// Mail reader import
import { readEmails } from "../lib/emailReader";

// Import routes
import registerRoute from "./api/auth/register/route";
import loginRoute from "./api/auth/login/route";
import logoutRoute from "./api/auth/logout/route";

import ticketsRoute from "./api/tickets/route";
import ticketByIdRoute from "./api/tickets/[id]/route";
import ticketStatusRoute from "./api/tickets/[id]/status/route";
import ticketAssignRoute from "./api/tickets/[id]/assign/route";

import categoriesRoute from "./api/categories/route";

import fetchEmailsRoute from "./api/cron/fetch-emails/route";

import dashboardStatsRoute from "./api/dashboard/stats/route";

import usersRoute from "./api/users/route";
import userByIdRoute from "./api/users/[id]/route";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (_req, res) => {
  res.json({ message: "HelpEdge API running" });
});

// Cron job: runs every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("📧 Cron job started: Checking emails...");
  try {
    await readEmails();
    console.log("✅ Email check completed");
  } catch (error) {
    console.error("❌ Email check failed:", error);
  }
});

//Auth
app.use("/api/auth/register", registerRoute);
app.use("/api/auth/login", loginRoute);
app.use("/api/auth/logout", logoutRoute);

// Users
app.use("/api/users", usersRoute); // GET all, POST create
app.use("/api/users", userByIdRoute); // GET/PUT/DELETE by ID

// Tickets
app.use("/api/tickets", ticketsRoute);               // GET all tickets, POST create ticket
app.use("/api/tickets", ticketByIdRoute);             // GET by ID
app.use("/api/tickets", ticketStatusRoute);           // PUT status update
app.use("/api/tickets", ticketAssignRoute);           // PUT assign ticket

// Categories
app.use("/api/categories", categoriesRoute);

// Cron / Email
app.use("/api/cron/fetch-emails", fetchEmailsRoute);

//Dashboard Stats
app.use("/api/dashboard/stats", dashboardStatsRoute);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set in environment variables");
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Create webserver
http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('Congrats you have created an ngrok web server');
}).listen(8080, () => console.log('Node.js web server at 8080 is running...'));

// Get your endpoint online
ngrok.connect({ addr: 8080, authtoken_from_env: true })
  .then(listener => console.log(`Ingress established at: ${listener.url()}`));