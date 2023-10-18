import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AcademicCourse, AcademicDegree, AcademicYear } from 'src/enums/academics.enum';
import { Gender } from 'src/enums/gender.enum';

export type StudentDocument = Student & Document;

@Schema()
export class Student {
  @Prop()
  student_id: string;

  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  first_name: string;

  @Prop()
  last_name: string;

  @Prop({ required: true })
  entity_id: string;

  @Prop()
  roll_no: string;

  @Prop({
    type: String,
    enum: Object.values(Gender),
    required: true
  })
  gender: Gender;

  @Prop({ required: true })
  role_id: string;

  @Prop({
    type: String,
    enum: Object.values(AcademicDegree),
    required: true
  })
  degree: AcademicDegree;

  @Prop({
    type: String,
    enum: Object.values(AcademicCourse),
    required: true
  })
  academic_course: AcademicCourse;

  @Prop({
    type: String,
    enum: Object.values(AcademicYear),
    required: true
  })
  academic_year: AcademicYear;

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

export const StudentSchema = SchemaFactory.createForClass(Student);
StudentSchema.index({ student_id: 1 }, { unique: true });
