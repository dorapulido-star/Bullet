import express from "express";
import mongoose from "mongoose";
import taskRoutes from "./routers/taskRoute.js";
import projectRoutes from "./routers/projectRoute.js";
import habitRoutes from "./routers/habitRoute.js";
import expenseRoutes from "./routers/expenseRoute.js";
import dotenv from "dotenv";
import cors from "cors";

// Crear una instancia de la aplicación Express
const app = express();

// Middleware
app.use(express.json()); // Para parsear JSON en las peticiones (reemplaza bodyParser)
app.use(cors()); // Habilitar CORS para permitir peticiones desde diferentes orígenes

// Cargar variables de entorno desde .env
dotenv.config();

// Definir el puerto del servidor
const PORT = process.env.PORT || 5000; // Usamos 5000 

// Definir la URL de conexión a MongoDB desde las variables de entorno
const MONGODB_URL = process.env.MONGOURL || 'mongodb://localhost:27017/bulletjournal';

// Conectar a MongoDB usando mongoose
mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("DB connected successfully");

  // Usar las rutas definidas para tareas y proyectos
  app.use("/api", taskRoutes);
  app.use("/api", projectRoutes);
  app.use("/api", habitRoutes);
  app.use("/api", expenseRoutes);

  // Iniciar el servidor
  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
}).catch(error => {
  console.log("Error connecting to MongoDB:", error);
});