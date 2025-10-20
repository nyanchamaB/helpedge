import express, { type Request, type Response } from "express";
import dbConnect from "../../../../../lib/mongodb";
import Ticket from "../../../../../models/Ticket";
import User from "../../../../../models/User";

const router = express.Router();

router.put("/:id/assign", async (req: Request, res: Response) => {
  try {
    // await dbConnect();
    const { id } = req.params;
    const userRole = req.headers["x-user-role"] as string;

    if (userRole !== "agent" && userRole !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { assignedTo } = req.body;

    if (assignedTo) {
      const assignee = await User.findById(assignedTo);
      if (!assignee || (assignee.role !== "agent" && assignee.role !== "admin")) {
        return res.status(400).json({ error: "Invalid assignee" });
      }
    }

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      {
        assignedTo: assignedTo || null,
        status: assignedTo ? "in_progress" : "open",
        updatedAt: new Date()
      },
      { new: true }
    )
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("category", "name color");

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json({ message: "Ticket assigned successfully", ticket });
  } catch (error) {
    console.error("Error assigning ticket:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
