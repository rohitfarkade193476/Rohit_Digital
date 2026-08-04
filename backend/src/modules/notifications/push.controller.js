import { successResponse, errorResponse } from "../../utils/response.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  getVapidPublicKey,
  isPushConfigured,
  savePushSubscription,
  deletePushSubscription,
} from "./push.service.js";

export const getVapidPublicKeyHandler = asyncHandler(async (req, res) => {
  if (!isPushConfigured()) {
    return errorResponse(res, 503, "Web push is not configured");
  }

  return successResponse(res, 200, "VAPID public key fetched successfully", {
    publicKey: getVapidPublicKey(),
  });
});

export const subscribePushHandler = asyncHandler(async (req, res) => {
  const result = await savePushSubscription(req.user.id, req.body);

  if (result.invalid) {
    return errorResponse(res, 422, "Invalid push subscription payload");
  }

  return successResponse(res, 201, "Push subscription saved successfully");
});

export const unsubscribePushHandler = asyncHandler(async (req, res) => {
  await deletePushSubscription(req.user.id, req.body?.endpoint);

  return successResponse(res, 200, "Push subscription removed successfully");
});
