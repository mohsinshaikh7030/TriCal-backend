import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import blogRoutes from './routes/BlogRoutes';
import errorHandler from './middlewares/errorHandler';

// For env File 
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes
app.use('/api/v1/blogs', blogRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server');
});

// Global Error Handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
