import express from "express";
import { create,deleteTask, getAll, getOne, update} from "../controller/taskController.js";

const route = express.Router();

route.post("/create", create);
route.get("/getall",getAll);
route.get("/getone/:id", getOne);
route.put("/update/:id", update);
route.delete("/delete/:id",deleteTask);


export default route;