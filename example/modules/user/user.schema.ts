import mongoose from 'mongoose';

export const UserSchema: mongoose.Schema = new mongoose.Schema({
  email: String,
  name: String,
  password: String
});