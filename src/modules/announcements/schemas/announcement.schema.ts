import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AnnouncementSubject } from 'src/enums/announcement-subject.enum';

export type AnnouncementDocument = Announcement & Document;

@Schema()
export class Announcement {
    @Prop()
    announcement_id: string;

    @Prop({ required: true })
    entity_id: string;

    @Prop({
        type: String,
        enum: Object.values(AnnouncementSubject),
        required: true
    })
    subject: AnnouncementSubject;

    @Prop({ required: true })
    announcement: string;

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

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);
AnnouncementSchema.index({ announcement_id: 1 }, { unique: true });