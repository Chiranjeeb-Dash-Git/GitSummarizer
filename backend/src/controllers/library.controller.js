import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import * as history from '../repositories/history.repo.js';
import * as saved from '../repositories/saved.repo.js';

export const listHistory = asyncHandler(async (req, res) => {
  const { items, nextCursor } = await history.list(req.user.id, req.validatedQuery);
  res.json({ data: items, nextCursor });
});

export const deleteHistoryItem = asyncHandler(async (req, res) => {
  const ok = await history.remove(req.user.id, req.params.id);
  if (!ok) throw new AppError(404, 'NOT_FOUND', 'That history entry does not exist.');
  res.status(204).end();
});

export const clearHistory = asyncHandler(async (req, res) => {
  await history.clear(req.user.id);
  res.status(204).end();
});

export const listSaved = asyncHandler(async (req, res) => {
  const [items, tags] = await Promise.all([saved.list(req.user.id, req.validatedQuery), saved.tagsFor(req.user.id)]);
  res.json({ data: items, tags });
});

export const createSaved = asyncHandler(async (req, res) => {
  const item = await saved.upsert(req.user.id, req.body);
  res.status(201).json({ data: item });
});

export const updateSaved = asyncHandler(async (req, res) => {
  const item = await saved.update(req.user.id, req.params.id, req.body);
  if (!item) throw new AppError(404, 'NOT_FOUND', 'That saved summary does not exist.');
  res.json({ data: item });
});

export const deleteSaved = asyncHandler(async (req, res) => {
  const ok = await saved.remove(req.user.id, req.params.id);
  if (!ok) throw new AppError(404, 'NOT_FOUND', 'That saved summary does not exist.');
  res.status(204).end();
});

export const stats = asyncHandler(async (req, res) => {
  res.json({ data: await history.stats(req.user.id) });
});

