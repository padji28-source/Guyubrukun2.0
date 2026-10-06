import { Router, Request, Response } from "express";
import { VotingModel } from "../db";
import {
  requireRole,
  getScopedRtId,
  logAudit,
  addNotification,
  broadcastEvent
} from "../middleware/auth";

export const votingRouter = Router();

votingRouter.get("/voting", async (req: Request, res: Response) => {
  const rtId = getScopedRtId(req);
  const data = await VotingModel.find({ rtId }).sort({ createdAt: -1 }).lean();
  res.json({ data });
});

votingRouter.post("/voting", requireRole(['admin']), async (req: Request, res: Response) => {
  const rtId = getScopedRtId(req);
  const { title, category, description, deadline, options, status, createdBy } = req.body;

  if (!title || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: "Judul dan minimal 2 opsi pilihan wajib diisi." });
  }

  const newVote = await VotingModel.create({
    id: Date.now().toString(),
    title: String(title).trim(),
    category: category || 'Musyawarah Warga',
    description: description || '',
    deadline: deadline || '',
    options: options.map((opt: any, idx: number) => ({
      id: opt.id || String(idx + 1),
      text: String(opt.text || '').trim(),
      count: 0
    })),
    votes: [],
    status: status || 'aktif',
    createdBy: createdBy || req.user?.nama || 'Ketua RT',
    rtId,
    createdAt: new Date().toISOString()
  });

  await logAudit(rtId, req.user?.nama || 'Ketua RT', "CREATE_VOTING", `Ketua RT membuat voting: ${title}`);
  await addNotification(rtId, `Voting Baru: ${title}`, `Ketua RT membuka voting baru: "${title}". Silakan berikan suara!`, req.user?.nama || 'Ketua RT', 'voting', newVote.id);
  broadcastEvent('update', { type: 'voting', rtId });

  res.json({ message: "Voting berhasil dibuat", data: newVote });
});

votingRouter.put("/voting/:id", requireRole(['admin']), async (req: Request, res: Response) => {
  const rtId = getScopedRtId(req);
  const voteDoc = await VotingModel.findOne({ id: req.params.id, rtId });
  if (!voteDoc) {
    return res.status(404).json({ error: "Voting tidak ditemukan" });
  }

  const { title, category, description, deadline, options, status } = req.body;
  if (title !== undefined) voteDoc.title = String(title).trim();
  if (category !== undefined) voteDoc.category = category;
  if (description !== undefined) voteDoc.description = description;
  if (deadline !== undefined) voteDoc.deadline = deadline;
  if (status !== undefined) voteDoc.status = status;

  if (Array.isArray(options) && options.length >= 2) {
    const validIds = new Set(options.map((o: any, idx: number) => String(o.id || idx + 1)));
    const currentVotes = Array.isArray(voteDoc.votes) ? voteDoc.votes : [];
    const filteredVotes = currentVotes.filter((v: any) => validIds.has(String(v.optionId)));
    voteDoc.votes = filteredVotes;
    voteDoc.options = options.map((opt: any, idx: number) => {
      const optId = String(opt.id || idx + 1);
      const count = filteredVotes.filter((v: any) => String(v.optionId) === optId).length;
      return {
        id: optId,
        text: String(opt.text || '').trim(),
        count
      };
    });
    voteDoc.markModified('votes');
    voteDoc.markModified('options');
  }

  const afterObj = await voteDoc.save();
  await logAudit(rtId, req.user?.nama || "Ketua RT", "UPDATE_VOTING", `Mengupdate sesi voting: ${afterObj?.title}`);
  broadcastEvent('update', { type: 'voting', rtId });

  res.json({ message: "Voting berhasil diperbarui", data: afterObj });
});

votingRouter.delete("/voting/:id", requireRole(['admin']), async (req: Request, res: Response) => {
  const rtId = getScopedRtId(req);
  const voteDoc = await VotingModel.findOne({ id: req.params.id, rtId });
  if (!voteDoc) {
    return res.status(404).json({ error: "Voting tidak ditemukan" });
  }
  await VotingModel.deleteOne({ id: req.params.id, rtId });
  await logAudit(rtId, req.user?.nama || "Ketua RT", "DELETE_VOTING", `Menghapus voting: ${voteDoc.title}`);
  broadcastEvent('update', { type: 'voting', rtId });
  res.json({ message: "Voting berhasil dihapus" });
});

// Vote Cast Endpoint
votingRouter.post("/voting/:id/vote", async (req: Request, res: Response) => {
  const rtId = getScopedRtId(req);
  const { optionId, userId, userName, userBlok } = req.body;
  const voterId = userId || req.user?.id;
  const voterName = userName || req.user?.nama || 'Warga';

  if (!voterId || !optionId) {
    return res.status(400).json({ error: "Identitas pemilih dan opsi pilihan wajib diisi." });
  }

  const voteDoc = await VotingModel.findOne({ id: req.params.id, rtId });
  if (!voteDoc) {
    return res.status(404).json({ error: "Sesi voting tidak ditemukan!" });
  }

  if (voteDoc.status === 'selesai') {
    return res.status(400).json({ error: "Sesi voting ini sudah berakhir." });
  }

  if (voteDoc.deadline && new Date(voteDoc.deadline).getTime() < Date.now()) {
    return res.status(400).json({ error: "Batas waktu voting ini telah berakhir." });
  }

  const existingVoteIndex = voteDoc.votes.findIndex((vt: any) => vt.userId === voterId);

  if (existingVoteIndex !== -1) {
    voteDoc.votes[existingVoteIndex].optionId = optionId;
    if (voterName) voteDoc.votes[existingVoteIndex].userName = voterName;
    if (userBlok) voteDoc.votes[existingVoteIndex].userBlok = userBlok;
    voteDoc.votes[existingVoteIndex].date = new Date().toISOString();
  } else {
    voteDoc.votes.push({
      userId: voterId,
      userName: voterName,
      userBlok: userBlok || '',
      optionId,
      date: new Date().toISOString()
    });
  }

  voteDoc.options = voteDoc.options.map((opt: any) => {
    const totalCount = voteDoc.votes.filter((v: any) => v.optionId === opt.id).length;
    return { ...opt, count: totalCount };
  });

  const updatedVote = await voteDoc.save();
  await logAudit(rtId, voterName, "CAST_VOTE", `Memberikan suara pada voting ${voteDoc.title}`);
  broadcastEvent('update', { type: 'voting', rtId });

  res.json({ message: "Suara berhasil disimpan", data: updatedVote });
});
