import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserType } from '../../../enums/user-type.enum';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  user_id: string;

  @Prop({ required: true })
  phone_number: string;

  @Prop({ required: true })
  email: string;

  @Prop({
    type: String,
    enum: Object.values(UserType),
    required: true,
  })
  user_type: UserType;

  @Prop({ required: true })
  password: string;

  @Prop()
  is2FaEnabled: boolean;

  @Prop()
  otp: string;

  @Prop()
  otpExpiry: string;

  @Prop()
  last_login_date: string;

  @Prop({ required: true })
  created_at: string;

  @Prop({ required: true })
  created_by: string;

  @Prop()
  updated_at: string;

  @Prop()
  updated_by: string;

  @Prop({ default: 1 })
  status?: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ user_id: 1 }, { unique: true });
