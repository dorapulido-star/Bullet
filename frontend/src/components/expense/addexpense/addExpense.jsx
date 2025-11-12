import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './add.css';

// Configuración de axios
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 5001,
});

const AddExpense = () => {
  const [expenseData, setExpenseData] = useState({
    category: 'Transporte',
    amount: '',
    date: '',
    description: '',
    associatedProject: '',
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
        const response = await api.get('/projects'); // Corrected endpoint
        if (mounted) {
          const validProjects = Array.isArray(response.data) ? response.data.map(project => ({
            ...project,
            _id: project._id || project.id,
            startDate: project.startDate ? (new Date(project.startDate).toISOString().split('T')[0] || 'Sin fecha') : 'Sin fecha',
          })) : [];
          setProjects(validProjects);
          setError(null);
        }
      } catch (error) {
        if (mounted) {
          console.error('Error al obtener los proyectos:', error);
          setError('Error al cargar los proyectos. Verifica el endpoint /api/projects en el backend o asegúrate de que existan proyectos.');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchProjects();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'amount') {
      if (value && (isNaN(value) || Number(value) < 0)) {
        setError('El monto debe ser un número no negativo');
        return;
      }
    }

    if (name === 'date' && value) {
      const selectedDate = new Date(value);
      if (isNaN(selectedDate.getTime())) {
        setError('Fecha inválida');
        return;
      }
    }

    setExpenseData({ ...expenseData, [name]: value });
    setError(null);
  };

  const handleProjectSelect = (e) => {
    const selectedProjectId = e.target.value;
    setExpenseData({ ...expenseData, associatedProject: selectedProjectId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!expenseData.category || !["Transporte", "Alimentación", "Educación", "Salud", "Servicios", "Otros"].includes(expenseData.category)) {
      setError('La categoría es requerida y debe ser Transporte, Alimentación, Educación, Salud, Servicios u Otros');
      return;
    }
    if (!expenseData.amount || isNaN(expenseData.amount) || Number(expenseData.amount) < 0) {
      setError('El monto debe ser un número no negativo');
      return;
    }
    if (!expenseData.date) {
      setError('La fecha es requerida');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Enviando datos del gasto:', expenseData);

      const response = await api.post('/expenses', {
        ...expenseData,
        amount: Number(expenseData.amount),
        date: expenseData.date,
        associatedProject: expenseData.associatedProject || null,
      });

      console.log('Gasto creado exitosamente:', response.data);
      alert('Gasto creado exitosamente');

      setExpenseData({
      category: 'Transporte', 
        amount: '',
        date: '',
        description: '',
        associatedProject: '',
      });
      setError(null);
      navigate('/expense');
    } catch (error) {
      console.error('Detalles del error:', error.response ? error.response.data : error.message);
      setError(`Error al crear el gasto: ${error.response?.data?.message || 'Verifica los datos e intenta de nuevo.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="expense-form-container">
      <h2>Agregar Gasto</h2>
      {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
      {isLoading && !projects.length && <p>Cargando...</p>}
      <form onSubmit={handleSubmit}>
        <select
          name="category"
          value={expenseData.category}
          onChange={handleChange}
          disabled={isLoading}
        >
          <option value="Transporte">Transporte</option>
          <option value="Alimentación">Alimentación</option>
          <option value="Educación">Educación</option>
          <option value="Salud">Salud</option>
          <option value="Servicios">Servicios</option>
          <option value="Otros">Otros</option>
        </select>
        <input
          type="number"
          name="amount"
          placeholder="Monto"
          value={expenseData.amount}
          onChange={handleChange}
          required
          disabled={isLoading}
          min="0"
        />
        <input
          type="date"
          name="date"
          value={expenseData.date}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
        <input
          type="text"
          name="description"
          placeholder="Descripción (opcional)"
          value={expenseData.description}
          onChange={handleChange}
          disabled={isLoading}
        />
        <div className="project-select-container">
          <label>Seleccionar Proyecto Asociado (opcional)</label>
          {isLoading && projects.length === 0 ? (
            <p>Cargando proyectos...</p>
          ) : projects.length === 0 ? (
            <p>No hay proyectos disponibles</p>
          ) : (
            <select
              name="associatedProject"
              value={expenseData.associatedProject}
              onChange={handleProjectSelect}
              disabled={isLoading}
            >
              <option value="">Ningún proyecto</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.project || 'Proyecto sin nombre'} ({project.startDate})
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
          {isLoading ? 'Guardando...' : 'Agregar Gasto'}
        </button>
      </form>
    </div>
  );
};

export default AddExpense;