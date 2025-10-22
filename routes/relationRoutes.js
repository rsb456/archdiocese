import express from "express";
import Relation from "../models/relationModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { priestId } = req.query;
    const filter = priestId ? { priestId } : {};
    const relations = await Relation.find(filter);
    res.json(relations);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch relations" });
  }
});


router.post("/", async (req, res) => {
  try {
    const newRelation = new Relation(req.body);
    await newRelation.save();
    res.status(201).json(newRelation);
  } catch (err) {
    console.error("Error creating relation:", err);
    res.status(500).json({ message: "Error creating relation" });
  }
});


/*✅ Update an existing relation*/
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Skip invalid IDs
    if (!id || id.length !== 24) {
      console.warn("Skipping invalid relation ID:", id);
      return res.status(200).json({ message: "Invalid ID, skipped" });
    }

    const updated = await Relation.findByIdAndUpdate(id, req.body, { new: true });

    if (!updated) {
      console.warn("Relation not found or already deleted:", id);
      return res.status(200).json({ message: "Relation not found, skipped" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error updating relation:", err);
    res.status(500).json({ message: "Error updating relation" });
  }
});

/*✅ Delete a relation safely*/
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Guard invalid IDs
    if (!id || id.length !== 24) {
      console.warn("Skipping invalid or missing ID:", id);
      return res.status(200).json({ message: "Invalid ID, skipped" });
    }

    const deleted = await Relation.findByIdAndDelete(id);

    if (!deleted) {
      console.warn("Relation not found or already deleted:", id);
      return res.status(200).json({ message: "Relation not found or already deleted" });
    }

    res.json({ message: "Relation deleted successfully", id });
  } catch (err) {
    console.error("❌ Error deleting relation:", err);
    res.status(500).json({ message: "Error deleting relation" });
  }
});

export default router;
