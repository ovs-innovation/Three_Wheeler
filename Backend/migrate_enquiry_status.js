require('dotenv').config();
const mongoose = require('mongoose');
const Enquiry = require('./src/models/enquiry.model');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const res1 = await Enquiry.updateMany({ status: 'Resolved' }, { $set: { status: 'Completed' } });
    console.log('Update status Resolved:', res1);

    const res2 = await Enquiry.updateMany({ status: 'Closed' }, { $set: { status: 'Cancelled' } });
    console.log('Update status Closed:', res2);

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
