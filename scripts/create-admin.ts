import { auth as clientAuth } from "@/lib/firebase";
import { auth as adminAuth } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma";
import { createUserWithEmailAndPassword } from "firebase/auth";

console.log("Starting create-admin script...");

async function createAdmin(email: string, password: string) {
  try {
    console.log(`Creating admin user with email: ${email}`);
    // Create user in Firebase using client SDK
    const userCredential = await createUserWithEmailAndPassword(clientAuth, email, password);
    const user = userCredential.user;

    // Set custom claims using Admin SDK
    await adminAuth.setCustomUserClaims(user.uid, { admin: true });

    // Create user in database
    const dbUser = await prisma.user.create({
      data: {
        email: email,
        username: email.split("@")[0], // Using email as username for simplicity
        firebaseUid: user.uid,
        role: "ADMIN",
      },
    });

    console.log(`Successfully created admin user: ${email}`);
    return dbUser;
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
}

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Please provide both email and password");
  process.exit(1);
}

createAdmin(email, password)
  .then(() => {
    console.log("Admin user creation process completed.");
    process.exit(0);
  })
  .catch(() => process.exit(1));

