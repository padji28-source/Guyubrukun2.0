import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = JSON.parse(fs.readFileSync(path.resolve('./firebase-applet-config.json'), 'utf-8'));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
const APP_DATA_DOC = doc(db, 'system', 'app_data');

async function run() {
  const snap = await getDoc(APP_DATA_DOC);
  if (snap.exists()) {
    const data = JSON.parse(JSON.stringify(snap.data().data || {}));
    data.iuran = [];
    data.media = [];
    data.surat = [];
    data.laporan = [];
    await setDoc(APP_DATA_DOC, JSON.parse(JSON.stringify({ data })));
    console.log("Iuran, media, surat, laporan cleared!");
    process.exit(0);
  } else {
    console.log("no data");
    process.exit(0);
  }
}
run();
