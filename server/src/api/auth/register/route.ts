import express from "express";
import dbConnect from "../../../../lib/mongodb";
import User from "../../../../models/User";
import { hashPassword, generateToken } from "../../../../lib/auth";
import { registerSchema } from "../../../../lib/validation";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    await dbConnect();
    const body = req.body;
    console.log("Registration attempt for:", body.email);

    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid input data",
        details: validation.error.issues, // ✅ use .issues instead of .errors
      });
    }

    const { name, email, password, role } = validation.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });
    await user.save();
    console.log("User created successfully:", email);

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
