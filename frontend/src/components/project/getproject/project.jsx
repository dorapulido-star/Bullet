import React, { useState, useEffect } from 'react';
import { Table, Container, Pagination, Button } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './project.css';

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

const Project = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const projectsResponse = await axios.get('http://localhost:5001/api/projects');
        const normalizedProjects = Array.isArray(projectsResponse.data) ? projectsResponse.data.map(project => ({
          ...project,
          associatedTasks: Array.isArray(project.associatedTasks) ? project.associatedTasks : [],
          startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : null,
          endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : null,
        })) : [];
        setProjects(normalizedProjects);
      } catch (err) {
        console.error('Error al obtener proyectos:', err);
        setError(err.response?.status === 404 
          ? 'Error: Endpoint /api/projects no disponible.'
          : 'Error al cargar los proyectos.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const { currentItems: currentProjects, PaginationComponent } = usePagination(projects);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/projects/${id}`);
      setProjects((prevProjects) => prevProjects.filter((project) => project._id !== id));
      setError(null);
    } catch (err) {
      console.error('Error al eliminar el proyecto:', err);
      setError('Error al eliminar el proyecto.');
    }
  };

  const getAssociatedTasks = (associatedTasks) => {
    if (!associatedTasks || !Array.isArray(associatedTasks) || associatedTasks.length === 0) {
      return 'Sin tareas';
    }
    return associatedTasks.map(task => task.task).join(', ') || 'Sin tareas';
  };

  if (isLoading) {
    return <div className="loading">Cargando proyectos...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <Container className="project-container">
      <h2>Lista de Proyectos</h2>
      {projects.length === 0 ? (
        <div>No hay proyectos registrados.</div>
      ) : (
        <>
          <Link to="/addproject" className="btn btn-primary add-project-btn mb-3">Add Project</Link>
          <div className="project-table-container">
            <Table striped bordered hover responsive className="project-table">
              <thead>
                <tr>
                  <th>S. No.</th>
                  <th>Símbolo</th>
                  <th>Proyecto</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Fin</th>
                  <th>Estado</th>
                  <th>Tareas Asociadas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentProjects.map((project, index) => (
                  <tr key={project._id}>
                    <td>{index + 1}</td>
                    <td>{project.symbol || '◇'}</td>
                    <td>{project.project || 'Sin nombre'}</td>
                    <td>{project.startDate || 'Sin fecha'}</td>
                    <td>{project.endDate || 'Sin fecha'}</td>
                    <td>{project.status || 'Pendiente'}</td>
                    <td>{getAssociatedTasks(project.associatedTasks)}</td>
                    <td>
                      <Button variant="danger" onClick={() => handleDelete(project._id)} className="action-btn me-2">
                        Eliminar
                      </Button>
                      <Link to={`/editproject/${project._id}`} className="btn btn-warning action-btn">
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

export default Project;