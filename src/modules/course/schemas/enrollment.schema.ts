import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EnrollmentStatus } from 'src/enums/enrollment-status.enum';

export type EnrollmentDocument = Enrollment & Document;

@Schema()
export class Enrollment {
    @Prop()
    enrollment_id: string;

    @Prop({ required: true })
    student_id: string;

    @Prop({ required: true })
    course_id: string;

    @Prop({
        type: String,
        enum: Object.values(EnrollmentStatus),
        default: EnrollmentStatus.Pending
    })
    enrollment_status: EnrollmentStatus;

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

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);
EnrollmentSchema.index({ enrollment_id: 1 }, { unique: true });