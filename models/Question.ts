// models/Question.ts
import mongoose, { Schema } from "mongoose";
import { IQuestion } from "./types";

const questionSchema = new Schema<IQuestion>({
  quiz: { type: String, required: true },
  approved: { type: Boolean, default: false },
  contributor: { type: String, required: true },
  contributorId: { type: String, ref: "User", required: true },

  answers: [
    {
      ans: { type: String, required: true },
      approved: { type: Boolean, default: false },
      contributor: { type: String, required: true },
      contributorId: { type: String, ref: "User", required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

// Check if model already exists to prevent overwriting during hot reloads
const Question =
  mongoose.models.Question ||
  mongoose.model<IQuestion>("Question", questionSchema);

export { Question };
export default Question;
