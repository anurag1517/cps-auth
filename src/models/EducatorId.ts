// models/EducatorID.ts
import mongoose from "mongoose";

const EducatorIDSchema = new mongoose.Schema({
  eid: {
    type: String,
    required: true,
    unique: true,
    length: 16,
  },
  used: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("EducatorID", EducatorIDSchema);
