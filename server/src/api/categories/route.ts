import express from "express";
import dbConnect from "../../../lib/mongodb"; // adjust path if needed
import Category from "../../../models/Category"; // adjust path if needed

const router = express.Router();

// GET /api/categories
router.get("/", async (req, res) => {
  try {
    // await dbConnect();

    const includeInactive = req.query.includeInactive === "true";
    const query = includeInactive ? {} : { isActive: true };

    const categories = await Category.find(query)
      .populate("createdBy", "name email")
      .sort({ name: 1 });

    res.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/categories
router.post("/", async (req, res) => {
  try {
    await dbConnect();

    const userRole = req.headers["x-user-role"];

    // Only admins can create categories
    if (userRole !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { name, description, color, assignedTo, parent } = req.body;

    const category = await Category.create({
      name,
      description,
      color: color || "#3B82F6",
      assignedTo,
      parent,
    });

    const populatedCategory = await Category.findById(category._id)
      .populate("createdBy", "name email")
      .populate("parent", "name");

    res.json({
      message: "Category created successfully",
      category: populatedCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
