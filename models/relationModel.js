import mongoose from "mongoose";

const relationSchema = new mongoose.Schema({
  Serial: { type: String, required: true },
  priestName: String,
  Father: String,
  Title: String,
  Relationship: String,
  siblingName: String,
  Occupation: String,
  Phone: String,
});

const Relation = mongoose.model("Relation", relationSchema);

export default Relation;
