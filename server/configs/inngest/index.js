import { Inngest } from "inngest";
import User from "../../models/User.js";

export const inngest = new Inngest({
  id: "movie-ticket-booking",
});

// Sync user creation
const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    event: "clerk/user.created",
  },
  async ({ event, step }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    await step.run("create-user-in-db", async () => {
      const userData = {
        _id: id,
        email: email_addresses?.[0]?.email_address,
        name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
        image: image_url,
      };
      return await User.create(userData);
    });
  },
);

// Sync user deletion
const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-with-clerk",
    event: "clerk/user.deleted",
  },
  async ({ event, step }) => {
    const { id } = event.data;

    await step.run("delete-user-from-db", async () => {
      return await User.findByIdAndDelete(id);
    });
  },
);

// Sync user update
const syncUserUpdate = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    event: "clerk/user.updated",
  },
  async ({ event, step }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

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
