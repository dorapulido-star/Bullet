import Habit from "../model/habitModel.js";
import Project from "../model/projectModel.js"; // Importa Project para validar associatedProject

// Funciones utilitarias para validaciones (puedes moverlas a un archivo separado)
const validateHabitData = async (data) => {
  const { habit, frequency, status, notes, associatedProject } = data;

  if (!habit || !frequency || !status) {
    throw new Error("Todos los campos requeridos (hábito, frecuencia, estado) deben estar presentes");
  }

  if (!["Diario", "Semanal", "Mensual", "Ocasional", "2 veces/semana", "3 veces/semana", "Quincenal", "Bimestral", "Anual", "Personalizado"].includes(frequency)) {
    throw new Error("Frecuencia inválida. Usa una de las opciones válidas: Diario, Semanal, Mensual, Ocasional, 2 veces/semana, 3 veces/semana, Quincenal, Bimestral, Anual, o Personalizado");
  }

  if (!["Completado", "Pendiente", "En progreso", "Cancelado", "Reprogramado", "Inspirado"].includes(status)) {
    throw new Error("Estado inválido. Usa Completado, Pendiente, En progreso, Cancelado, Reprogramado, o Inspirado");
  }

  let validatedProject = null;
  if (associatedProject) {
    const project = await Project.findById(associatedProject);
    if (!project) {
      throw new Error(`Proyecto asociado no encontrado: ${associatedProject}`);
    }
    validatedProject = project._id;
  }

  return {
    habit,
    frequency,
    status,
    notes: notes || "", // Notas son opcionales, usa cadena vacía si no se proporciona
    associatedProject: validatedProject,
  };
};

export const createHabit = async (req, res) => {
  try {
    console.log("Datos recibidos en req.body:", req.body);
    console.log("Proyecto asociado (associatedProject):", req.body.associatedProject);

    const habitData = await validateHabitData(req.body);

    const newHabit = new Habit(habitData);
    const savedHabit = await newHabit.save();
    res.status(201).json(savedHabit); // Usar 201 para creación exitosa
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Datos inválidos", error: error.message });
    }
    console.error("Error creating habit:", error);
    res.status(500).json({ message: "Error interno al crear el hábito", error: error.message });
  }
};

export const getAllHabits = async (req, res) => {
  try {
    const habits = await Habit.find().populate('associatedProject');
    if (habits.length === 0) {
      return res.status(200).json({ msg: "No habits found", data: [] });
    }
    res.status(200).json(habits);
  } catch (error) {
    console.error("Error fetching habits:", error);
    res.status(500).json({ message: "Error al obtener los hábitos", error: error.message });
  }
};

export const getOneHabit = async (req, res) => {
  try {
    const id = req.params.id;
    const habit = await Habit.findById(id).populate('associatedProject');
    if (!habit) {
      return res.status(404).json({ msg: "Habit not found" });
    }
    res.status(200).json(habit);
  } catch (error) {
    console.error("Error fetching habit:", error);
    res.status(500).json({ message: "Error al obtener el hábito", error: error.message });
  }
};

export const updateHabit = async (req, res) => {
  try {
    const id = req.params.id;
    const habit = await Habit.findById(id);
    if (!habit) {
      return res.status(404).json({ msg: "Habit not found" });
    }

    const updatedData = await validateHabitData(req.body); // Validar los datos actualizados
    const updatedHabit = await Habit.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).json({ msg: "Habit updated successfully", data: updatedHabit });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Datos inválidos", error: error.message });
    }
    console.error("Error updating habit:", error);
    res.status(500).json({ message: "Error al actualizar el hábito", error: error.message });
  }
};

export const deleteHabit = async (req, res) => {
  try {
    const id = req.params.id;
    const habit = await Habit.findById(id);
    if (!habit) {
      return res.status(404).json({ msg: "Habit not found" });
    }

    await Habit.findByIdAndDelete(id);
    res.status(200).json({ msg: "Habit deleted successfully" });
  } catch (error) {
    console.error("Error deleting habit:", error);
    res.status(500).json({ message: "Error al eliminar el hábito", error: error.message });
  }
};