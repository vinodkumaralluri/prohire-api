import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EntityType } from 'src/enums/entity-type.enum';

export type EntityDocument = Entity & Document;

@Schema()
export class Entity {
    @Prop()
    entity_id: string;

    @Prop({
        type: String,
        enum: Object.values(EntityType),
        required: true,
      })
    entity_type: EntityType;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ required: true })
    address: string;

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

export const EntitySchema = SchemaFactory.createForClass(Entity);
EntitySchema.index({ entity_id: 1 }, { unique: true });