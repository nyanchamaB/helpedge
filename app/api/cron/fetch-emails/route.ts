import { NextResponse } from "next/server";
import { readEmails } from "@/lib/emailReader";

export async function GET() {
  try {
    await readEmails();
    return NextResponse.json({ message: "Fetched emails." });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching emails" }, { status: 500 });
  }
}
