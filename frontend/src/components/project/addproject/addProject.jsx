import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './add.css';

// Configuración de axios
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 5001,
});

const AddProject = () => {
  const [projectData, setProjectData] = useState({
    symbol: '◇', // Símbolo de un solo carácter
    project: '',
    startDate: '',
    endDate: '',
    status: 'Pendiente',
    associatedTasks: [], // Arreglo de IDs de tareas
  });
  const [tasks, setTasks] = useState([]); // Lista de tareas disponibles
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        // Intenta obtener tareas desde /api/tasks (ajusta si el endpoint es diferente)
        const response = await api.get('/getall');
        if (mounted) {
          // Asegúrate de que las tareas tengan IDs y fechas válidas
          const validTasks = Array.isArray(response.data) ? response.data.map(task => ({
            ...task,
            _id: task._id || task.id, // Asegúrate de que la tarea tenga un ID
            date: task.date ? (new Date(task.date).toISOString().split('T')[0] || 'Sin fecha') : 'Sin fecha', // Normaliza la fecha o usa un valor por defecto
          })) : [];
          setTasks(validTasks);
          setError(null);
        }
      } catch (error) {
        if (mounted) {
          console.error('Error al obtener las tareas:', error);
          setError('Error al cargar las tareas. Verifica el endpoint /api/tasks en el backend o asegúrate de que existan tareas.');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    
    fetchTasks();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Valida que el símbolo sea un solo carácter
    if (name === 'symbol') {
      if (value.length > 1) {
        setError('El símbolo debe ser un único carácter (por ejemplo, ◇, <, >, ., x, -)');
        return;
      }
    }

    // Valida las fechas
    if (name === 'endDate' && projectData.startDate && value) {
      const start = new Date(projectData.startDate);
      const end = new Date(value);
      if (end < start) {
        setError('La fecha de fin no puede ser anterior a la fecha de inicio');
        return;
      }
    } else if (name === 'startDate' && projectData.endDate && value) {
      const start = new Date(value);
      const end = new Date(projectData.endDate);
      if (start > end) {
        setError('La fecha de inicio no puede ser posterior a la fecha de fin');
        return;
      }
    }

    setProjectData({ ...projectData, [name]: value });
    setError(null); // Limpia el error cuando el usuario hace cambios
  };

  const handleTaskSelect = (e) => {
    const selectedTaskIds = Array.from(e.target.selectedOptions, option => option.value);
    setProjectData({ ...projectData, associatedTasks: selectedTaskIds });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    // Validación básica antes de enviar
    if (!projectData.project.trim()) {
      setError('El nombre del proyecto es requerido');
      return;
    }
    if (!projectData.startDate || !projectData.endDate) {
      setError('Las fechas de inicio y fin son requeridas');
      return;
    }
    if (!projectData.symbol || projectData.symbol.length !== 1) {
      setError('El símbolo debe ser un único carácter');
      return;
    }

    setIsLoading(true);
    try {
      // Registra los datos enviados para depuración
      console.log('Enviando datos del proyecto:', projectData);

      const response = await api.post('/projects', {
        ...projectData,
        startDate: projectData.startDate, // Asegúrate de que el formato de la fecha sea consistente (YYYY-MM-DD)
        endDate: projectData.endDate,
        associatedTasks: projectData.associatedTasks.length > 0 ? projectData.associatedTasks : [], // Asegúrate de enviar un arreglo válido
      });
      
      console.log('Proyecto creado exitosamente:', response.data);
      alert('Proyecto creado exitosamente');
      
      // Reinicia el formulario con un solo símbolo
      setProjectData({
        symbol: '◇',
        project: '',
        startDate: '',
        endDate: '',
        status: 'Pendiente',
        associatedTasks: [],
      });
      setError(null);
      navigate('/project');
    } catch (error) {
      console.error('Detalles del error:', error.response ? error.response.data : error.message);
      setError(`Error al crear el proyecto: ${error.response?.data?.message || 'Verifica los datos e intenta de nuevo.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="project-form-container">
      <h2>Agregar Proyecto</h2>
      {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
      {isLoading && !tasks.length && <p>Cargando...</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="project"
          placeholder="Nombre del proyecto"
          value={projectData.project}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
        <input
          type="date"
          name="startDate"
          value={projectData.startDate}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
        <input
          type="date"
          name="endDate"
          value={projectData.endDate}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
        <select
          name="status"
          value={projectData.status}
          onChange={handleChange}
          disabled={isLoading}
        >
          <option value="Pendiente">Pendiente</option>
          <option value="En progreso">En progreso</option>
          <option value="Planificado">Planificado</option>
          <option value="Completado">Completado</option>
        </select>
        <input
          type="text"
          name="symbol"
          placeholder="Símbolo (por ejemplo, ◇, <, >, ., x, -)"
          value={projectData.symbol}
          onChange={handleChange}
          required
          disabled={isLoading}
          maxLength={1} // Limita a un carácter
        />
        <div className="task-select-container">
          <label>Seleccionar Tareas Asociadas</label>
          {isLoading && tasks.length === 0 ? (
            <p>Cargando tareas...</p>
          ) : tasks.length === 0 ? (
            <p>No hay tareas disponibles</p>
          ) : (
            <select
              multiple
              size="5"
              value={projectData.associatedTasks}
              onChange={handleTaskSelect}
              className="task-select"
              disabled={isLoading}
            >
              {tasks.map(task => (
                <option key={task._id} value={task._id}>
                  {task.task || 'Tarea sin nombre'} ({task.date || 'Sin fecha'})
                </option>
              ))}
            </select>
          )}
        </div>
        <button 
          type="submit" 
          className="submit-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Guardando...' : 'Agregar Proyecto'}
        </button>
      </form>
    </div>
  );
};

export default AddProject;