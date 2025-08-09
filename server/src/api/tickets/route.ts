import express, { type Request, type Response } from "express";
import dbConnect from "../../../lib/mongodb";
import Ticket from "../../../models/Ticket";

const router = express.Router();

// GET all tickets (with filters + pagination)
router.get("/", async (req: Request, res: Response) => {
  try {
    await dbConnect();

    const userRole = req.headers["x-user-role"] as string;
    const currentUserId = req.headers["x-user-id"] as string;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const status = (req.query.status as string) || "";
    const priority = (req.query.priority as string) || "";
    const assignedTo = (req.query.assignedTo as string) || "";
    const category = (req.query.category as string) || "";

    const skip = (page - 1) * limit;

    let query: any = {};

    if (userRole === "end_user") {
      query.requester = currentUserId;
    } else if (userRole === "agent") {
      query.$or = [
        { assignedTo: currentUserId },
        { assignedTo: { $exists: false } },
        { assignedTo: null }
      ];
    }

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { subject: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { ticketNumber: { $regex: search, $options: "i" } }
        ]
      });
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (category) query.category = category;

    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email")
        .populate("category", "name color")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Ticket.countDocuments(query)
    ]);

    const normalizedTickets = tickets.map(ticket => {
      const obj = ticket.toObject();
      return { ...obj, createdAt: obj.createdAt || obj.date || new Date() };
    });

    res.json({
      tickets: normalizedTickets,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST create ticket
router.post("/", async (req: Request, res: Response) => {
  try {
    await dbConnect();

    const currentUserId = req.headers["x-user-id"] as string;
    const userRole = req.headers["x-user-role"] as string;

    const { subject, description, priority, category, assignedTo } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ error: "Subject and description are required" });
    }

    const ticketData: any = {
      subject,
      description,
      priority: priority || "medium",
      requester: currentUserId,
      source: "web"
    };

    if (category) ticketData.category = category;

    if ((userRole === "agent" || userRole === "admin") && assignedTo) {
      ticketData.assignedTo = assignedTo;
    }

    const ticket = await Ticket.create(ticketData);

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("requester", "name email")
      .populate("assignedTo", "name email")
      .populate("category", "name color");

    res.json({ message: "Ticket created successfully", ticket: populatedTicket });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
