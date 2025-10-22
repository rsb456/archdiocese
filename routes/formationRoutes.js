import express from "express";
const router = express.Router();
import Formation from "../models/formationModel.js";


router.get("/", async (req, res) => {
  try {
    const { priestId } = req.query;
    const filter = priestId ? { priestId } : {};
    const formations = await Formation.find(filter);
    res.json(formations);
  } catch (err) {
    console.error("❌ Formation fetch error:", err);
    res.status(500).json({ error: "Failed to fetch formations" });
  }
});

// ✅ Create
router.post("/", async (req, res) => {
  try {
    const formation = new Formation(req.body);
    await formation.save();
    res.status(201).json(formation);
  } catch (err) {
    console.error("❌ Error creating formation:", err);
    res.status(500).json({ message: "Error creating formation" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ If ID is not a valid ObjectId, skip instead of crashing
    if (!id || id.length !== 24) {
      console.warn("Skipping invalid formation ID:", id);
      return res.status(200).json({ message: "Invalid ID, skipped" });
    }

    const updatedFormation = await Formation.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedFormation) {
      console.warn("Formation not found for ID:", id);
      return res.status(200).json({ message: "Formation not found, skipped" });
    }

    res.json(updatedFormation);
  } catch (err) {
    console.error("Error updating formation:", err);
    res.status(500).json({ message: "Error updating formation" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Guard: skip invalid or already missing IDs
    if (!id || id.length !== 24) {
      console.warn("Skipping invalid or missing ID:", id);
      return res.status(200).json({ message: "Invalid ID, skipped" });
    }

    const deleted = await Formation.findByIdAndDelete(id);
    if (!deleted) {
      console.warn("Formation not found or already deleted:", id);
      return res.status(200).json({ message: "Formation not found or already deleted" });
    }

    res.json({ message: "Formation deleted successfully", id });
  } catch (err) {
    console.error("Error deleting formation:", err);
    res.status(500).json({ message: "Error deleting formation" });
  }
});


export default router;
