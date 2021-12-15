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
    try {
        const alarms = await Alarm.find({ user: req.user.id });
        res.json(alarms);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Route 2: Adding a Alarm using POST "api/alarm/addalarm". requires Login
router.post('/addalarm', fetchuser, [
    body('hour').isLength({ max: 2 }),
    body('min').isLength({ max: 2 }),
    body('sec').isLength({ max: 2 }),
    body('frequency').isLength({ min: 2 }),
], async (req, res) => {
    try {
        const { hour, min, sec, frequency } = req.body;
        let seconds = sec;
        let minutes = min;
        let hours = hour;

        // Checking of the seconds are more than 60
        if (seconds >= 60) {
            while (seconds % 60 == 0) {
                let i = seconds / 60;
                for (let index = i; index < i; index++) {
                    min += 60;
                }
                seconds = 0;
                break;
            }
            while (!(seconds % 60 == 0)) {
                let i = Math.floor(seconds / 60);
                for (let index = i; index < i; index++) {
                    min += 60;
                }
                seconds = seconds - (60 * i);
                break;
            }
        }

        // If there are errors, return Bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const alarm = new Alarm({
            frequency, hour, min, seconds, user: req.user.id
        });
        const savedAlarm = await alarm.save();

        res.json(`${ frequency },${ hour }:${ min }:${ seconds }`);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Route 3: Updating an existing Alarm using PUT "api/alarm/updatealarm". requires Login
router.put('/updatealarm/:id', fetchuser, async (req, res) => {
    const { frequency, hour, min, sec } = req.body;

    try {
        // Create a newTodo object
        const newAlarm = {};
        if (frequency) { newAlarm.frequency = frequency; };
        if (hour) { newAlarm.hour = hour; };
        if (min) { newAlarm.min = min; };
        if (sec) { newAlarm.sec = sec; };

        // Find the note to be updated and update it
        let alarm = await Alarm.findById(req.params.id);
        if (!alarm) { return res.status(404).send("Not Found"); }

        if (alarm.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        alarm = await Alarm.findByIdAndUpdate(req.params.id, { $set: newAlarm }, { new: true });
        res.json({ alarm });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 4: Delete an existing Alarm using: DELETE "/api/notes/deletealarm". Login required
router.delete('/deletealarm/:id', fetchuser, async (req, res) => {
    try {
        // Find the note to be delete and delete it
        let alarm = await Alarm.findById(req.params.id);
        if (!alarm) { return res.status(404).send("Not Found"); }

        // Allow deletion only if user owns this Todo
        if (alarm.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        alarm = await Alarm.findByIdAndDelete(req.params.id);
        res.json({ "Success": "Alarm has been deleted", alarm: alarm });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
