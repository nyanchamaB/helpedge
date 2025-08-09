import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    console.log("Logout request received");

    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: "lax",
      path: "/",
    });

    console.log("Logout successful, cookie cleared");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
