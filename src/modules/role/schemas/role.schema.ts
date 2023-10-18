import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoleDocument = Role & Document;

@Schema()
export class Role {
  @Prop()
  role_id: string;

  @Prop({required: true})
  entity_id: string;

  @Prop({required: true})
  role: string;

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

export const RoleSchema = SchemaFactory.createForClass(Role);
RoleSchema.index({ role_id: 1 }, { unique: true });