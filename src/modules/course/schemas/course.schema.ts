import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema()
export class Course {
    @Prop()
    course_id: string;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    subject_id: string;

    @Prop({ required: true })
    entity_id: string;

    @Prop({ required: true })
    instructor: string;

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

export const CourseSchema = SchemaFactory.createForClass(Course);
CourseSchema.index({ course_id: 1 }, { unique: true });