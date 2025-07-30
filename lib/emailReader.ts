import Imap from "imap";
import { simpleParser } from "mailparser";
import dbConnect from "./mongodb";
import Ticket from "@/models/Ticket";

// Wrap everything in a Promise to await when using
export async function readEmails() {
  return new Promise<void>((resolve, reject) => {
    const imap = new Imap({
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASS,
      host: process.env.EMAIL_HOST,
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }, //!disables TLS certificate validation unsafe for production
    });

    const openInbox = (cb: (err: any, box: Imap.Box) => void) => {
      imap.openBox("INBOX", false, cb);
    };

    // imap.once("ready", function () {
    //   openInbox(async function (err: any, box: any) {
    //     if (err) throw err;

    imap.once("ready", () => {
      openInbox((err, box) => {
        if (err) {
          reject(err);
          return;
        }

        // imap.search(["UNSEEN"], function (err, results) {
        //   if (!results || results.length === 0) {
        //     console.log("No new emails.");
        //     imap.end();
        //     return;
        //   }

        imap.search(["UNSEEN"], (err, results) => {
          if (err) {
            reject(err);
            return;
          }

          if (!results || results.length === 0) {
            console.log("📭 No new emails.");
            imap.end();
            resolve();
            return;
          }

          const f = imap.fetch(results, { bodies: "" });

          // f.on("message", function (msg) {
          //   msg.on("body", async function (stream) {
          //     const parsed = await simpleParser(stream);
          //     await connectToDB();
          //     await Ticket.create({
          //       subject: parsed.subject,
          //       body: parsed.text,
          //       sender: parsed.from?.text,
          //     });
          //     console.log("Ticket created for:", parsed.subject);
          //   });
          // });

          f.on("message", (msg, seqno) => {
            msg.on("body", async (stream) => {
              try {
                const parsed = await simpleParser(stream);
                await dbConnect();
                await Ticket.create({
                  subject: parsed.subject || "(No Subject)",
                  body: parsed.text || "",
                  sender: parsed.from?.text || "Unknown Sender",
                  source: "email",
                  status: "open",
                  priority: "normal",
                  createdAt: parsed.date || new Date(),
                });
                console.log(`✅ Ticket created for: ${parsed.subject}`);
              } catch (error) {
                console.error("❌ Failed to create ticket:", error);
              }
            });
          });

          f.once("error", (err) => {
            console.error("❌ Fetch error:", err);
            reject(err);
          });

          // f.once("end", function () {
          //   imap.end();

          f.once("end", () => {
            console.log("📥 All messages fetched.");
            imap.end();
            resolve();
          });
        });
      });
    });

    // imap.once("error", function (err) {
    //   console.error(err);
    // });


    imap.once("error", (err) => {
      console.error("❌ IMAP error:", err);
      reject(err);
    });

    imap.once("end", () => {
      console.log("📡 Connection to IMAP server closed.");
    });

    imap.connect();
  });
}