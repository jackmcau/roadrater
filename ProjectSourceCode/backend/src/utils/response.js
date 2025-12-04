export const sendSuccess = (res, data = {}, status = 200) => {
  return res.status(status).json({ success: true, data });
};

export const sendCreated = (res, data = {}) => sendSuccess(res, data, 201);

export const sendError = (res, error, status = 400, details = undefined) => {
  return res.status(status).json({ success: false, error, details });
};

export default {
  sendSuccess,
  sendCreated,
  sendError,
};