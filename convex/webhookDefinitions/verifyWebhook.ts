import { Webhook } from "svix";

export type ClerkEvent = {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
};

export const verifyWebhook = async (request: Request): Promise<ClerkEvent> => {
  // Get the webhook secret from environment variables
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
      
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    throw new Error("Webhook secret not configured");
  }

  // Get the Svix headers
  const svix_id = request.headers.get("svix-id");
  const svix_timestamp = request.headers.get("svix-timestamp");
  const svix_signature = request.headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing required svix headers");
    throw new Error("Missing required headers");
  }

  // Get the raw body
  const body = await request.text();

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(webhookSecret);

  let evt;
  try {
    // Verify the webhook signature
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook signature:", err);
    throw new Error("Invalid signature");
  }

  console.log("Webhook verified successfully");
  console.log("Received Clerk event:", (evt as { type: string }).type);

  const event = evt as ClerkEvent;

  return event;
}