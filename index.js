import mongoose from 'mongoose';
import server from './app/server';
import { PORT, MONGODB_URL } from './config/config';

const connect = async () => {
  // connect to db
  const connection = mongoose.connection;
  connection.on('error', console.error.bind(console, 'connection error:'));
  await mongoose.connect(MONGODB_URL);
  console.log(`Connected to MongoDB at ${MONGODB_URL}`);

  // connect to server
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`${server.name} listening at ${server.url}`);
  });
};

connect();
