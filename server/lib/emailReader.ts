import Imap from "imap";
import { simpleParser, ParsedMail } from "mailparser";
import { Readable } from "stream";
import dbConnect from "./mongodb";
import Ticket from "../models/Ticket";
import Category from "../models/Category";
import mongoose from "mongoose";

// System user ID: Replace with actual ObjectID of the system/bot user
// const SYSTEM_USER_ID = new mongoose.Types.ObjectId("");
const SYSTEM_USER_ID = new mongoose.Types.ObjectId("66b50f441776f53e0a2d234a"); //!verify this



// Wrap everything in a Promise to await when using
export async function readEmails() {
  return new Promise<void>((resolve, reject) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_HOST) {
      throw new Error("Missing required email environment variables");
    }

    const imap = new Imap({
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASS,
      host: process.env.EMAIL_HOST,
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }, //!disables TLS certificate validation, unsafe for production
    });

    const openInbox = (cb: (err: Error | null, box: Imap.Box) => void) => {
      imap.openBox("INBOX", false, cb);
    };



    imap.once("ready", () => {
      openInbox((err: Error | null, box: Imap.Box) => {
        if (err) {
          reject(err);
          return;
        }

        imap.search(["UNSEEN"], (err: Error | null, results: number[]) => {
          if (err) return reject(err);
          if (!results || results.length === 0) {
            console.log("No new emails");
            imap.end();
            return resolve();
          }

          const f = imap.fetch(results, { bodies: "" });

          f.on("message", (msg: Imap.ImapMessage, seqno: number) => {
            msg.on("body", async (stream: Readable) => {
              try {
                const parsed: ParsedMail = await simpleParser(stream);
                // await dbConnect(); // Hold on this for now (Still reading on the docs) its being called twic 1. from the index.ts and here

                // ✅ Ensure "General" category exists or create it
                let defaultCategory = await Category.findOne({ name: "General" });
                if (!defaultCategory) {
                  defaultCategory = await Category.create({
                    name: "General",
                    description: "Default category for unclassified tickets",
                    color: "#6B7280",
                    isActive: true,
                    createdBy: SYSTEM_USER_ID, // make sure this is a valid user ID in DB
                  });
                }

                const ticketNumber = `T-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

                await Ticket.create({
                  title: parsed.subject || "(No Subject)",
                  description: (parsed.text || "").slice(0, 5000),
                  customerEmail: parsed.from?.value?.[0]?.address || "unknown@example.com",
                  customerName: parsed.from?.value?.[0]?.name || undefined,
                  createdBy: SYSTEM_USER_ID,
                  source: "email",
                  status: "open",
                  priority: "medium",
                  category: defaultCategory._id,
                  ticketNumber,
                });

                console.log(`Ticket created for ${parsed.subject}`);
              } catch (error) {
                console.error(`Failed to create ticket, ${error}`);
              }
            });

          });

          f.once("error", (err: Error) => {
            console.error("❌ Fetch error:", err);
            reject(err);
          });
          f.once("end", () => {
            console.log("📥 All messages fetched.");
            imap.end();
            resolve();
          });
        });
      });
    });

    imap.once("error", (err: Error) => {
      console.error("❌ IMAP error:", err);
      reject(err);
    });

    imap.once("end", () => {
      console.log("📡 Connection to IMAP server closed.");
    });

    imap.connect();
  });
}