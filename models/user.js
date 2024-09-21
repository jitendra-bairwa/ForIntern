const mongoose = require('mongoose');

// connect database to express server
mongoose.connect("mongodb+srv://jitendra:jitendra@cluster0.twuaq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(()=>{
    console.log('mongoose connected');
})
.catch((e)=>{
    console.log('failed');
})

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, 
  },
  password: {
    type: String,
    // required: true, // 
  },
  googleId: {
    type: String, 
    default: null, // Default to null, so it's optional
  },
});

// Ensure unique index only applies to non-null googleId values
userSchema.index({ googleId: 1 }, { sparse: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
