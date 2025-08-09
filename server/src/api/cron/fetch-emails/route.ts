import express from "express";
import { readEmails } from "../../../../lib/emailReader";

const router = express.Router();

// GET /api/cron/fetch-emails
router.get("/", async (_req, res) => {
  try {
    await readEmails();
    res.json({ success: true, message: "Emails processed." });
  } catch (error: any) {
    console.error("Error processing emails:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

export default router;
