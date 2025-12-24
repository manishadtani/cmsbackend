import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    route: {
      type: String,
      required: true,
      trim: true,
    },

     // 🟢 NEW: Parent relation (VERY IMPORTANT)
    parentSlug: {
      type: String,
      default: null, // null = top level page
      index: true,
    },

    // 🟢 NEW: Navbar control
    showInNavbar: {
      type: Boolean,
      default: false,
    },

    // 🟢 NEW: Ordering (navbar + sections)
    order: {
      type: Number,
      default: 0,
    },

    seo: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true },
      metaKeywords: { type: String, trim: true },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Page = mongoose.model("Page", pageSchema);
export default Page;
