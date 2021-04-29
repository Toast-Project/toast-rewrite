import { Collection } from "mongodb";

export default class Dao {
    collection: Collection;

    constructor(db, collection) {
        this.collection = db.collection(collection);
    }

    async create(_id) {
        return this.insert({ _id });
    }

    async insert(data) {
        if (Array.isArray(data)) {
            return this.collection.insertMany(data);
        } else {
            return this.collection.insertOne(data);
        }
    }

    async get(_id, user?: string) {
        if (user) {
            const id = _id + "_" + user;
            return this.collection.findOne({ _id: id });
        } else {
            return this.collection.findOne({ _id });
        }
    }

    async find(filter = {}) {
        const cursor = await this.collection.find(filter);
        return cursor.toArray();
    }

    async findOne(filter = {}) {
        return this.collection.findOne(filter);
    }

    async count(filter = {}) {
        return this.collection.countDocuments(this.queryOf(filter));
    }

    async all() {
        return this.find();
    }

    async update(_id, data = {}) {
        const set = { $set: data };
        const opts = { upsert: true, $setOnInsert: { _id } };
        const { value } = await this.collection.findOneAndUpdate(this.queryOf(_id), set, opts) || {};
        return value;
    }

    async inc(_id, field, amount = 1) {
        const inc = { $inc: { [field]: amount }, $setOnInsert: { _id } };
        const opts = { upsert: true };
        const { upsertedId } = await this.collection.updateOne(this.queryOf(_id), inc, opts) || {};
        return await this.get(upsertedId);
    }

    async pull(_id, field, newValue) {
        const inc = { $pull: { field: newValue } };
        const { upsertedId } = await this.collection.updateOne(this.queryOf(_id), inc) || {};
        return await this.get(upsertedId);
    }

    async push(_id, field, newValue) {
        const inc = { $push: { [field]: newValue } };
        const opts = { upsert: true };
        const { upsertedId } = await this.collection.updateOne(this.queryOf(_id), inc, opts) || {};
        return await this.get(upsertedId);
    }

    async delete(_id) {
        const { value } = await this.collection.findOneAndDelete(this.queryOf(_id)) || {};
        return value;
    }

    async deleteMany(filter) {
        const { value } = await this.collection.findOneAndDelete(this.queryOf(filter)) || {};
        return value;
    }

    queryOf(input = {}) {
        if (Array.isArray(input)) {
            return input.map(this.queryOf);
        }
        if (typeof input !== 'object') {
            return { _id: input };
        }
        return input;
    }
}