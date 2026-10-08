import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/guyubrukun";

export function parseBlockAndNumber(inputStr: string): { block: string; number: string; key: string } | null {
  if (!inputStr) return null;
  const str = inputStr.trim().toUpperCase();

  // Pattern 1: "BLOK A NO. 01" / "BLOK A NO 01" / "BLOK A NOMOR 01" / "BLOK A-01" / "BLOK A/01" / "BLOK A • NO. 01"
  const p1 = str.match(/BLOK\s*([A-Z])\s*[\/\-•\s]*(?:NO\.?|NOMOR)?\s*(\d+[A-Z]?)/i);
  if (p1) {
    const block = p1[1].toUpperCase();
    const num = p1[2].padStart(2, '0');
    return { block, number: num, key: `${block}-${num}` };
  }

  // Pattern 2: "A01" / "C04" / "D11" / "E05" / "F22"
  const p2 = str.match(/^([A-Z])(\d+[A-Z]?)$/i);
  if (p2) {
    const block = p2[1].toUpperCase();
    const num = p2[2].padStart(2, '0');
    return { block, number: num, key: `${block}-${num}` };
  }

  // Pattern 3: "A-01" / "A/01" / "A 01" / "A.01"
  const p3 = str.match(/^([A-Z])\s*[\/\-\.\s]\s*(\d+[A-Z]?)$/i);
  if (p3) {
    const block = p3[1].toUpperCase();
    const num = p3[2].padStart(2, '0');
    return { block, number: num, key: `${block}-${num}` };
  }

  return null;
}

function scoreUser(u: any): number {
  let score = 0;
  // If name is NOT generic "Warga Blok X No. YY"
  if (u.nama && !u.nama.toLowerCase().startsWith('warga blok') && !u.nama.toLowerCase().startsWith('warga rt')) {
    score += 100;
  }
  if (u.isApproved) score += 50;
  if (Array.isArray(u.members) && u.members.length > 0) score += 30;
  if (u.photo) score += 20;
  if (u.noHp && String(u.noHp).length >= 8) score += 10;
  if (u.role && u.role !== 'warga') score += 5;
  return score;
}

const UserSchema = new mongoose.Schema({
  id: String,
  username: String,
  nama: String,
  alamat: String,
  role: String,
  rtId: String,
  createdAt: mongoose.Schema.Types.Mixed
}, { strict: false });

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);

async function run() {
  const isApply = process.argv.includes("--apply");
  console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  const allUsers = await UserModel.find({ role: { $ne: 'developer' } }).lean();
  console.log(`Total non-developer users found: ${allUsers.length}`);

  // Group by parsed Block-Number key across system
  const grouped: Record<string, any[]> = {};

  for (const user of allUsers) {
    const parsedFromAddress = parseBlockAndNumber(user.alamat || '');
    const parsedFromUsername = parseBlockAndNumber(user.username || '');
    const parsed = parsedFromAddress || parsedFromUsername;

    if (parsed) {
      const gKey = parsed.key;
      if (!grouped[gKey]) {
        grouped[gKey] = [];
      }
      grouped[gKey].push({ ...user, houseKey: parsed.key });
    }
  }

  const toDeleteIds: string[] = [];
  let duplicateHouseCount = 0;

  console.log("\n================ DEDUPLICATION PLAN ================");
  for (const [houseKey, users] of Object.entries(grouped)) {
    if (users.length > 1) {
      duplicateHouseCount++;
      // Sort descending by score, then ascending by createdAt
      users.sort((a, b) => {
        const scoreA = scoreUser(a);
        const scoreB = scoreUser(b);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return (new Date(a.createdAt || 0).getTime()) - (new Date(b.createdAt || 0).getTime());
      });

      const keepUser = users[0];
      const duplicates = users.slice(1);

      console.log(`\nHouse [${houseKey}] has ${users.length} accounts:`);
      console.log(`  [KEEP]   ID: ${keepUser.id} | Nama: "${keepUser.nama}" | Username: "${keepUser.username}" | RT: ${keepUser.rtId} | Score: ${scoreUser(keepUser)}`);
      
      for (const dup of duplicates) {
        console.log(`  [DELETE] ID: ${dup.id} | Nama: "${dup.nama}" | Username: "${dup.username}" | RT: ${dup.rtId} | Score: ${scoreUser(dup)}`);
        toDeleteIds.push(dup.id || dup._id);
      }
    }
  }

  console.log(`\nSummary: Found ${duplicateHouseCount} houses with duplicates. Removing ${toDeleteIds.length} duplicate user accounts.`);

  if (isApply) {
    if (toDeleteIds.length > 0) {
      console.log("Applying deletion of duplicate accounts...");
      const result = await UserModel.deleteMany({
        id: { $in: toDeleteIds }
      });
      console.log(`Successfully deleted ${result.deletedCount} duplicate user accounts from MongoDB.`);
    } else {
      console.log("No duplicates to delete.");
    }
  } else {
    console.log("\n[DRY-RUN COMPLETED] Run with '--apply' to execute deletion.");
  }

  await mongoose.disconnect();
}

run().catch(err => {
  console.error("Deduplication error:", err);
  process.exit(1);
});
