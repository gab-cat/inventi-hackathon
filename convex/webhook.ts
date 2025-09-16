import { api } from "./_generated/api";
import { ActionCtx, mutation } from "./_generated/server";
import {
  handleUserCreatedArgs,
  handleUserCreatedHandler,
  handleUserUpdatedArgs,
  handleUserUpdatedHandler,
  handleUserDeletedArgs,
  handleUserDeletedHandler,
  verifyWebhook,
} from "./webhookDefinitions";

export const handleClerkEvent = async (ctx: ActionCtx, req: Request) => {
  try {
    const event = await verifyWebhook(req);

    switch (event.type) {
    case "user.created": {
      const data = event.data;
      await ctx.runMutation(api.webhook.handleUserCreated, {
        clerkId: data.id,
        email: data.email_addresses?.[0]?.email_address ?? "",
        firstName: data.first_name ?? "",
        lastName: data.last_name ?? "",
        phone: data.phone_numbers?.[0]?.phone_number,
        profileImage: data.image_url ?? data.profile_image_url ?? "",
      });
      break;
    }
    case "user.updated": {
      const data = event.data;
      await ctx.runMutation(api.webhook.handleUserUpdated, {
        clerkId: data.id,
        email: data.email_addresses?.[0]?.email_address,
        firstName: data.first_name,
        lastName: data.last_name,
        phone: data.phone_numbers?.[0]?.phone_number,
        profileImage: data.image_url ?? data.profile_image_url,
      });
      break;
    }
    case "user.deleted": {
      const data = event.data;
      await ctx.runMutation(api.webhook.handleUserDeleted, {
        clerkId: data.id,
      });
      break;
    }
    default:
      throw new Error(`Unsupported event type: ${event.type}`);
    }
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
};

export const handleUserCreated = mutation({
  args: handleUserCreatedArgs,
  handler: handleUserCreatedHandler,
});

export const handleUserUpdated = mutation({
  args: handleUserUpdatedArgs,
  handler: handleUserUpdatedHandler,
});

export const handleUserDeleted = mutation({
  args: handleUserDeletedArgs,
  handler: handleUserDeletedHandler,
});