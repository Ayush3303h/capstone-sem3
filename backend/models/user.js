// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    picture: String,
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
