const express       = require('express');
const router        = express.Router();
const bcrypt        = require('bcrypt');
const jwt           = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User          = require('../models/user');
const validate      = require('../middleware/validate');
const authenticate  = require('../middleware/authenticate');

// POST /api/auth/register
router.post(
    '/register',
    validate('user'),
    async (req, res) => {
        try {
            const { email, name, password } = req.body;
            const existing = await User.findOne({ email });
            if (existing) {
                return res
                    .status(400)
                    .json({ message: 'User already exists' });
            }

            // PASS password in plain text, pre('save') hook will hash it
            const user = new User({ email, name, password });
            await user.save();

            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            return res.status(201).json({ token });
        } catch (err) {
            console.error('Register error:', err);
            return res
                .status(500)
                .json({ message: 'Server error' });
        }
    }
);

// POST /api/auth/login
router.post(
    '/login',
    validate('login'),
    async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                return res
                    .status(400)
                    .json({ message: 'Invalid credentials' });
            }

            const match = await bcrypt.compare(
                password,
                user.password
            );
            if (!match) {
                return res
                    .status(400)
                    .json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            return res.status(200).json({ token });
        } catch (err) {
            console.error('Login error:', err);
            return res
                .status(500)
                .json({ message: 'Server error' });
        }
    }
);

// POST /api/auth/google
router.post(
    '/google',
    validate('google'),
    async (req, res) => {
        try {
            const { credential } = req.body;
            const client = new OAuth2Client(
                process.env.GOOGLE_CLIENT_ID
            );
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            const payload = ticket.getPayload();
            const { email, name } = payload;

            let user = await User.findOne({ email });
            if (!user) {
                user = new User({ email, name, password: '' });
                await user.save();
            }

            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            return res.status(200).json({ token });
        } catch (err) {
            console.error('Google auth error:', err);
            return res
                .status(401)
                .json({ message: 'Google auth failed' });
        }
    }
);

// GET /api/auth/ (protected)
router.get(
    '/',
    authenticate,
    async (req, res) => {
        try {
            const users = await User.find().select('-password');
            return res.status(200).json(users);
        } catch (err) {
            console.error('List users error:', err);
            return res
                .status(500)
                .json({ message: 'Server error' });
        }
    }
);

// GET /api/auth/:id (protected)
router.get(
    '/:id',
    authenticate,
    async (req, res) => {
        try {
            const user = await User.findById(req.params.id).select('-password');
            if (!user) {
                return res
                    .status(404)
                    .json({ message: 'User not found' });
            }
            return res.status(200).json(user);
        } catch (err) {
            console.error('Get user error:', err);
            return res
                .status(500)
                .json({ message: 'Server error' });
        }
    }
);

// PUT /api/auth/:id (protected)
router.put(
    '/:id',
    authenticate,
    async (req, res) => {
        try {
            const { email, name, password } = req.body;
            const update = {};
            if (email) update.email = email;
            if (name)  update.name  = name;
            if (password) {
                // hash manually on update since pre('save') doesn't run on findByIdAndUpdate
                update.password = await bcrypt.hash(password, 10);
            }

            const user = await User.findByIdAndUpdate(
                req.params.id,
                { $set: update },
                { new: true, runValidators: true }
            ).select('-password');

            if (!user) {
                return res
                    .status(404)
                    .json({ message: 'User not found' });
            }
            return res.status(200).json(user);
        } catch (err) {
            console.error('Update user error:', err);
            return res
                .status(500)
                .json({ message: 'Server error' });
        }
    }
);

// DELETE /api/auth/:id (protected)
router.delete(
    '/:id',
    authenticate,
    async (req, res) => {
        try {
            const user = await User.findByIdAndDelete(req.params.id).select('-password');
            if (!user) {
                return res
                    .status(404)
                    .json({ message: 'User not found' });
            }
            return res
                .status(200)
                .json({
                    message: 'User deleted successfully',
                    user
                });
        } catch (err) {
            console.error('Delete user error:', err);
            return res
                .status(500)
                .json({ message: 'Server error' });
        }
    }
);

module.exports = router;
