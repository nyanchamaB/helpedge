import express, { type Request, type Response } from "express";
import dbConnect from "../../../../lib/mongodb";
import Ticket from "../../../../models/Ticket";

const router = express.Router();

// GET ticket by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ message: "Error fetching ticket" });
  }
});

export default router;
