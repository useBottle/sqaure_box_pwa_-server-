import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    match: /^[A-Za-z0-9]{6,20}$/,
  },
  password: {
    type: String,
    required: true,
    match: /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{6,}$/,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
