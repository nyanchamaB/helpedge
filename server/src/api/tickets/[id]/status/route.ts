import express, { type Request, type Response } from "express";
import dbConnect from "../../../../../lib/mongodb";
import Ticket from "../../../../../models/Ticket";

const router = express.Router();

router.put("/:id/status", async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { id } = req.params;

    const userRole = req.headers["x-user-role"] as string;
    const currentUserId = req.headers["x-user-id"] as string;

    const { status, resolution } = req.body;

    const validStatuses = ["open", "in_progress", "pending", "resolved", "closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const canUpdate =
      userRole === "admin" ||
      (userRole === "agent" && ticket.assignedTo?.toString() === currentUserId) ||
      (userRole === "end_user" && ticket.requester.toString() === currentUserId);

    if (!canUpdate) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updateData: any = { status, updatedAt: new Date() };

    if (status === "resolved") {
      updateData.resolvedAt = new Date();
      if (resolution) updateData.resolution = resolution;
    } else if (status === "closed") {
      updateData.closedAt = new Date();
      if (!ticket.resolvedAt) updateData.resolvedAt = new Date();
      if (resolution) updateData.resolution = resolution;
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(id, updateData, { new: true })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("category", "name color");

    res.json({ message: "Ticket status updated successfully", ticket: updatedTicket });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
