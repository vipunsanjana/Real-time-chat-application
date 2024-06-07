const mongoose = require('mongoose');


mongoose.connect(process.env.MONGO_URL, {
}).then(() => console.log('Connected to DB')).catch((e)=> console.log('Error', e))