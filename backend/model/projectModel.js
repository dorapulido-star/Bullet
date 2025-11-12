import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        enum: ["◇"], // Ajusta según los símbolos que uses
    },
    project: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ["En progreso", "Planificado", "Pendiente", "Completado"],
    },
    associatedTasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: false,
    }],
}, {
    timestamps: true,
});

export default mongoose.model("Project", projectSchema);