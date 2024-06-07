const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../models/users');

exports.register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).send('Please fill all required fields');
        }

        const isAlreadyExist = await Users.findOne({ email });
        if (isAlreadyExist) {
            return res.status(400).send('User already exists');
        }

        const newUser = new Users({ fullName, email });
        bcryptjs.hash(password, 10, async (err, hashedPassword) => {
            newUser.set('password', hashedPassword);
            await newUser.save();
            return res.status(200).send('User registered successfully');
        });
    } catch (error) {
        console.log(error, 'Error');
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send('Please fill all required fields');
        }

        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(400).send('User email or password is incorrect');
        }

        const validateUser = await bcryptjs.compare(password, user.password);
        if (!validateUser) {
            return res.status(400).send('User email or password is incorrect');
        }

        const payload = { userId: user._id, email: user.email };
        const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'THIS_IS_A_JWT_SECRET_KEY';

        jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: 84600 }, async (err, token) => {
            await Users.updateOne({ _id: user._id }, { $set: { token } });
            return res.status(200).json({ user: { id: user._id, email: user.email, fullName: user.fullName }, token });
        });
    } catch (error) {
        console.log(error, 'Error');
    }
};
