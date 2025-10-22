import mongoose from "mongoose";

const formationSchema = new mongoose.Schema({
  Serial: { type: String, required: true },
  Name: String,
  Father: String,
  Title: String,
  Formation_Number: Number,
  Formation: String,
  From_Date: String,
  To_Date: String,
  Place: String,
  Rector: String,
  Remark: String,
});

const Formation = mongoose.model("Formation", formationSchema);

export default Formation;
