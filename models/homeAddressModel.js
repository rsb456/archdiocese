// models/homeAddressModel.js
import mongoose from "mongoose";

const homeAddressSchema = new mongoose.Schema(
  {
    priestId: {
      type: String,
      required: true,
      index: true,
    },
    Name: {
      type: String,
    },
    HomeAdd1: {
      type: String,
      default: "",
    },
    HomeAdd2: {
      type: String,
      default: "",
    },
    HomeAdd3: {
      type: String,
      default: "",
    },
    HomeAdd4: {
      type: String,
      default: "",
    },
    HomeAdd5: {
      type: String,
      default: "",
    },
    HomePin: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: false, // no createdAt/updatedAt needed
    collection: "homeAddress", // match your collection name in Mongo
  }
);

const HomeAddress = mongoose.model("HomeAddress", homeAddressSchema);
export default HomeAddress;
