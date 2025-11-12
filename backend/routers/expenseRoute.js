import express from "express";
import { createExpense, getAllExpenses, getOne, update, deleteExpense } from "../controller/expenseController.js";  

const route = express.Router();

route.post("/expenses", createExpense);
route.get("/expenses", getAllExpenses);
route.get("/expenses/:id", getOne);
route.put("/expenses/:id", update);
route.delete("/expenses/:id", deleteExpense);

export default route;