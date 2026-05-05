import { Inngest } from "inngest";
import User from "../../models/User.js";

export const inngest = new Inngest({
  id: "quickshow-app",
});

// Sync user creation
export const syncUserCreation = inngest.createFunction(
  { id: "user-created", event: "clerk/user.created" },
  async ({ event, step }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    await step.run("create-user-in-db", async () => {
      const userData = {
        _id: id,
        email: email_addresses?.[0]?.email_address,
        name: `${first_name ?? ""} ${last_name ?? ""}`.trim() || "New User",
        image: image_url || "",
      };
      return await User.create(userData);
    });
  },
);

// Sync user deletion
export const syncUserDeletion = inngest.createFunction(
  { id: "user-deleted", event: "clerk/user.deleted" },
  async ({ event, step }) => {
    const { id } = event.data;

    await step.run("delete-user-from-db", async () => {
      return await User.findByIdAndDelete(id);
    });
  },
);

// Sync user update
export const syncUserUpdate = inngest.createFunction(
  { id: "user-updated", event: "clerk/user.updated" },
  async ({ event, step }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    await step.run("update-user-in-db", async () => {
      const userData = {
        email: email_addresses?.[0]?.email_address,
        name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
        image: image_url,
      };
      return await User.findByIdAndUpdate(id, userData, { new: true });
    });
  },
);

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdate];
