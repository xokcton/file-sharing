import 'dotenv/config';
import { connectDB } from './config/db.js';
import File from './models/file.js';
import fs from 'fs';

const URI = process.env.MONGO_CONNECTION_URL || '';
connectDB(URI);

// Get all records older than 24 hours
async function deleteData() {
  const files = await File.find({ createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
  if (files.length) {
    for (const file of files) {
      try {
        fs.unlinkSync(file.path);
        await file.deleteOne();
        console.log(`Successfully deleted ${file.filename}`);
      } catch (err) {
        console.log(`Error while deleting file ${err} `);
      }
    }
  }
  console.log('Job done!');
}

deleteData().then(process.exit());
