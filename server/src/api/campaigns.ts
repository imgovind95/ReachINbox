
import { Router } from 'express';
import { campaignController } from '../controllers/campaignController';

const router = Router();

// Map routes to controller methods
router.post('/', campaignController.schedule.bind(campaignController));
router.get('/:userId', campaignController.listUserCampaigns.bind(campaignController));
router.get('/job/:id', campaignController.getDetails.bind(campaignController));

// Inbox route (simulated)
router.get('/inbox/:email', campaignController.getInbox.bind(campaignController));

export default router;
