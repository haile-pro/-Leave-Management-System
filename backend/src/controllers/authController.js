// authController.js
const User = require("../models/User");
const { hashPassword, comparePassword } = require("../utils/authUtils");
const { generateToken } = require("../utils/jwtUtils");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    console.log("Registering user with email:", email);

    const hashedPassword = await hashPassword(password);
    console.log("Hashed password:", hashedPassword);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    console.log("New user created:", newUser);

    const token = generateToken(newUser);
    console.log("Generated token:", token);

    res.status(201).json({ message: "User registered", token });
  } catch (error) {
    console.error("Error registering user:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);

    res.status(500).json({ error: "User registration failed", details: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Logging in user with email:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found with email:", email);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User found:", user);

    const isPasswordMatch = await comparePassword(password, user.password);
    if (!isPasswordMatch) {
      console.log("Invalid password for user:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("Password is valid for user:", email);

    const token = generateToken(user);
    console.log("Generated token:", token);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in user:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);

    res.status(500).json({ error: "Login failed", details: error.message });
  }
};