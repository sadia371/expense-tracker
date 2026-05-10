import express from "express";

import {
  addExpense,
  getMyExpenses,
  getAllExpenses,
  updateExpenseStatus,
} from "../controllers/expenseController.js";

import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Employee
router.post("/", protect, addExpense);
router.get("/my", protect, getMyExpenses);

// Admin
router.get("/", protect, isAdmin, getAllExpenses);
router.patch("/:id/status", protect, isAdmin, updateExpenseStatus);

export default router;
