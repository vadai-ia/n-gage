import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // Find the user by email in Supabase Auth
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) { console.error("Error listing users:", listError); return; }

  const target = users.find(u => u.email === "alejandro.martinez.licon@gmail.com");
  if (!target) {
    console.error("User not found in Supabase Auth");
    return;
  }

  console.log("Found user:", target.id, target.email);
  console.log("Current metadata:", JSON.stringify(target.user_metadata, null, 2));

  // Update user metadata with SUPER_ADMIN role
  const { data, error } = await supabase.auth.admin.updateUserById(target.id, {
    user_metadata: {
      ...target.user_metadata,
      role: "SUPER_ADMIN",
    },
  });

  if (error) {
    console.error("Error updating metadata:", error);
    return;
  }

  console.log("\nUpdated metadata:", JSON.stringify(data.user.user_metadata, null, 2));
  console.log("\nDone! User is now SUPER_ADMIN in both DB and Supabase Auth.");
}

main().catch(console.error);
