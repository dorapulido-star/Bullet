import express from "express";
import { createProject, deleteProject, getAllProjects, getOne, update } from "../controller/projectController.js";

const route = express.Router();

route.post("/projects", createProject);
route.get("/projects", getAllProjects);
route.get("/projects/:id", getOne);
route.put("/projects/:id", update);
route.delete("/projects/:id", deleteProject);

export default route;