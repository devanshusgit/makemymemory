// Run this script once to seed initial categories
// Usage: node scripts/seed-categories.js

const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "your-mongodb-uri-here";

const CategorySchema = new mongoose.Schema(
  {
    id:          { type: String, required: true, unique: true },
    title:       { type: String, required: true },
    description: { type: String, default: "" },
    sortOrder:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);

const DEFAULT_CATEGORIES = [
  {
    id: "foil-imprints",
    title: "Foil Imprints",
    description: "Delicate gold & silver foil impressions of tiny hands, feet, and paws — preserved forever.",
    sortOrder: 0,
  },
  {
    id: "3d-casting",
    title: "3D Casting",
    description: "Lifelike three-dimensional casts of hands and feet — a tangible memory you can hold.",
    sortOrder: 1,
  },
];

async function seedCategories() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    for (const cat of DEFAULT_CATEGORIES) {
      const existing = await Category.findOne({ id: cat.id });
      if (!existing) {
        await Category.create(cat);
        console.log(`✓ Created category: ${cat.title}`);
      } else {
        console.log(`- Category already exists: ${cat.title}`);
      }
    }

    console.log("\n✓ Category seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
}

seedCategories();
