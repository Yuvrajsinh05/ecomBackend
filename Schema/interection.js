const mongoose = require('mongoose');

// Define the schema for the "interaction" collection
const interactionSchema = new mongoose.Schema({
  customer_id: { type: String, required: true },
  replied: { type: Boolean, default: false },
  repliedAt: { type: Date, default: Date.now },
  recivedAt: { type: Date, default: Date.now },
  ActiveChat: [
    {
      role: { type: String, required: true },
      content: { type: String, required: true },
      timeStamp:{type:Date}
    }
  ]
});

// Create the Mongoose model for the "interaction" collection
const Interaction = mongoose.model('Interaction', interactionSchema , 'interection');

module.exports = Interaction;
