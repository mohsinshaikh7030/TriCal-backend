import { Router } from 'express';
import { calendarController } from '../controllers/CalendarController';

const router = Router();

// Public routes (anyone can see calendar events, quotes, and panchang details)
router.get('/events', calendarController.getEvents);
router.get('/regional', calendarController.getRegionalData);
router.get('/quote', calendarController.getDailyQuote);

export default router;
