import mongoose from "mongoose";

const priestSchema = new mongoose.Schema({
  priestId: { type: String, required: true, unique: true },
  Name: { type: String, required: true },
  Father: String,
  Mother: String,
  Title: String,
  Blood: String,
  Born: String,
  Feast: String,
  Ordained: String,
  Prelate: String,
  Placeat: String,
  Centre: String,
  Institution: String,
  Phone: String,
  homeState: String,
  homePh: String,
  Parish: String,
  parishPh: String,
  Diocese: String,
  mobile1: String,
  mobile2: String,
  Email: String,
  profilePic: String,
});

const Priest = mongoose.model("Priest", priestSchema);

export default Priest;
