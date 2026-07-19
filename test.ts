import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

async function main() {
  console.log("DATABASE_URL in process.env:", process.env.DATABASE_URL);
  console.log("Initializing PrismaLibSql adapter factory...");
  try {
    const adapter = new PrismaLibSql({
      url: "file:dev.db",
    });
    
    console.log("Initializing PrismaClient with adapter factory...");
    const prisma = new PrismaClient({ adapter });
    console.log("PrismaClient initialized successfully!");
    
    // Let's try a simple query to ensure database connection is solid!
    console.log("Testing query on Usuario model...");
    const users = await prisma.usuario.findMany();
    console.log("Query completed successfully. User count:", users.length);
  } catch (e) {
    console.error("Initialization/Query failed:", e);
  }
}

main();
