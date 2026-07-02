import type { Request, Response, NextFunction } from 'express';
import { calendarService } from '../services/CalendarService';

class CalendarController {
  // GET /api/v1/calendar/events?month=X&year=Y
  async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const current = new Date();
      const month = req.query.month ? parseInt(req.query.month as string) : current.getMonth() + 1;
      const year = req.query.year ? parseInt(req.query.year as string) : current.getFullYear();

      if (isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ message: 'Invalid month parameter. Must be 1-12.' });
      }
      if (isNaN(year) || year < 1900) {
        return res.status(400).json({ message: 'Invalid year parameter.' });
      }

      const events = await calendarService.getEvents(month, year);
      res.status(200).json(events);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/calendar/regional?date=YYYY-MM-DD
  async getRegionalData(req: Request, res: Response, next: NextFunction) {
    try {
      const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
      
      // Simple date format check (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return res.status(400).json({ message: 'Invalid date parameter. Use YYYY-MM-DD.' });
      }

      const data = await calendarService.getRegionalData(dateStr);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/calendar/quote
  async getDailyQuote(req: Request, res: Response, next: NextFunction) {
    try {
      const quote = await calendarService.getRandomQuote();
      res.status(200).json(quote);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/admin/holidays
  async getAllHolidays(req: Request, res: Response, next: NextFunction) {
    try {
      const holidays = await calendarService.getAllHolidays();
      res.status(200).json(holidays);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/admin/holidays
  async createHoliday(req: Request, res: Response, next: NextFunction) {
    try {
      const holiday = await calendarService.createHoliday(req.body);
      res.status(201).json(holiday);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/admin/holidays/:id
  async updateHoliday(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const holiday = await calendarService.updateHoliday(id, req.body);
      res.status(200).json(holiday);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/admin/holidays/:id
  async deleteHoliday(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await calendarService.deleteHoliday(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/admin/festivals
  async getAllFestivals(req: Request, res: Response, next: NextFunction) {
    try {
      const festivals = await calendarService.getAllFestivals();
      res.status(200).json(festivals);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/admin/festivals
  async createFestival(req: Request, res: Response, next: NextFunction) {
    try {
      const festival = await calendarService.createFestival(req.body);
      res.status(201).json(festival);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/admin/festivals/:id
  async updateFestival(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const festival = await calendarService.updateFestival(id, req.body);
      res.status(200).json(festival);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/admin/festivals/:id
  async deleteFestival(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await calendarService.deleteFestival(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/admin/holiday-categories
  async getHolidayCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await calendarService.getHolidayCategories();
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }
}

export const calendarController = new CalendarController();
