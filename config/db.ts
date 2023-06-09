import mongoose from 'mongoose';

export function connectDB(uri: string): void {
  const dbName = 'fileshare';

  mongoose
    .connect(uri + dbName, {
      serverSelectionTimeoutMS: 5000,
    })
    .then(
      () => console.log('⚡️[server]: Database successfully connected.'),
      (err) => console.log(err.reason),
    );
}
