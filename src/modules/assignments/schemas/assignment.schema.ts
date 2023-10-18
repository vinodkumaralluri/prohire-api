import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AssignmentDocument = Assignment & Document;

@Schema()
export class Assignment {
    @Prop()
    assignment_id: string;

    @Prop({ required: true })
    subject_id: string;

    @Prop({ required: true })
    entity_id: string;
    
    @Prop({ required: true })
    problemStatement: string;

    @Prop({ required: true })
    solution: string;

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

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
AssignmentSchema.index({ assignment_id: 1 }, { unique: true });