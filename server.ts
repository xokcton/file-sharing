import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import { connectDB } from './config/db.js';
import filesRouter from './routes/file.js';
import showRouter from './routes/show.js';
import path from 'path';
import { fileURLToPath } from 'url';
import copyfiles from 'copyfiles';
import cors from 'cors';

const app: Express = express();
const PORT = process.env.PORT || 3000;
const URI = process.env.MONGO_CONNECTION_URL || '';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corsOptions = {
  origin: process.env.ALLOWED_CLIENTS?.split(','),
};
app.use(cors(corsOptions));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use('/api', filesRouter);
app.use('/files', showRouter);

app.get('/', (req: Request, res: Response) => {
  // copyfiles(['views/download.ejs', 'public/*', 'uploads/*', 'dist'], () => {
  //   console.log(
  //     '⚡️[server]: [views/download.ejs], [public/*], [uploads/*] successfully copied to "dist" folder.',
  //   );
  // });
  return res.render('index');
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
  connectDB(URI);
});
