import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true, // Por ejemplo: "•", "x", ">"
        enum: ["•", "x", ">", "<"], // Opcional: restringe a símbolos específicos
    },
    task: {
        type: String,
        required: true, // Nombre de la tarea, como "Reunión equipo"
    },
    date: {
        type: Date,
        required: true, // Fecha en formato ISO (ej. "2025-02-28")
    },
    priority: {
        type: String,
        required: true, // "Alta", "Media", "Baja"
        enum: ["Alta", "Media", "Baja"], // Opcional: restringe a estas opciones
    },
    notes: {
        type: String,
        required: false, // Notas opcionales, como "Preparar PPT"
    }
}, {
    timestamps: true // Opcional: agrega createdAt y updatedAt automáticamente
});

// Exportamos el modelo
export default mongoose.model("Task", taskSchema);