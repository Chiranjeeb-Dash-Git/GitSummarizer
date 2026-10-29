import { AppError } from '../utils/AppError.js';
export const notFound = (_req, _res, next) => next(new AppError(404, 'NOT_FOUND', 'No such route.'));

