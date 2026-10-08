import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/guyubrukun";

export function normalizeBlockFromAddress(inputStr: string): string | null {
  if (!inputStr || typeof inputStr !== 'string') return null;
  const s = inputStr.trim();
  if (!s) return null;

  // 1. "Blok A No. 01", "Blok A/01", "Blok A-01", "BLK C 04", "Blok A • No. 01"
  const matchBlok = s.match(/(?:Blok|BLK)\s*([a-zA-Z])\b/i);
  if (matchBlok && matchBlok[1]) {
    return matchBlok[1].toUpperCase();
  }

  // 2. Short codes: "A01", "C04", "D11", "E05", "F22", "A-01", "C/04"
  const matchShort = s.match(/\b([a-zA-Z])\s*[-_/\s.]?\s*(\d+[a-zA-Z]?)\b/);
  if (matchShort && matchShort[1] && matchShort[2]) {
    return matchShort[1].toUpperCase();
  }

  return null;
}

export function resolveRtFromBlock(blockLetter: string | null): string | null {
  if (!blockLetter) return null;
  const b = blockLetter.toUpperCase();
  if (['A', 'C', 'D', 'E', 'F'].includes(b)) {
    return 'rt01';
  }
  return null;
}

const UserSchema = new mongoose.Schema({
  id: String,
  username: String,
  nama: String,
  alamat: String,
  role: String,
  rtId: String
}, { strict: false });

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);

async function runMigration() {
  const args = process.argv.slice(2);
  const isApply = args.includes('--apply');
  const isDryRun = !isApply;

  console.log("=========================================");
  console.log(` MIGRATION RT ISOLATION (${isDryRun ? 'DRY-RUN' : 'APPLY MODE'})`);
  console.log("=========================================");

  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000
  });

  const users = await UserModel.find({ role: { $ne: 'developer' } }).lean();

  const stats = {
    blockA: 0,
    blockC: 0,
    blockD: 0,
    blockE: 0,
    blockF: 0,
    alreadyRt01: 0,
    rt02Unchanged: 0,
    rt03Unchanged: 0,
    unresolved: 0,
    usersToUpdate: 0
  };

  const updatesToApply: { id: string; oldRt: string; newRt: string; reason: string }[] = [];

  for (const user of users) {
    const blockAlamat = normalizeBlockFromAddress(user.alamat || '');
    const blockUser = normalizeBlockFromAddress(user.username || '');
    const block = blockAlamat || blockUser;
    const targetRtFromBlock = resolveRtFromBlock(block);

    if (targetRtFromBlock === 'rt01') {
      if (block === 'A') stats.blockA++;
      else if (block === 'C') stats.blockC++;
      else if (block === 'D') stats.blockD++;
      else if (block === 'E') stats.blockE++;
      else if (block === 'F') stats.blockF++;

      if (user.rtId === 'rt01') {
        stats.alreadyRt01++;
      } else {
        updatesToApply.push({
          id: user.id || user._id.toString(),
          oldRt: user.rtId || 'unassigned',
          newRt: 'rt01',
          reason: `Block ${block} mapped to RT01`
        });
      }
    } else {
      if (user.rtId === 'rt02') {
        stats.rt02Unchanged++;
      } else if (user.rtId === 'rt03') {
        stats.rt03Unchanged++;
      } else if (user.rtId === 'rt01') {
        stats.alreadyRt01++;
      } else {
        stats.unresolved++;
      }
    }
  }

  stats.usersToUpdate = updatesToApply.length;

  console.log("\n[REPORT SUMMARY]");
  console.log(`RT01 from Block A = ${stats.blockA}`);
  console.log(`RT01 from Block C = ${stats.blockC}`);
  console.log(`RT01 from Block D = ${stats.blockD}`);
  console.log(`RT01 from Block E = ${stats.blockE}`);
  console.log(`RT01 from Block F = ${stats.blockF}`);
  console.log(`Already RT01      = ${stats.alreadyRt01}`);
  console.log(`RT02 unchanged   = ${stats.rt02Unchanged}`);
  console.log(`RT03 unchanged   = ${stats.rt03Unchanged}`);
  console.log(`Unresolved       = ${stats.unresolved}`);
  console.log(`Users to update  = ${stats.usersToUpdate}`);

  if (updatesToApply.length > 0) {
    console.log("\n[PENDING USER UPDATES]");
    for (const u of updatesToApply) {
      console.log(` - User ID: ${u.id} | Old RT: ${u.oldRt} -> New RT: ${u.newRt} (${u.reason})`);
    }
  } else {
    console.log("\n[INFO] All Block A/C/D/E/F users are already properly assigned to RT01!");
  }

  if (isApply && updatesToApply.length > 0) {
    console.log("\n[APPLYING MIGRATION...]");
    for (const u of updatesToApply) {
      await UserModel.updateOne({ id: u.id }, { $set: { rtId: u.newRt } });
    }
    console.log(`Successfully updated ${updatesToApply.length} users in database.`);
  } else if (isDryRun) {
    console.log("\n[DRY-RUN COMPLETED] No changes were made to the database.");
    console.log("Run with '--apply' to execute updates.");
  }

  await mongoose.disconnect();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration().catch(err => {
    console.error("Migration error:", err);
    process.exit(1);
  });
}
