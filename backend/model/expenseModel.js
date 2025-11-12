import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ["Transporte", "Alimentación", "Educación", "Salud","Servicios", "Otros"], // Ajusta según las categorías que uses
    },
    amount: {
        type: Number,
        required: true,
        min: 0, // Asegura que el monto no sea negativo
    },
    date: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: false, // La descripción puede ser opcional
    },
    associatedProject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: false, // Puede no estar asociado a un proyecto
    },
}, {
    timestamps: true,
});

export default mongoose.model("Expense", expenseSchema);