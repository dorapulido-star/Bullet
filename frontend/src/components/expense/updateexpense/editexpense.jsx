import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './editexpense.css'; // Importa los estilos específicos para este componente

const EditExpense = () => {
  const { id: expenseId } = useParams();
  const navigate = useNavigate();
  const [expenseData, setExpenseData] = useState({
    category: '',
    amount: '',
    date: '',
    description: '',
    associatedProject: '',
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categories] = useState(['Transporte', 'Alimentación', 'Educación', 'Salud', 'Servicios',"Otros"]);
  const [projects, setProjects] = useState([]);

  const isValidObjectId = (id) => {
    return id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
  };

  const fetchExpense = useCallback(async () => {
    if (!expenseId || !isValidObjectId(expenseId)) {
      setError('ID del gasto no válido. Debe ser un ID de MongoDB de 24 caracteres hex.');
      setIsLoading(false);
      return;
    }

    try {
      const [expenseResponse, projectsResponse] = await Promise.all([
        axios.get(`http://localhost:5001/api/expenses/${expenseId}`),
        axios.get(`http://localhost:5001/api/projects`)
      ]);
      const expense = expenseResponse.data;
      const formattedDate = expense.date 
        ? new Date(expense.date).toISOString().split('T')[0] 
        : '';
      setExpenseData({
        ...expense,
        category: expense.category || '',
        amount: expense.amount || '',
        date: formattedDate,
        description: expense.description || '',
        associatedProject: expense.associatedProject?._id || expense.associatedProject || '',
      });
      setProjects(projectsResponse.data.map(project => ({
        id: project._id,
        name: project.project || 'Proyecto sin nombre'
      })) || []);
      setError(null);
    } catch (error) {
      console.error('Error al obtener el gasto:', error);
      setError(`No se pudo cargar el gasto. Verifica el ID (${expenseId}) o intenta de nuevo. Detalle: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [expenseId]);

  useEffect(() => {
    fetchExpense();
  }, [fetchExpense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpenseData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!expenseId || !isValidObjectId(expenseId)) {
      setError('ID del gasto no válido. No se puede actualizar.');
      return;
    }

    if (expenseData.associatedProject && !isValidObjectId(expenseData.associatedProject)) {
      setError('El ID del proyecto asociado no es válido. Debe ser un ID de MongoDB de 24 caracteres hex o dejarlo vacío.');
      return;
    }

    try {
      const dataToSend = {
        ...expenseData,
        amount: expenseData.amount ? parseFloat(expenseData.amount) : undefined,
        date: expenseData.date || undefined,
        associatedProject: expenseData.associatedProject || undefined,
      };

      console.log('Datos que se enviarán al servidor:', dataToSend);

      const response = await axios.put(`http://localhost:5001/api/expenses/${expenseId}`, dataToSend);
      console.log('Respuesta del servidor:', response.data);

      alert('Gasto actualizado exitosamente');
      navigate('/expense');
    } catch (error) {
      console.error('Error al actualizar el gasto:', error);
      setError(`Error al actualizar el gasto: ${error.response?.data?.message || error.message}`);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  if (isLoading) return <p className="loading-message">Cargando...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="edit-expense-container">
      <h2>Editar Gasto</h2>
      <form className="edit-expense-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category">Categoría</label>
          <select
            id="category"
            name="category"
            value={expenseData.category}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="amount">Monto</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={expenseData.amount}
            onChange={handleChange}
            placeholder="Monto del gasto"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Fecha</label>
          <input
            type="date"
            id="date"
            name="date"
            value={expenseData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <input
            type="text"
            id="description"
            name="description"
            value={expenseData.description}
            onChange={handleChange}
            placeholder="Descripción del gasto"
          />
        </div>

        <div className="form-group">
          <label htmlFor="associatedProject">ID del Proyecto Asociado</label>
          <select
            id="associatedProject"
            name="associatedProject"
            value={expenseData.associatedProject}
            onChange={handleChange}
          >
            <option value="">Sin proyecto</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="submit-button">Guardar Cambios</button>
      </form>
    </div>
  );
};

export default EditExpense;