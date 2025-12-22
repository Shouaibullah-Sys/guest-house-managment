// Test script to verify mongoose model registration
const mongoose = require("mongoose");

// Import the models to trigger registration
require("./models/User");
require("./models/Booking");
require("./models/Room");
require("./models/RoomType");

console.log("Registered models:");
console.log("User:", !!mongoose.models.User);
console.log("Booking:", !!mongoose.models.Booking);
console.log("Room:", !!mongoose.models.Room);
console.log("RoomType:", !!mongoose.models.RoomType);
