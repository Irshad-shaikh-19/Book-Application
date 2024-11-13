const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./userAuth");

// Sign up
router.post("/sign-up", async (req, res) => {
  try {
    const { username, email, password, address } = req.body;

    // Check username length is more than 3
    if (username.length < 4) {
      return res
        .status(400)
        .json({ message: "Username length should be greater than 3" });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username: username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check password's length
    if (password.length <= 5) {
      return res
        .status(400)
        .json({ message: "Password should be greater than 5" });
    }

    const hashPass = await bcrypt.hash(password, 10);

    // Finally, create user
    const newUser = new User({
      username: username,
      email: email,
      password: hashPass,
      address: address,
    });

    await newUser.save();
    return res.status(201).json({ message: "SignUp Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Sign in
router.post("/sign-in", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Step 1: Find the user by username
    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      return res.status(400).json({ message: "Invalid Credentials" }); 
    }

    // Step 2: Compare the provided password with the stored hashed password
    bcrypt.compare(password, existingUser.password, (err, data) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (data) {
        const authClaims = [
          { name: existingUser.username },
          { role: existingUser.role },
        ];
        const token = jwt.sign({ authClaims }, "bookapp123", {
          expiresIn: "30d",
        });
        return res
          .status(200)
          .json({ id: existingUser.id, role: existingUser.role, token: token });
      } else {
        return res.status(400).json({ message: "Invalid Credentials" });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Get User Information
router.get("/get-user-information", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const data = await User.findById(id).select("-password");
    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

//update address

router.put("/update-address", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const { address } = req.body;
    await User.findByIdAndUpdate(id, { address: address });
    return res.status(200).json({ message: "Address updated sucsessfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Serveral Error" });
  }
});

module.exports = router;

