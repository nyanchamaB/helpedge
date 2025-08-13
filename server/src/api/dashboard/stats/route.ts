import express from "express";
import dbConnect from "../../../../lib/mongodb";
import Ticket from "../../../../models/Ticket.js";
import User from "../../../../models/User.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // await dbConnect();

    const userRole = req.header("x-user-role");
    const currentUserId = req.header("x-user-id");

    let baseQuery: any = {};
    if (userRole === "end_user") {
      baseQuery.requester = currentUserId;
    } else if (userRole === "agent") {
      baseQuery.$or = [
        { assignedTo: currentUserId },
        { assignedTo: { $exists: false } },
        { assignedTo: null }
      ];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalTickets,
      openTickets,
      pendingTickets,
      resolvedToday,
      slaBreached,
      recentTickets
    ] = await Promise.all([
      Ticket.countDocuments(baseQuery),
      Ticket.countDocuments({ ...baseQuery, status: "open" }),
      Ticket.countDocuments({ ...baseQuery, status: "pending" }),
      Ticket.countDocuments({
        ...baseQuery,
        status: "resolved",
        resolvedAt: { $gte: today, $lt: tomorrow }
      }),
      Ticket.countDocuments({ ...baseQuery, slaBreached: true }),
      Ticket.find(baseQuery)
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email")
        .populate("category", "name color")
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const avgResponseTime = "2.3 hours"; // placeholder for real calculation

    const slaAlerts = await Ticket.find({
      ...baseQuery,
      status: { $in: ["open", "in_progress"] },
      dueDate: { $lte: new Date(Date.now() + 4 * 60 * 60 * 1000) }
    })
      .populate("createdBy", "name email")
      .sort({ dueDate: 1 })
      .limit(10);

    res.json({
      stats: {
        totalTickets,
        openTickets,
        pendingTickets,
        resolvedToday,
        slaBreached,
        avgResponseTime
      },
      recentTickets,
      slaAlerts: slaAlerts.map(ticket => ({
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        priority: ticket.priority,
        timeRemaining: ticket.dueDate
          ? Math.max(0, Math.floor((ticket.dueDate.getTime() - Date.now()) / (1000 * 60))) + " minutes"
          : "No SLA"
      }))
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
