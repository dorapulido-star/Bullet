import Project from "../model/projectModel.js";
import Task from "../model/taskModel.js"; // Importa Task para validar associatedTasks

// Funciones utilitarias para validaciones (puedes moverlas a un archivo separado)
const validateProjectData = async (data) => {
  const { symbol, project, startDate, endDate, status, associatedTasks } = data;

  if (!symbol || !project || !startDate || !endDate || !status) {
    throw new Error("Todos los campos requeridos deben estar presentes");
  }

  if (!["◇"].includes(symbol)) { // Ajusta según los símbolos que uses para proyectos
    throw new Error("Símbolo inválido. Usa ◇");
  }

  if (!["En progreso", "Planificado", "Pendiente", "Completado"].includes(status)) {
    throw new Error("Estado inválido. Usa En progreso, Planificado, Pendiente o Completado");
  }

  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);
  if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
    throw new Error("Fechas inválidas");
  }

  if (parsedStartDate > parsedEndDate) {
    throw new Error("La fecha de inicio no puede ser posterior a la fecha de fin");
  }

  // Validar tareas asociadas (si se proporcionan) de manera eficiente
  let validatedTasks = [];
  if (associatedTasks && Array.isArray(associatedTasks)) {
    const tasks = await Task.find({ _id: { $in: associatedTasks } });
    if (tasks.length !== associatedTasks.length) {
      const missingIds = associatedTasks.filter(id => !tasks.some(task => task._id.toString() === id));
      throw new Error(`Tareas no encontradas: ${missingIds.join(', ')}`);
    }
    validatedTasks = tasks.map(task => task._id);
  }

  return {
    symbol,
    project,
    startDate: parsedStartDate,
    endDate: parsedEndDate,
    status,
    associatedTasks: validatedTasks
  };
};

export const createProject = async (req, res) => {
  try {
    console.log("Datos recibidos en req.body:", req.body);
    console.log("Tareas asociadas (associatedTasks):", req.body.associatedTasks);

    const projectData = await validateProjectData(req.body);

    const newProject = new Project(projectData);
    const savedProject = await newProject.save();
    res.status(201).json(savedProject); // Usar 201 para creación exitosa
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Datos inválidos", error: error.message });
    }
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Error interno al crear el proyecto", error: error.message });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('associatedTasks');
    if (projects.length === 0) {
      return res.status(200).json({ msg: "No projects found", data: [] });
    }
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Error al obtener los proyectos", error: error.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const id = req.params.id;
    const project = await Project.findById(id).populate('associatedTasks');
    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Error al obtener el proyecto", error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    const updatedData = await validateProjectData(req.body); // Validar los datos actualizados
    const updatedProject = await Project.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).json({ msg: "Project updated successfully", data: updatedProject });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Datos inválidos", error: error.message });
    }
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Error al actualizar el proyecto", error: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const id = req.params.id;
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    await Project.findByIdAndDelete(id);
    res.status(200).json({ msg: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Error al eliminar el proyecto", error: error.message });
  }
};