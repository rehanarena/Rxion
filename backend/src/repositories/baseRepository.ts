import { Model, Document, SortOrder, PipelineStage } from "mongoose";

export type SortParam =
  | string
  | Record<string, SortOrder | { $meta: any }>
  | [string, SortOrder][];

export interface FindOptions {
  query?: Record<string, any>;
  projection?: Record<string, any> | string;
  sort?: SortParam;
  skip?: number;
  limit?: number;
}

export class BaseRepository<T extends Document> {
  constructor(protected model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    const doc = new this.model(data);
    return doc.save();
  }

  async findById(id: string, projection?: string): Promise<T | null> {
    return this.model.findById(id, projection).exec();
  }

  async findOne(
    query: Record<string, any>,
    projection?: string
  ): Promise<T | null> {
    return this.model.findOne(query, projection).exec();
  }

  /** now supports sorting, pagination & projection */
  async find(opts: FindOptions = {}): Promise<T[]> {
    const {
      query = {},
      projection,
      sort = {},
      skip = 0,
      limit = 0,
    } = opts;

    return this.model
      .find(query, projection)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async count(query: Record<string, any> = {}): Promise<number> {
    return this.model.countDocuments(query).exec();
  }

  async updateById(
    id: string,
    update: Partial<T>,
    options = { new: true }
  ): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, options).exec();
  }

  async updateOne(
    query: Record<string, any>,
    update: Partial<T>,
    options = { new: true, upsert: false }
  ): Promise<T | null> {
    return this.model.findOneAndUpdate(query, update, options).exec();
  }

  async deleteById(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  async deleteOne(query: Record<string, any>): Promise<void> {
    await this.model.deleteOne(query).exec();
  }
  async aggregate<R = any>(pipeline: PipelineStage[]): Promise<R[]> {
    return this.model.aggregate(pipeline).exec();
  }
}
