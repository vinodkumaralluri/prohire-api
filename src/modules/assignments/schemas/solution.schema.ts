import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SolutionStatus } from 'src/enums/solution-status.enum';

export type SolutionDocument = Solution & Document;

@Schema()
export class Solution {
    @Prop()
    solution_id: string;

    @Prop({ required: true })
    assignment_id: string;

    @Prop({ required: true })
    student_id: string;
    
    @Prop({ required: true })
    solution: string;

    @Prop({
        type: String,
        enum: Object.values(SolutionStatus),
        default: SolutionStatus.Pending
    })
    solutionStatus: SolutionStatus;

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

export const SolutionSchema = SchemaFactory.createForClass(Solution);
SolutionSchema.index({ solution_id: 1 }, { unique: true });