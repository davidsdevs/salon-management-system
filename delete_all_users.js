const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();

async function deleteAllUsers() {
  try {
    let result = await auth.listUsers(1000);
    while (result.users.length > 0) {
      const uids = result.users.map(user => user.uid);
      console.log(`Deleting ${uids.length} users...`);
      await auth.deleteUsers(uids);

      if (result.pageToken) {
        result = await auth.listUsers(1000, result.pageToken);
      } else {
        break;
      }
    }
    console.log("✅ All users deleted successfully!");
  } catch (error) {
    console.error("Error deleting users:", error);
  }
}

deleteAllUsers();