import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { filterObject } from "../../../utils/utils.js";
import { stockMovementModel } from "../../../DB/models/StockMovement.model.js";
import { orderModel } from "../../../DB/models/Order.model.js";

const stockMovementPopulate = [
  { path: "book" },
  { path: "seller", select: "-password" },
  { path: "customer", select: "-password" },
];
const bookPopulate = [
  { path: "categories" },
  { path: "author" },
  { path: "createdBy", select: "-password" },
  { path: "updatedBy", select: "-password" },
];

export const total = asyncHandler(async (req, res, next) => {
  const now = new Date();

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const startOfTomorrow = new Date(startOfDay);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const startOfNextYear = new Date(now.getFullYear() + 1, 0, 1);
  const sales = await orderModel.aggregate([
    {
      $group: {
        _id: null,

        daySales: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ["$createdAt", startOfDay] },
                  { $lt: ["$createdAt", startOfTomorrow] },
                ],
              },
              "$total",
              0,
            ],
          },
        },

        monthSales: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ["$createdAt", startOfMonth] },
                  { $lt: ["$createdAt", startOfNextMonth] },
                ],
              },
              "$total",
              0,
            ],
          },
        },

        yearSales: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ["$createdAt", startOfYear] },
                  { $lt: ["$createdAt", startOfNextYear] },
                ],
              },
              "$total",
              0,
            ],
          },
        },
      },
    },
  ]);
  return successResponse({ res, data: sales });
});
