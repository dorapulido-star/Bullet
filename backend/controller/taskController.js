import Task from "../model/taskModel.js";

// Funciones utilitarias para validaciones (puedes moverlas a un archivo separado)
const validateTaskData = (data) => {
  const { symbol, task, date, priority, notes } = data;

  if (!symbol || !task || !date || !priority) {
    throw new Error("Todos los campos requeridos deben estar presentes");
  }

  if (!["•", "x", ">", "<"].includes(symbol)) {
    throw new Error("Símbolo inválido. Usa •, x, > o <");
  }

  if (!["Alta", "Media", "Baja"].includes(priority)) {
    throw new Error("Prioridad inválida. Usa Alta, Media o Baja");
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new Error("Fecha inválida");
  }

  return { symbol, task, date: parsedDate, priority, notes: notes || "" };
};

export const create = async (req, res) => {
  try {
    const taskData = validateTaskData(req.body);

    const newTask = new Task(taskData);
    const savedTask = await newTask.save();
    res.status(201).json(savedTask); // Usar 201 para creación exitosa
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Datos inválidos", error: error.message });
    }
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Error interno al crear la tarea", error: error.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const tasks = await Task.find();
    if (tasks.length === 0) {
      return res.status(200).json({ msg: "No tasks found", data: [] });
    }
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Error al obtener las tareas", error: error.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const id = req.params.id;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ message: "Error al obtener la tarea", error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    const updatedData = validateTaskData(req.body); // Validar los datos actualizados
    const updatedTask = await Task.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).json({ msg: "Task updated successfully", data: updatedTask });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Datos inválidos", error: error.message });
    }
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Error al actualizar la tarea", error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const id = req.params.id;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    await Task.findByIdAndDelete(id);
    res.status(200).json({ msg: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Error al eliminar la tarea", error: error.message });
  }
};
  

