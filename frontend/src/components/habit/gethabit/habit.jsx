import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Container, Table } from 'react-bootstrap';
import './habit.css';

const Habit = () => {
  const [habits, setHabits] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const habitsResponse = await axios.get('http://localhost:5001/api/habits');

        const normalizedHabits = Array.isArray(habitsResponse.data)
          ? habitsResponse.data.map((habit) => ({
              ...habit,
              createdAt: habit.createdAt ? new Date(habit.createdAt).toISOString().split('T')[0] : null,
              associatedProject: habit.associatedProject ? habit.associatedProject : null,
            }))
          : [];

        setHabits(normalizedHabits);
        setError(null);
      } catch (error) {
        console.error('Error al obtener datos:', error);
        if (error.response && error.response.status === 404) {
          setError('Error: El endpoint /api/habits no está disponible. Verifica el backend.');
        } else {
          setError('Error al cargar los datos. Verifica la conexión al backend o intenta de nuevo.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      await axios.delete(`http://localhost:5001/api/habits/${id}`);
      setHabits(habits.filter((habit) => habit._id !== id));
      setError(null);
    } catch (error) {
      console.error('Error al eliminar el hábito:', error);
      setError('Error al eliminar el hábito. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectName = (associatedProject) => {
    if (!associatedProject) return 'Sin proyecto asociado';
    return associatedProject.project || 'Proyecto sin nombre';
  };

  return (
    <Container className="habit-container mt-4">
      <h2 className="text-center mb-4">Lista de Hábitos</h2>
      {isLoading ? (
        <p className="text-center">Cargando...</p>
      ) : error ? (
        <p className="error-message text-center" style={{ color: 'red' }}>
          {error}
        </p>
      ) : (
        <>
          <Link to="/addhabit" className="add-habit-btn btn btn-primary mb-3">
            Añadir Hábito
          </Link>
          {habits.length === 0 ? (
            <div className="text-center">No hay hábitos registrados.</div>
          ) : (
            <div className="habit-table-container">
              <Table striped bordered hover responsive className="habit-table">
                <thead>
                  <tr>
                    <th>S. No.</th>
                    <th>Hábito</th>
                    <th>Frecuencia</th>
                    <th>Estado</th>
                    <th>Notas</th>
                    <th>Proyecto Asociado</th>
                    <th>Fecha Creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {habits.map((habit, index) => (
                    <tr key={habit._id}>
                      <td>{index + 1}</td>
                      <td>{habit.habit || 'Sin nombre'}</td>
                      <td>{habit.frequency || 'Sin frecuencia'}</td>
                      <td>{habit.status || 'Pendiente'}</td>
                      <td>{habit.notes || 'Sin notas'}</td>
                      <td>{getProjectName(habit.associatedProject)}</td>
                      <td>{habit.createdAt || 'Sin fecha'}</td>
                      <td>
                        <Link to={`/edithabit/${habit._id}`} className="action-btn edit btn btn-warning me-2">
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(habit._id)}
                          className="action-btn delete btn btn-danger"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default Habit;