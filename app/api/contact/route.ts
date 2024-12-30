import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { email, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({ error: "Email and message are required" });
    }

    try {
      const contactMessage = await prisma.contactMessage.create({
        data: { email, message },
      });

      return res.status(200).json({ success: "Message stored successfully", contactMessage });
    } catch (error) {
      console.error("Error saving contact message:", error);
      return res.status(500).json({ error: "An error occurred while storing the message" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
