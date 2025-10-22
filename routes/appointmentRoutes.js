// routes/appointmentRoutes.js
import express from "express";
import Appointment from "../models/appointmentModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { priestId } = req.query;
    const filter = priestId ? { priestId } : {};
    const appointments = await Appointment.find(filter);
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});


// ✅ CREATE
router.post("/", async (req, res) => {
  try {
    const newAppointment = new Appointment(req.body);
    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (err) {
    console.error("Error creating appointment:", err);
    res.status(500).json({ message: "Error creating appointment" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Same safety check
    if (!id || id.length !== 24) {
      console.warn("Skipping invalid appointment ID:", id);
      return res.status(200).json({ message: "Invalid ID, skipped" });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedAppointment) {
      console.warn("Appointment not found for ID:", id);
      return res.status(200).json({ message: "Appointment not found, skipped" });
    }

    res.json(updatedAppointment);
  } catch (err) {
    console.error("Error updating appointment:", err);
    res.status(500).json({ message: "Error updating appointment" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.length !== 24) {
      console.warn("Skipping invalid or missing ID:", id);
      return res.status(200).json({ message: "Invalid ID, skipped" });
    }

    const deleted = await Appointment.findByIdAndDelete(id);
    if (!deleted) {
      console.warn("Appointment not found or already deleted:", id);
      return res.status(200).json({ message: "Appointment not found or already deleted" });
    }

    res.json({ message: "Appointment deleted successfully", id });
  } catch (err) {
    console.error("Error deleting appointment:", err);
    res.status(500).json({ message: "Error deleting appointment" });
  }
});

export default router;
