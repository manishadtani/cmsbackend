import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    pageSlug: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    sectionKey: {
      type: String,
      required: true,
      trim: true, // hero, experience, services, etc
    },

    order: {
      type: Number,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Flexible content - can contain anything based on section type
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Section = mongoose.model("Section", sectionSchema);
export default Section;
