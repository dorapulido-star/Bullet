import React, { useState, useEffect } from 'react';
import { Table, Container, Pagination, Button } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './expense.css';

const usePagination = (items, itemsPerPage = 5) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  let paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item key={number} active={number === currentPage} onClick={() => paginate(number)}>
        {number}
      </Pagination.Item>
    );
  }

  const PaginationComponent = () => (
    <Pagination className="justify-content-center mt-3">
      <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
      <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
      {paginationItems}
      <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
      <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
    </Pagination>
  );

  return { currentItems, PaginationComponent, currentPage, totalPages, paginate };
};

const Expense = () => {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      setIsLoading(true);
      try {
        const expensesResponse = await axios.get('http://localhost:5001/api/expenses');
        const normalizedExpenses = Array.isArray(expensesResponse.data) ? expensesResponse.data.map(expense => ({
          ...expense,
          date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : null,
        })) : [];
        setExpenses(normalizedExpenses);
      } catch (err) {
        console.error('Error al obtener gastos:', err);
        setError(err.response?.status === 404 
          ? 'Error: Endpoint /api/expenses no disponible.'
          : 'Error al cargar los gastos.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const { currentItems: currentExpenses, PaginationComponent } = usePagination(expenses);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/expenses/${id}`);
      setExpenses((prevExpenses) => prevExpenses.filter((expense) => expense._id !== id));
      setError(null);
    } catch (err) {
      console.error('Error al eliminar el gasto:', err);
      setError('Error al eliminar el gasto.');
    }
  };

  const getAssociatedProject = (associatedProject) => {
    if (!associatedProject) {
      return 'Sin proyecto';
    }
    return associatedProject.project || 'Proyecto sin nombre';
  };

  if (isLoading) {
    return <div className="loading">Cargando gastos...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <Container className="expense-container">
      <h2>Lista de Gastos</h2>
      {expenses.length === 0 ? (
        <div>No hay gastos registrados.</div>
      ) : (
        <>
          <Link to="/addexpense" className="btn btn-primary add-expense-btn mb-3">Agregar Gasto</Link>
          <div className="expense-table-container">
            <Table striped bordered hover responsive className="expense-table">
              <thead>
                <tr>
                  <th>S. No.</th>
                  <th>Categoría</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Proyecto Asociado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentExpenses.map((expense, index) => (
                  <tr key={expense._id}>
                    <td>{index + 1}</td>
                    <td>{expense.category || 'Sin categoría'}</td>
                    <td>{expense.amount ? `$${expense.amount.toFixed(2)}` : 'Sin monto'}</td>
                    <td>{expense.date || 'Sin fecha'}</td>
                    <td>{expense.description || 'Sin descripción'}</td>
                    <td>{getAssociatedProject(expense.associatedProject)}</td>
                    <td>
                      <Button variant="danger" onClick={() => handleDelete(expense._id)} className="action-btn me-2">
                        Eliminar
                      </Button>
                      <Link to={`/editexpense/${expense._id}`} className="btn btn-warning action-btn">
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <PaginationComponent />
        </>
      )}
    </Container>
  );
};

export default Expense;