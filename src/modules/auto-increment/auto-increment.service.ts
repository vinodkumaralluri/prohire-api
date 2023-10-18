import {
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AutoIncrementEnum } from './auto-increment.enum';
import { AutoIncrement, AutoIncrementDocument } from './auto-increment.schema';
import * as mongoose from 'mongoose';

@Injectable()
export class AutoIncrementService {
  isFetching = false;
  constructor(
    @InjectModel(AutoIncrement.name)
    private incrementModel: Model<AutoIncrementDocument>,
  ) {}

  async getNextSequence(table_name: AutoIncrementEnum, session: mongoose.ClientSession | null = null) {
    const ret = await this.incrementModel.findOneAndUpdate(
      { _id: table_name },
      { $inc: { seq: 1 } },
      {
        returnNewDocument: true,
        upsert: true,
        new: true,
      },
    ).session(session);
    return table_name + ret.seq;
  }

  async getprevious(table_name: AutoIncrementEnum) {
    const ret = await this.incrementModel.findOneAndUpdate(
      { _id: table_name },
      { $inc: { seq: -1 } },
      {
        returnNewDocument: true,
        upsert: true,
        new: true,
      },
    );
    return table_name + ret.seq;
  }
}
