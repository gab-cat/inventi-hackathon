import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { verifyWebhook } from "./webhookDefinitions";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/webhook/clerk",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
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
  }),
});

export default http;