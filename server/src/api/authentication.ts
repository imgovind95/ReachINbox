import { Router } from 'express';
import { prisma } from '../config/db';

const authRouter = Router();

authRouter.post('/google', async (req, res) => {
    const { email, name, avatar, googleId } = req.body;

    if (!email || !googleId) {
        return res.status(400).json({ error: "Required fields missing" });
    }

    try {
        const userPayload: any = { googleId };
        if (name) userPayload.name = name;
        if (avatar) userPayload.avatar = avatar;

        const authenticatedUser = await prisma.user.upsert({
            where: { email },
            update: userPayload,
            create: {
                email,
                name: name || email.split('@')[0],
                avatar,
                googleId
            }
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

authRouter.post('/unlink', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "User ID is mandatory" });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                googleId: null,
                avatar: null
            }
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