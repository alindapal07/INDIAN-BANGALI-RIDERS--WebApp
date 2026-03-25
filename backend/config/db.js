const mongoose = require('mongoose');

const connectDB = async () => {
  let uri = process.env.MONGO_URI;
  
  // If the URI doesn't have URL-encoded special chars, encode the password part
  if (uri && !uri.includes('%40')) {
    try {
      const parts = uri.match(/^(mongodb\+srv:\/\/)([^:]+):([^@]+)@(.+)$/);
      if (parts) {
        const [, protocol, user, pass, rest] = parts;
        const encodedPass = encodeURIComponent(pass);
        uri = `${protocol}${user}:${encodedPass}@${rest}`;
      }
    } catch (e) {
      // Use URI as-is
    }
  }
  
  return mongoose.connect(uri);
};

module.exports = connectDB;
