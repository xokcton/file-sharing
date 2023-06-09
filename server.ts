import 'dotenv/config';
import express, { Express } from 'express';
import { connectDB } from './config/db.js';
import filesRouter from './routes/file.js';
import showRouter from './routes/show.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app: Express = express();
const PORT = process.env.PORT || 3000;
const URI = process.env.MONGO_CONNECTION_URL || '';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static('public'));

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use('/api', filesRouter);
app.use('/files', showRouter);

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
  connectDB(URI);
});
