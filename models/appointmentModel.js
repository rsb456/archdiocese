import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  Serial: { type: String, required: true },
  Name: String,
  Father: String,
  Title: String,
  Centre: String,
  From_Date: String,
  To_Date: String,
  Appointment: String,
  With: String,
  Remark: String,
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
