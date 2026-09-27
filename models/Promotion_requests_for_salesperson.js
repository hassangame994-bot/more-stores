const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    name: {
      type: String,
    },

    email: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
    },
    phone_number: {
      type: String,
      trim: true,
    },

    GPS_URL: {
      type: String,
      trim: true,
    },

    whatsApp_number: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "promotion_request",
  schema,
  "Promotion requests for a salesperson"
);