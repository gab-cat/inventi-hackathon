import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { handleClerkEvent } from "./webhook";

const http = httpRouter();

http.route({
  path: "/webhook/clerk",
  method: "POST",
  handler: httpAction(handleClerkEvent)
});

export default http;