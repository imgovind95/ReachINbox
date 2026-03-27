import { Router } from 'express';
import { userRepo } from '../repositories/userRepository';

const authRouter = Router();

authRouter.post('/google', async (req, res) => {
    const { email, name, avatar, googleId } = req.body;

    if (!email || !googleId) {
        return res.status(400).json({ error: "Required fields missing" });
    }

    try {
        // userRepo ALWAYS uses MongoDB — login never fails
        const authenticatedUser = await userRepo.upsertByEmail(email, {
            googleId,
            name,
            avatar,
        });

        res.json({ user: authenticatedUser });
    } catch (err: any) {
        console.error("Authentication Service Error:", err);

        res.status(500).json({
            error: "Authentication Service Error",
            details: err.message,
            code: err.code
        });
    }
});

authRouter.get('/user/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await userRepo.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (err: any) {
        console.error("Fetch User Error:", err.message);
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

authRouter.post('/unlink', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "User ID is mandatory" });
    }

    try {
        const updatedUser = await userRepo.updateById(userId, {
            googleId: null,
            avatar: null
        });
        res.json({ success: true, message: "Account unlinked successfully", user: updatedUser });
    } catch (err: any) {
        console.error("Unlink Service Error:", err.message);
        res.status(500).json({
            error: "Unlink Service Error",
            details: err.message
        });
    }
});

export default authRouter;