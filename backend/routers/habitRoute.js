import express from "express";
import { createHabit, deleteHabit, getAllHabits, getOneHabit, updateHabit } from "../controller/habitController.js";

const route = express.Router();

route.post("/habits", createHabit);
route.get("/habits", getAllHabits);
route.get("/habits/:id", getOneHabit);
route.put("/habits/:id", updateHabit);
route.delete("/habits/:id", deleteHabit);

export default route;