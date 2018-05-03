import { IUser } from './user.interface';
import { Model, model } from 'mongoose';
import { UserSchema } from './user.schema';

export const User: Model<IUser> = model<IUser>('User', UserSchema);
