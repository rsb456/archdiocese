import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const router = express.Router();

import Priest from "../models/priestModel.js";
import Relation from "../models/relationModel.js";
import Formation from "../models/formationModel.js";
import Appointment from "../models/appointmentModel.js";
import HomeAddress from "../models/homeAddressModel.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Find by priestId directly (case-insensitive)
    const priest = await Priest.findOne({ priestId: new RegExp(`^${id}$`, "i") });

    if (!priest) {
      return res.status(404).json({ error: "Priest not found" });
    }

    // ✅ Use priestId consistently for all collections
    const pid = priest.priestId;

    const [formations, appointments, relations] = await Promise.all([
      Formation.find({ Serial: pid }),
      Appointment.find({ Serial: pid }),
      Relation.find({ Serial: pid }),
    ]);

    

    res.json({
      priest,
      formations,
      appointments,
      relations,
    });
  } catch (err) {
    console.error("❌ Error fetching priest:", err);
    res.status(500).json({ error: "Error fetching priest" });
  }
});

// ✅ Always return priests sorted by priestId (ascending)
router.get("/", async (req, res) => {
  try {
    const priests = await Priest.find().sort({ priestId: 1 }); // ascending by ID
    res.json(priests);
  } catch (err) {
    console.error("Error fetching priests:", err);
    res.status(500).json({ error: "Failed to fetch priests" });
  }
});

// ✅ Fetch home address by priestId
router.get("/homeaddress/:priestId", async (req, res) => {
  try {
    const { priestId } = req.params;

    // Case-insensitive match (in case your priestId is lowercase or uppercase)
    const homeAddress = await HomeAddress.findOne({
      priestId: new RegExp(`^${priestId}$`, "i"),
    });

    if (!homeAddress) {
      return res.status(404).json({ message: "No home address found" });
    }

    res.json(homeAddress);
  } catch (err) {
    console.error("❌ Error fetching home address:", err);
    res.status(500).json({ message: "Server error fetching home address" });
  }
});

// ✅ Add new priest, auto-generate next priestId
router.post("/", async (req, res) => {
  try {
    const priestData = req.body;

    // ✅ Get the last priest by priestId (numerically)
    const lastPriest = await Priest.findOne().sort({ priestId: -1 });

    let nextId = "P001";
    if (lastPriest && lastPriest.priestId) {
      const lastNum = parseInt(lastPriest.priestId.replace(/^P/i, ""), 10) || 0;
      nextId = `P${(lastNum + 1).toString().padStart(3, "0")}`;
    }

    // ✅ Assign new unique ID
    priestData.priestId = nextId;

    // ✅ Create priest safely
    const newPriest = new Priest(priestData);
    await newPriest.save();

    console.log("✅ New priest created:", newPriest.priestId);
    res.status(201).json(newPriest);
  } catch (err) {
    console.error("❌ Error creating priest:", err);
    res.status(500).json({ error: "Server error while creating priest" });
  }
});

router.post("/:priestId/photo", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const { priestId } = req.params;
    const filename = req.file.filename;

    console.log("Uploading photo for priestId:", priestId);

    const priest = await Priest.findOneAndUpdate(
      { priestId: priestId }, // explicitly match string
      { $set: { profilePic: filename } }, // use $set
      { new: true }
    );

    if (!priest) {
      console.log("Priest not found for ID:", priestId);
      return res.status(404).json({ error: "Priest not found" });
    }

    console.log("Updated priest:", priest);
    res.json({ message: "Photo uploaded", filename, priest });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Error uploading photo" });
  }
});


// Formation
router.post("/formations", async (req, res) => {
  const formation = new Formation(req.body);
  await formation.save();
  res.json(formation);
});

// Appointment
router.post("/appointments", async (req, res) => {
  const appointment = new Appointment(req.body);
  await appointment.save();
  res.json(appointment);
});

// Relation
router.post("/relations", async (req, res) => {
  const relation = new Relation(req.body);
  await relation.save();
  res.json(relation);
});



router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const updatedPriest = await Priest.findOneAndUpdate(
      { priestId: id }, // ✅ priestId instead of _id
      req.body,
      { new: true }
    );

    if (!updatedPriest)
      return res.status(404).json({ message: "Priest not found" });

    res.json(updatedPriest);
  } catch (err) {
    console.error("Error updating priest:", err);
    res.status(500).json({ message: "Server error while updating priest" });
  }
});

router.delete("/:priestId/photo", async (req, res) => {
  try {
    const { priestId } = req.params;

    const priest = await Priest.findOne({ priestId });
    if (!priest) {
      return res.status(404).json({ error: "Priest not found" });
    }

    if (priest.profilePic) {
      const photoPath = path.join(process.cwd(), "uploads", priest.profilePic);

      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath); // delete file from disk
      }

      priest.profilePic = null;
      await priest.save();
    }

    res.json({ message: "Photo deleted", priest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting photo" });
  }
});

router.put("/update-name/:priestId", async (req, res) => {
  try {
    const { priestId } = req.params;
    const { newName } = req.body;

    if (!newName || !priestId) {
      return res.status(400).json({ message: "Priest ID and new name are required" });
    }

    // ✅ Update in Priest table
    const updatedPriest = await Priest.findOneAndUpdate(
      { priestId },
      { Name: newName },
      { new: true }
    );

    if (!updatedPriest) {
      return res.status(404).json({ message: "Priest not found" });
    }

    // ✅ Update related tables where Serial = priestId
    await Promise.all([
      Formation.updateMany({ Serial: priestId }, { Priest_Name: newName }),
      Appointment.updateMany({ Serial: priestId }, { Priest_Name: newName }),
      Relation.updateMany({ Serial: priestId }, { Priest_Name: newName }),
    ]);

    res.json({
      message: "Priest name updated across all collections",
      updatedPriest,
    });
  } catch (err) {
    console.error("Error updating priest name across collections:", err);
    res.status(500).json({ message: "Server error while updating priest name" });
  }
});

router.put("/update-name/:priestId", async (req, res) => {
  try {
    const { priestId } = req.params;
    const { newName } = req.body;

    if (!newName || !priestId) {
      return res.status(400).json({ message: "Priest ID and new name are required" });
    }

    // ✅ Update in Priest collection
    const updatedPriest = await Priest.findOneAndUpdate(
      { priestId },
      { Name: newName },
      { new: true }
    );

    if (!updatedPriest) {
      return res.status(404).json({ message: "Priest not found" });
    }

    // ✅ Update related tables — handle different field names
    await Promise.all([
      Formation.updateMany({ Serial: priestId }, { Name: newName }), // 'Name' field
      Appointment.updateMany({ Serial: priestId }, { Name: newName }), // 'Name' field
      Relation.updateMany({ Serial: priestId }, { priestName: newName }), // 'priestName' field
    ]);

    res.json({
      message: "✅ Priest name updated across all collections",
      updatedPriest,
    });
  } catch (err) {
    console.error("❌ Error updating priest name across collections:", err);
    res.status(500).json({ message: "Server error while updating priest name" });
  }
});

export default router;
