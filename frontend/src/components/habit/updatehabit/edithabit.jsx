import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; // Para obtener el ID desde la URL y redirigir
import './edithabit.css'; // Importa los estilos específicos para este componente (crea este archivo CSS según necesites)

// Configuración de axios
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 5000, // Ajustado a 5000 ms para consistencia
});

const EditHabit = () => {
  // Obtener el ID del hábito desde la URL
  const { id: habitId } = useParams();
  const navigate = useNavigate(); // Para redirigir después de guardar
  const [habitData, setHabitData] = useState({
    habit: '', // Nombre del hábito
    frequency: 'Diario', // Valor por defecto
    status: 'Pendiente', // Valor por defecto
    notes: '', // Notas opcionales
    associatedProject: '', // ID del proyecto asociado (opcional)
  });
  const [projects, setProjects] = useState([]); // Lista de proyectos disponibles para el select
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Función para validar un ObjectId (24 caracteres hex)
  const isValidObjectId = (id) => {
    return id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Fetch del hábito con validación del ID
  const fetchHabit = useCallback(async () => {
    // Validar el ID antes de hacer la solicitud
    if (!habitId || !isValidObjectId(habitId)) {
      setError('ID del hábito no válido. Debe ser un ID de MongoDB de 24 caracteres hex.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get(`/habits/${habitId}`);
      const habit = response.data;

      // Asegúrate de que los datos tengan los valores correctos y predeterminados si no existen
      setHabitData({
        habit: habit.habit || '',
        frequency: habit.frequency || 'Diario',
        status: habit.status || 'Pendiente',
        notes: habit.notes || '',
        associatedProject: habit.associatedProject || '',
      });
      setError(null);
    } catch (error) {
      console.error('Error al obtener el hábito:', error);
      setError(`No se pudo cargar el hábito. Verifica el ID (${habitId}) o intenta de nuevo. Detalle: ${error.response?.data?.message || error.message}`);
    }

    // Fetch de proyectos para el select (opcional, como en AddHabit)
    try {
      const projectsResponse = await api.get('/projects');
      const validProjects = Array.isArray(projectsResponse.data)
        ? projectsResponse.data.map(project => ({
            ...project,
            _id: project._id || project.id || `proj_${Date.now()}`,
          }))
        : [];
      setProjects(validProjects);
    } catch (error) {
      console.error('Error al obtener proyectos:', error);
      setError(
        'Error al cargar proyectos. Verifica el endpoint /api/projects o asegúrate de que existan proyectos.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [habitId]);

  // Ejecutar fetch cuando el componente se monta o el ID cambia
  useEffect(() => {
    fetchHabit();
  }, [fetchHabit]);

  // Manejar cambios en los campos
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

  // Manejar cambios en el proyecto asociado
  const handleProjectSelect = (e) => {
    const projectId = e.target.value;
    setHabitData({ ...habitData, associatedProject: projectId || '' });
  };

  // Manejar el envío del formulario para actualizar el hábito
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar el ID nuevamente antes de enviar
    if (!habitId || !isValidObjectId(habitId)) {
      setError('ID del hábito no válido. No se puede actualizar.');
      return;
    }

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

    try {
      // Preparar datos para enviar al servidor, limpiando valores vacíos
      const dataToSend = {
        ...habitData,
        associatedProject: habitData.associatedProject || null, // Envía null si no hay proyecto asociado
      };

      console.log('Datos que se enviarán al servidor:', dataToSend);

      const response = await api.put(`/habits/${habitId}`, dataToSend);
      console.log('Hábito actualizado exitosamente:', response.data);

      alert('Hábito actualizado exitosamente');
      navigate('/habit'); // Redirige a la lista de hábitos
    } catch (error) {
      console.error('Error al actualizar el hábito:', error);
      setError(`Error al actualizar el hábito: ${error.response?.data?.message || 'Verifica los datos e intenta de nuevo.'}`);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  // Mostrar estado de carga o error
  if (isLoading) return <p className="loading-message">Cargando...</p>;
  if (error) return <p className="error-message" style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="habit-form-container">
      <h2>Editar Hábito</h2>
      {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
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
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
};

export default EditHabit;