// server/routes/printRoutes.js
import express from "express";
import Priest from "../models/priestModel.js";
import Relation from "../models/relationModel.js";
import Formation from "../models/formationModel.js";
import Appointment from "../models/appointmentModel.js";

const router = express.Router();

router.get("/priests/:id/full", async (req, res) => {
  try {
    const priest = await Priest.findById(req.params.id);
    if (!priest) return res.status(404).json({ error: "Not found" });

    const key = priest.Serial ?? priest.priestId ?? priest._id.toString();

    const [relations, formations, appointments] = await Promise.all([
      Relation.find({ Serial: key }),
      Formation.find({ Serial: key }),
      Appointment.find({ Serial: key }),
    ]);

    res.json({ priest, relations, formations, appointments });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch print data" });
  }
});

export default router;
