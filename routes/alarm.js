const fetchuser = require('../Middlewares/fetchuser');
const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const JWT_SECRET = "AnShBaLaJiThAkUrIsAgOoDbOOY123123";
const router = express.Router();
const jwt = require('jsonwebtoken');
const Alarm = require('../Models/Alarm');

// ROUTE 1: Get All the Todos using: GET "/api/todos/fetchallalarms". Login required
router.get('/fetchallalarms', fetchuser, async (req, res) => {
    try
    {
        const alarms = await Alarm.find({ user: req.user.id });
        res.json(alarms);
    } catch (error)
    {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Route 2: Adding a Alarm using POST "api/alarm/addalarm". requires Login
router.post('/addalarm', fetchuser, [
    body('hour').isLength({ max: 2 }),
    body('min').isLength({ max: 2 }),
    body('sec').isLength({ max: 2 }),
], async (req, res) => {
    try
    {
        const { hour, min, sec } = req.body;

        // If there are errors, return Bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            return res.status(400).json({ errors: errors.array() });
        }

        const alarm = new Alarm({
            hour, min, sec, user: req.user.id
        });
        const savedAlarm = await alarm.save();

        res.json(`${ hour }:${ min }:${ sec }`);
    } catch (error)
    {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Route 2: Updating an existing Alarm using PUT "api/alarm/updatealarm". requires Login

module.exports = router;
