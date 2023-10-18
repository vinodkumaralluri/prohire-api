import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubjectDocument = Subject & Document;

@Schema()
export class Subject {
    @Prop()
    subject_id: string;

    @Prop({ required: true })
    name: string;

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

export const SubjectSchema = SchemaFactory.createForClass(Subject);
SubjectSchema.index({ subject_id: 1 }, { unique: true });