import express from "express";
import User from "../../../models/User";
import { hashPassword } from "../../../lib/auth";
// import dbConnect from "../../../lib/mongodb";

const router = express.Router();

// GET all users
router.get("/", async (req, res) => {
  try {
    // await dbConnect();

    const userRole = req.header("x-user-role");
    if (userRole !== "admin" && userRole !== "agent") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const role = (req.query.role as string) || "";

    const skip = (page - 1) * limit;

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } }
      ];
    }
    if (role) query.role = role;

    const [users, total] = await Promise.all([
      User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query)
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST create user
router.post("/", async (req, res) => {
  try {
    // await dbConnect();

    const userRole = req.header("x-user-role");
    if (userRole !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { name, email, password, role, department, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "end_user",
      department,
      phone
    });

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({ message: "User created successfully", user: userWithoutPassword });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
