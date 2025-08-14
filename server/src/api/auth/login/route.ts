import express from "express";
import dbConnect from "../../../../lib/mongodb";
import User from "../../../../models/User";
import { verifyPassword, generateToken } from "../../../../lib/auth";
import { loginSchema } from "../../../../lib/validation";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    // await dbConnect();
    const body = req.body;
    console.log("Login attempt for:", body.email);

    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid input data",
        details: validation.error.issues, // ✅ fixed
      });
    }

    const { email, password } = validation.data;


    // Find user by email
    const user = await User.findOne({ email, isActive: true }).select("+password");
    if (!user || !user.password) { // ✅ extra check
      console.log("User not found or missing password:", email);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password); // ✅ safe now
    if (!isValidPassword) {
      console.log("Invalid password for user:", email);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    console.log("Token generated, setting cookie...");

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    console.log("Cookie set successfully");
    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
