import { Request, Response, NextFunction } from 'express';
import { PostgrestError } from '@supabase/supabase-js';

const errorHandler = (err: Error | PostgrestError, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  // Default error
  let statusCode = 500;
  let message = 'An unexpected error occurred';

  // Handle Supabase/PostgREST errors
  if ('code' in err) {
    message = err.message;
    switch (err.code) {
      case '23505': // unique_violation
        statusCode = 409; // Conflict
        message = `A record with that value already exists. ${err.details}`;
        break;
      case '22P02': // invalid_text_representation
        statusCode = 400; // Bad Request
        message = `Invalid input syntax. ${err.details}`;
        break;
      case 'PGRST116': // invalid_range
        statusCode = 416; // Range Not Satisfiable
        message = 'The requested range is not valid.';
        break;
      default:
        statusCode = 500;
        break;
    }
  } else if (err instanceof Error) {
    // Handle generic errors
    message = err.message;
  }

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

export default errorHandler;
