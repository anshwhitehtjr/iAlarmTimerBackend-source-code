const fetchuser = require('../Middlewares/fetchuser');
const express = require('express');
const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const JWT_SECRET = "AnShBaLaJiThAkUrIsAgOoDbOOY123123";
const router = express.Router();
const jwt = require('jsonwebtoken');

// Route 1: Creating a User using POST "api/auth/createuser". Doesn't require Login
router.post('/createuser', [
    body('name').isLength({ min: 3 }),
    body('email').isEmail(),
    body('password').isLength({ min: 5 })
], async (req, res) => {
    // error handling
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        return res.status(400).json({ error: errors.array() });
    }

    // Handling User Creation and error handling respective to the user
    try
    {
        // checking if the user with the email already exists
        let user = await User.findOne({ email: req.body.email });
        if (user)
        {
            return res.status(400).json({ error: "Sorry a user with this email already exists" });
        }

        // securing password using salt, pepper and password hashing and also using (npm i bcryptjs) as friend
        const salt = await bcrypt.genSalt(10);
        secPass = await bcrypt.hash(req.body.password, salt);

        // creating a user
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
        });

        // Working with jsonwebtoken so that the user doesn't have to login repeatedly
        const data = {
            id: user._id,
        };

        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({ authtoken });

    } catch (error)
    {
        console.error(error.message);
        res.status(500).send("Internal Server Error Occurred");
    }
});

// ROUTE 2: Authenticate a User using: POST "/api/auth/login". Doesn't require login
router.post('/login', [
    body('email').isEmail(),
    body('password').exists(),
], async (req, res) => {
    let success = false;

    //#region Error handling
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        return res.status(400).json({ error: error.array() });
    }
    //#endregion

    //#region Handling User Authentication
    const { email, password } = req.body;

    try
    {
        // if email is wrong
        let user = await User.findOne({ email });
        if (!user)
        {
            success = false;
            return res.status(400).send("Please try to login with correct credentials");
        }

        // if the password is wrong
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare)
        {
            success = false;
            return res.status(400).send(success, "Please try to login with correct credentials");
        }

        const data = {
            user: {
                id: user.id
            }
        };

        const AUTH_TOKEN = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, AUTH_TOKEN });

    } catch (error)
    {
        success = false;
        console.error(error.message);
        res.status(500).send("Internal Server Error Occurred");
    }

});

// ROUTE 3: Get loggedin User Details using: POST "/api/auth/getuser". Login required
router.post('/getuser', fetchuser, async (req, res) => {
    try
    {
        let userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error)
    {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
