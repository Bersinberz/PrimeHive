import mongoose, { Schema, Document } from "mongoose";

export interface ICounter extends Document {
    name: string;
    seq: number;
}

const CounterSchema = new Schema<ICounter>({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    seq: {
        type: Number,
        default: 1000,
    },
});

const Counter = mongoose.model<ICounter>("Counter", CounterSchema);

/**
 * Atomically increment and return the next sequence value.
 * Uses findOneAndUpdate with $inc — no race conditions.
 */
export const getNextSequence = async (name: string): Promise<number> => {
    const counter = await Counter.findOneAndUpdate(
        { name },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return counter.seq;
};

export default Counter;
