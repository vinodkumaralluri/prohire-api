import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Gender } from '../../../enums/gender.enum';
import { EmployeeQualification } from 'src/enums/employee-qualification.enum';

export type EmployeeDocument = Employee & Document;

@Schema()
export class Employee {
  @Prop()
  employee_id: string;

  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  first_name: string;

  @Prop()
  last_name: string;

  @Prop({ required: true })
  entity_id: string;

  @Prop()
  employee_code: string;

  @Prop({ required: true })
  role_id: string;

  @Prop({
    type: String,
    enum: Object.values(EmployeeQualification),
  })
  qualification: EmployeeQualification;

  @Prop({
    type: String,
    enum: Object.values(Gender),
  })
  gender: Gender;

  @Prop()
  date_of_birth: string;

  @Prop()
  date_of_joining: string;

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

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
EmployeeSchema.index({ employee_id: 1 }, { unique: true });
