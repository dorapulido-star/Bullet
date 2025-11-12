import mongoose from "mongoose";

const habitSchema = new mongoose.Schema({
    habit: {
        type: String,
        required: true, // Representa el nombre del hábito, como "Meditar 10 minutos"
    },
    frequency: {
        type: String,
        required: true,
        enum: [
            "Diario",           // Todos los días
            "Semanal",          // Una o más veces por semana, pero no diario
            "Mensual",          // Una o más veces al mes
            "Ocasional",        // Sin frecuencia fija, según necesidad
            "2 veces/semana",   // Ejemplo: dos veces específicas por semana
            "3 veces/semana",   // Ejemplo: tres veces específicas por semana
            "Quincenal",        // Cada 15 días
            "Bimestral",        // Cada dos meses
            "Anual",            // Una vez al año
            "Personalizado",    // Para frecuencias definidas por el usuario
        ],
    },
    status: {
        type: String,
        required: true,
        enum: [
            "Completado",           // Hábito realizado exitosamente
            "Pendiente",            // Hábito no iniciado o no completado
            "En progreso",          // Hábito en curso o parcialmente completado
            "Cancelado",            // Hábito abandonado o no relevante
            "Reprogramado",         // Hábito movido a otra fecha o frecuencia
            "Inspirado",            // Hábito que motiva, pero aún no se ha comenzado
        ],
    },
    notes: {
        type: String,
        required: false, // Notas opcionales, como "Sentí calma, enfocarme mejor"
    },
    associatedProject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project", // Referencia al modelo de proyectos para vincular hábitos con proyectos
        required: false, // Opcional, ya que no todos los hábitos necesariamente estarán asociados a un proyecto
    },
}, {
    timestamps: true, // Agrega campos createdAt y updatedAt automáticamente
});

// Índices para mejorar la búsqueda por hábito
habitSchema.index({ habit: 1 });

export default mongoose.model("Habit", habitSchema);