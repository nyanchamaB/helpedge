import Imap from "imap";
import { simpleParser } from "mailparser";
import { connectToDB } from "./db";
import Ticket from "@/models/Ticket";

export async function readEmails() {
  const imap = new Imap({
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: process.env.EMAIL_HOST,
    port: 993,
    tls: true,
  });

  const openInbox = (cb: any) => {
    imap.openBox("INBOX", false, cb);
  };

  imap.once("ready", function () {
    openInbox(async function (err: any, box: any) {
      if (err) throw err;

      imap.search(["UNSEEN"], function (err, results) {
        if (!results || results.length === 0) {
          console.log("No new emails.");
          imap.end();
          return;
        }

        const f = imap.fetch(results, { bodies: "" });

        f.on("message", function (msg) {
          msg.on("body", async function (stream) {
            const parsed = await simpleParser(stream);
            await connectToDB();
            await Ticket.create({
              subject: parsed.subject,
              body: parsed.text,
              sender: parsed.from?.text,
            });
            console.log("Ticket created for:", parsed.subject);
          });
        });

        f.once("end", function () {
          imap.end();
        });
      });
    });
  });

  imap.once("error", function (err) {
    console.error(err);
  });

  imap.connect();
}
