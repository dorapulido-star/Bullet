import Expense from "../model/expenseModel.js";
import Project from "../model/projectModel.js"; // Importa Project para validar associatedProject

// Funciones utilitarias para validaciones
const validateExpenseData = async (data) => {
  const { category, amount, date, description, associatedProject } = data;

  if (!category || !amount || !date) {
    throw new Error("Todos los campos requeridos deben estar presentes");
  }

  if (!["Transporte", "Alimentación", "Educación","Salud", "Servicios", "Otros"].includes(category)) {
    throw new Error("Categoría inválida. Usa Transporte, Alimentación, Educación, Salud, Servicios u Otros");
  }

  if (typeof amount !== "number" || amount < 0) {
    throw new Error("El monto debe ser un número no negativo");
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new Error("Fecha inválida");
  }

  // Validar proyecto asociado (si se proporciona)
  let validatedProject = null;
  if (associatedProject) {
    const project = await Project.findById(associatedProject);
    if (!project) {
      throw new Error(`Proyecto no encontrado: ${associatedProject}`);
    }
    validatedProject = project._id;
  }

  return {
    category,
    amount,
    date: parsedDate,
    description: description || "", // Descripción es opcional
    associatedProject: validatedProject
  };
};

export const createExpense = async (req, res) => {
  try {
    console.log("Datos recibidos en req.body:", req.body);
    console.log("Proyecto asociado (associatedProject):", req.body.associatedProject);

    const expenseData = await validateExpenseData(req.body);

    const newExpense = new Expense(expenseData);
    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Datos inválidos", error: error.message });
    }
    console.error("Error creating expense:", error);
    res.status(500).json({ message: "Error interno al crear el registro de gasto", error: error.message });
  }
};

export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().populate('associatedProject');
    if (expenses.length === 0) {
      return res.status(200).json({ msg: "No expenses found", data: [] });
    }
    res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ message: "Error al obtener los registros de gastos", error: error.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const id = req.params.id;
    const expense = await Expense.findById(id).populate('associatedProject');
    if (!expense) {
      return res.status(404).json({ msg: "Expense not found" });
    }
    res.status(200).json(expense);
  } catch (error) {
    console.error("Error fetching expense:", error);
    res.status(500).json({ message: "Error al obtener el registro de gasto", error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ msg: "Expense not found" });
    }

    const updatedData = await validateExpenseData(req.body);
    const updatedExpense = await Expense.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).json({ msg: "Expense updated successfully", data: updatedExpense });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Datos inválidos", error: error.message });
    }
    console.error("Error updating expense:", error);
    res.status(500).json({ message: "Error al actualizar el registro de gasto", error: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const id = req.params.id;
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ msg: "Expense not found" });
    }

    await Expense.findByIdAndDelete(id);
    res.status(200).json({ msg: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ message: "Error al eliminar el registro de gasto", error: error.message });
  }
};