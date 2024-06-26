const {User} = require("../models/user");
const express = require("express");
const {Category} = require("../models/category");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {Product} = require("../models/product");

router.get(`/`, async (req, res) => {
    const userList = await User.find().select('-passwordHash');

    if (!userList) {
        res.status(500).json({success: false});
    }
    res.send(userList);
});

router.get("/:id", async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
        res
            .status(500)
            .json({message: "The user with the given ID was not found"});
    }
    res.status(200).send(user);
});

router.post("/", async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
    });

    user = await user.save();

    if (!user) {
        return res.status(404).send("the user can not be created!");
    }

    res.send(user);
});

router.post('/login', async (req, res) => {
    const user = await User.findOne(
        {
            email: req.body.email
        }
    );
    const secret = process.env.secret;

    if (!user) {
        return res.status(400).send('The user not found!');
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign({
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            {expiresIn: '1d'}
        )

        return res.status(200).send({user: user.email, token: token});
    } else {
        return res.status(400).send('password is wrong!');
    }


});
router.get(`/get/count`, async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        res.send({
            userCount: userCount
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete("/:id", (req, res) => {
    User.findOneAndDelete({ _id: req.params.id })
        .then((user) => {
            if (user) {
                return res.status(200).json({
                    success: true,
                    message: "The user is deleted!",
                });
            } else {
                return res
                    .status(404)
                    .json({ success: false, message: "user not found!" });
            }
        })
        .catch((err) => {
            return res.status(400).json({
                success: false,
                error: err.message,
            });
        });
});

module.exports = router;
