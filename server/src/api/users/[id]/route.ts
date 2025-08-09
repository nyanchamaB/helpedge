import express from "express";
import User from "../../../../models/User";
import { hashPassword } from "../../../../lib/auth";
import dbConnect from "../../../../lib/mongodb";

const router = express.Router();

// GET user by ID
router.get("/:id", async (req, res) => {
  try {
    await dbConnect();
    const { id } = req.params;

    const userRole = req.header("x-user-role");
    const currentUserId = req.header("x-user-id");

    if (userRole !== "admin" && userRole !== "agent" && currentUserId !== id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT update user
router.put("/:id", async (req, res) => {
  try {
    await dbConnect();
    const { id } = req.params;

    const userRole = req.header("x-user-role");
    const currentUserId = req.header("x-user-id");

    if (userRole !== "admin" && currentUserId !== id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updateData: any = {};
    const allowedFields = ["name", "department", "phone", "preferences"];
    const adminOnlyFields = ["role", "isActive"];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    }
    if (userRole === "admin") {
      for (const field of adminOnlyFields) {
        if (req.body[field] !== undefined) updateData[field] = req.body[field];
      }
    }
    if (req.body.password) {
      updateData.password = await hashPassword(req.body.password);
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE user
router.delete("/:id", async (req, res) => {
  try {
    await dbConnect();
    const { id } = req.params;

    const userRole = req.header("x-user-role");
    if (userRole !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;