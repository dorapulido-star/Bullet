import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './add.css';

// Configuración de axios
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 5001, // Ajustado a 5000 ms para consistencia
});

const AddHabit = () => {
  const [habitData, setHabitData] = useState({
    habit: '', // Nombre del hábito
    frequency: 'Diario', // Valor por defecto
    status: 'Pendiente', // Valor por defecto
    notes: '', // Notas opcionales
    associatedProject: '', // ID del proyecto asociado (opcional)
  });
  const [projects, setProjects] = useState([]); // Lista de proyectos disponibles
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/projects'); // Ajusta si el endpoint es diferente
        if (mounted) {
          const validProjects = Array.isArray(response.data)
            ? response.data.map(project => ({
                ...project,
                _id: project._id || project.id || `proj_${Date.now()}`,
              }))
            : [];
          setProjects(validProjects);
          setError(null);
        }
      } catch (error) {
        if (mounted) {
          console.error('Error al obtener proyectos:', error);
          setError(
            'Error al cargar proyectos. Verifica el endpoint /api/projects o asegúrate de que existan proyectos.'
          );
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchProjects();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'frequency') {
      const validFrequencies = [
        'Diario',
        'Semanal',
        'Mensual',
        'Ocasional',
        '2 veces/semana',
        '3 veces/semana',
        'Quincenal',
        'Bimestral',
        'Anual',
        'Personalizado',
      ];
      if (!validFrequencies.includes(value)) {
        setError('Frecuencia inválida. Usa una de las opciones válidas.');
        return;
      }
    }

    if (name === 'status') {
      const validStatuses = [
        'Pendiente',
        'En progreso',
        'Completado',
        'Cancelado',
        'Reprogramado',
        'Inspirado',
      ];
      if (!validStatuses.includes(value)) {
        setError('Estado inválido. Usa una de las opciones válidas.');
        return;
      }
    }

    setHabitData({ ...habitData, [name]: value });
    setError(null);
  };

  const handleProjectSelect = (e) => {
    const projectId = e.target.value;
    setHabitData({ ...habitData, associatedProject: projectId || '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!habitData.habit.trim()) {
      setError('El nombre del hábito es requerido');
      return;
    }
    if (!habitData.frequency) {
      setError('La frecuencia es requerida');
      return;
    }
    if (!habitData.status) {
      setError('El estado es requerido');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Enviando datos del hábito:', habitData);
      const response = await api.post('/habits', {
        ...habitData,
        associatedProject: habitData.associatedProject || null,
      });

      console.log('Hábito creado exitosamente:', response.data);
      alert('Hábito creado exitosamente');
      setHabitData({
        habit: '',
        frequency: 'Diario',
        status: 'Pendiente',
        notes: '',
        associatedProject: '',
      });
      setError(null);
      navigate('/habit');
    } catch (error) {
      console.error('Detalles del error:', error.response ? error.response.data : error.message);
      setError(`Error al crear el hábito: ${error.response?.data?.message || 'Verifica los datos e intenta de nuevo.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="habit-form-container">
      <h2>Agregar Hábito</h2>
      {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
      {isLoading && projects.length === 0 && <p>Cargando proyectos...</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            name="habit"
            placeholder="Nombre del hábito (ej. Meditar 10 minutos)"
            value={habitData.habit}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <select
            name="frequency"
            value={habitData.frequency}
            onChange={handleChange}
            disabled={isLoading}
          >
            {[
              'Diario',
              'Semanal',
              'Mensual',
              'Ocasional',
              '2 veces/semana',
              '3 veces/semana',
              'Quincenal',
              'Bimestral',
              'Anual',
              'Personalizado',
            ].map((freq) => (
              <option key={freq} value={freq}>
                {freq}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            name="status"
            value={habitData.status}
            onChange={handleChange}
            disabled={isLoading}
          >
            {[
              'Pendiente',
              'En progreso',
              'Completado',
              'Cancelado',
              'Reprogramado',
              'Inspirado',
            ].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div>
          <input
            type="text"
            name="notes"
            placeholder="Notas (opcional, ej. Sentí calma)"
            value={habitData.notes}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <div className="project-select-container">
          <label>Seleccionar Proyecto Asociado (opcional)</label>
          {isLoading && projects.length === 0 ? (
            <p>Cargando proyectos...</p>
          ) : projects.length === 0 ? (
            <p>No hay proyectos disponibles</p>
          ) : (
            <select
              value={habitData.associatedProject}
              onChange={handleProjectSelect}
              className="project-select"
              disabled={isLoading}
            >
              <option value="">Ninguno</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.project || 'Proyecto sin nombre'}
                </option>
              ))}
            </select>
          )}
        </div>
        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Agregar Hábito'}
        </button>
      </form>
    </div>
  );
};

export default AddHabit;