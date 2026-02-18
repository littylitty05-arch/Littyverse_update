import { db } from "./db";
import { creatorProfiles, generatedContent, marketplaceItems, type InsertCreatorProfile, type InsertGeneratedContent, type InsertMarketplaceItem } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Check if creators exist
  const existingCreators = await db.select().from(creatorProfiles).limit(1);
  if (existingCreators.length > 0) {
    console.log("Database already seeded");
    return;
  }

  // Create Creators
  const creators: InsertCreatorProfile[] = [
    {
      userId: "user_1", // Placeholder
      displayName: "LittyMaster",
      bio: "Creating the littiest content in the verse.",
      isVerified: true,
      followersCount: 1200,
      totalEarnings: "5000.00",
    },
    {
      userId: "user_2",
      displayName: "NeonArtist",
      bio: "Cyberpunk aesthetic specialist.",
      isVerified: true,
      followersCount: 850,
      totalEarnings: "2300.50",
    },
  ];

  const createdCreators = await db.insert(creatorProfiles).values(creators).returning();
  console.log(`Created ${createdCreators.length} creators`);
  if (createdCreators.length < 2) {
    throw new Error("Seed expected at least 2 created creators");
  }

  // Create Content
  const content: InsertGeneratedContent[] = [
    {
      userId: "user_1",
      type: "video",
      prompt: "Cyberpunk city at night with neon lights, loop",
      status: "published",
      url: "https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-city-at-night-4022-large.mp4", // Placeholder stock footage
      thumbnailUrl: "https://images.unsplash.com/photo-1555685812-4b943f3db9f0?q=80&w=1000&auto=format&fit=crop",
      isPublic: true,
    },
    {
      userId: "user_2",
      type: "image",
      prompt: "Futuristic samurai warrior",
      status: "published",
      url: "https://images.unsplash.com/photo-1620641788421-7f1c338e4200?q=80&w=1000&auto=format&fit=crop",
      thumbnailUrl: "https://images.unsplash.com/photo-1620641788421-7f1c338e4200?q=80&w=1000&auto=format&fit=crop",
      isPublic: true,
    },
  ];

  await db.insert(generatedContent).values(content);
  console.log("Created content");

  // Create Marketplace Items
  const items: InsertMarketplaceItem[] = [
    {
      creatorId: createdCreators[0].id,
      title: "Neon City Loop Pack",
      description: "5 high-quality looping backgrounds for your streams.",
      price: "15.00",
      category: "overlay",
      thumbnailUrl: "https://images.unsplash.com/photo-1555685812-4b943f3db9f0?q=80&w=1000&auto=format&fit=crop",
    },
    {
      creatorId: createdCreators[1].id,
      title: "Cyber Samurai Model",
      description: "3D model of a futuristic samurai.",
      price: "45.00",
      category: "template",
      thumbnailUrl: "https://images.unsplash.com/photo-1620641788421-7f1c338e4200?q=80&w=1000&auto=format&fit=crop",
    },
  ];

  await db.insert(marketplaceItems).values(items);
  console.log("Created marketplace items");

  console.log("Seeding complete!");
}

seed().catch(console.error);
