import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from 'bcryptjs';

export const test = (req, res) => {
    res.json({
        message: 'API working'
    });
};

export const updateUser = async (req, res, next) => {
    try {
        // Check if the authenticated user is trying to update their own account
        if (req.user.id !== req.params.id) {
            return next(errorHandler(403, 'You can\'t update this account'));
        }

        // Check if a password is provided and hash it
        if (req.body.password) {
            req.body.password = bcryptjs.hashSync(req.body.password, 10);
        }

        // Update the user's information
        const updateUser = await User.findByIdAndUpdate(req.params.id, {
            $set: {
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                avatar: req.body.avatar
            }
        }, { new: true });

        const { password, ...rest } = updateUser._doc

        res.status(200).json(rest)

    } catch (error) {
        next(error);
    }
};
