// routes/homeAddressRoutes.js
import express from "express";
import HomeAddress from "../models/homeAddressModel.js";

const router = express.Router();

/* ============================================================
   ✅ Get Address by priestId
============================================================ */
router.get("/:priestId", async (req, res) => {
  try {
    const { priestId } = req.params;
    const address = await HomeAddress.findOne({ priestId });

    if (!address) {
      console.log(`ℹ️ No address found for priestId: ${priestId}`);
      return res.status(404).json({ message: "Address not found" });
    }

    res.json(address);
  } catch (err) {
    console.error("❌ Error fetching address:", err);
    res.status(500).json({ error: "Server error while fetching address" });
  }
});

/* ============================================================
   ✅ Create or Update (Upsert) Address
============================================================ */
router.put("/:priestId", async (req, res) => {
  try {
    const { priestId } = req.params;
    const body = req.body || {};

    // ✅ Default structure (if fields are missing)
    const defaultData = {
      HomeAdd1: "",
      HomeAdd2: "",
      HomeAdd3: "",
      HomeAdd4: "",
      HomeAdd5: "",
      HomePin: "",
    };

    const updatedData = { ...defaultData, ...body, priestId };

    // ✅ Find existing or create new
    const updated = await HomeAddress.findOneAndUpdate(
      { priestId },
      { $set: updatedData },
      { new: true, upsert: true }
    );

    console.log(`🏠 Address upserted for priestId: ${priestId}`);
    res.json(updated);
  } catch (err) {
    console.error("❌ Error saving address:", err);
    res.status(500).json({ error: "Server error while saving address" });
  }
});

/* ============================================================
   ✅ Delete Address (Optional)
============================================================ */
router.delete("/:priestId", async (req, res) => {
  try {
    const { priestId } = req.params;
    const deleted = await HomeAddress.findOneAndDelete({ priestId });

    if (!deleted)
      return res.status(404).json({ message: "Address not found" });

    res.json({ message: "Address deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting address:", err);
    res.status(500).json({ error: "Error deleting address" });
  }
});

export default router;
