require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const db = mongoose.connection.db;
    const result = await db.collection('users').updateMany(
      { role: 'SUPER_ADMIN' },
      { $set: { role: 'ADMIN' } }
    );
    console.log(`Updated ${result.modifiedCount} users to ADMIN`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
