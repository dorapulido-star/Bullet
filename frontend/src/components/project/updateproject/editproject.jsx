import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; // Para obtener el ID desde la URL y redirigir
import './editproject.css'; // Importa los estilos específicos para este componente

const EditProject = () => {
  // Obtener el ID del proyecto desde la URL y renombrarlo como projectId para claridad
  const { id: projectId } = useParams();
  const navigate = useNavigate(); // Para redirigir después de guardar
  const [projectData, setProjectData] = useState({
    symbol: '◇', // Símbolo por defecto
    project: '', // Nombre del proyecto
    startDate: '', // Fecha de inicio (formato YYYY-MM-DD)
    endDate: '', // Fecha de fin (formato YYYY-MM-DD)
    status: 'Pendiente', // Estado por defecto
    associatedTasks: [], // Array de IDs o objetos de tareas asociadas
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Función para validar un ObjectId (24 caracteres hex)
  const isValidObjectId = (id) => {
    return id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Fetch del proyecto con validación del ID
  const fetchProject = useCallback(async () => {
    // Validar el ID antes de hacer la solicitud
    if (!projectId || !isValidObjectId(projectId)) {
      setError('ID del proyecto no válido. Debe ser un ID de MongoDB de 24 caracteres hex.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5001/api/projects/${projectId}`);
      const project = response.data;

      // Formatea las fechas para el input type="date" (YYYY-MM-DD)
      const formattedStartDate = project.startDate 
        ? new Date(project.startDate).toISOString().split('T')[0] 
        : '';
      const formattedEndDate = project.endDate 
        ? new Date(project.endDate).toISOString().split('T')[0] 
        : '';

      // Asegúrate de que associatedTasks sea un array de IDs o objetos válidos
      const tasks = Array.isArray(project.associatedTasks) 
        ? project.associatedTasks.map(task => 
            typeof task === 'object' && task._id ? task._id : task
          ).filter(Boolean) // Filtra valores falsy
        : [];

      setProjectData({
        ...project,
        symbol: project.symbol || '◇',
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        status: project.status || 'Pendiente',
        associatedTasks: tasks,
      });
      setError(null);
    } catch (error) {
      console.error('Error al obtener el proyecto:', error);
      setError(`No se pudo cargar el proyecto. Verifica el ID (${projectId}) o intenta de nuevo. Detalle: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Ejecutar fetch cuando el componente se monta o el ID cambia
  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Manejar cambios en los campos de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar cambios en las tareas asociadas (IDs separados por comas)
  const handleTasksChange = (e) => {
    const taskList = e.target.value
      .split(',')
      .map(id => id.trim())
      .filter(id => id && isValidObjectId(id)); // Solo IDs válidos
    setProjectData(prev => ({ ...prev, associatedTasks: taskList }));
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar el ID nuevamente antes de enviar
    if (!projectId || !isValidObjectId(projectId)) {
      setError('ID del proyecto no válido. No se puede actualizar.');
      return;
    }

    try {
      // Preparar datos para enviar al servidor, limpiando valores vacíos
      const dataToSend = {
        ...projectData,
        startDate: projectData.startDate || undefined, // Evita enviar cadenas vacías
        endDate: projectData.endDate || undefined,     // Evita enviar cadenas vacías
        associatedTasks: projectData.associatedTasks.length > 0 
          ? projectData.associatedTasks 
          : undefined, // Evita enviar un array vacío si no hay tareas
      };

      console.log('Datos que se enviarán al servidor:', dataToSend);

      const response = await axios.put(`http://localhost:5001/api/projects/${projectId}`, dataToSend);
      console.log('Respuesta del servidor:', response.data);

      alert('Proyecto actualizado exitosamente');
      navigate('/project'); // Redirige a la lista de proyectos
    } catch (error) {
      console.error('Error al actualizar el proyecto:', error);
      setError(`Error al actualizar el proyecto: ${error.response?.data?.message || error.message}`);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  // Mostrar estado de carga o error
  if (isLoading) return <p className="loading-message">Cargando...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="edit-project-container">
      <h2>Editar Proyecto</h2>
      <form className="edit-project-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="symbol">Símbolo</label>
          <input
            type="text"
            id="symbol"
            name="symbol"
            value={projectData.symbol}
            onChange={handleChange}
            placeholder="Símbolo (e.g., ◇)"
            maxLength={1}
          />
        </div>

        <div className="form-group">
          <label htmlFor="project">Nombre del Proyecto</label>
          <input
            type="text"
            id="project"
            name="project"
            value={projectData.project}
            onChange={handleChange}
            placeholder="Nombre del proyecto"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="startDate">Fecha de Inicio</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={projectData.startDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="endDate">Fecha de Fin</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={projectData.endDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Estado</label>
          <select
            id="status"
            name="status"
            value={projectData.status}
            onChange={handleChange}
            required
          >
            <option value="Pendiente">Pendiente</option>
            <option value="En progreso">En progreso</option>
            <option value="Planificado">Planificado</option>
            <option value="Completado">Completado</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="associatedTasks">IDs de Tareas (separados por comas)</label>
          <input
            type="text"
            id="associatedTasks"
            name="associatedTasks"
            value={projectData.associatedTasks.join(', ')}
            onChange={handleTasksChange}
            placeholder="Ejemplo: 5f7d3a2b9e1c2d3e4f5g6h7i, 5f7d3a2b9e1c2d3e4f5g6h7j"
          />
        </div>

        <button type="submit" className="submit-button">Guardar Cambios</button>
      </form>
    </div>
  );
};

export default EditProject;