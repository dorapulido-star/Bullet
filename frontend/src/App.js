import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Task from './components/gettask/task.jsx';
import Add from './components/addtask/add.jsx';
import Edit from './components/updatetask/edit.jsx';
import Project from './components/project/getproject/project.jsx';
import AddProject from './components/project/addproject/addProject.jsx';
import EditProject from './components/project/updateproject/editproject.jsx';
import Habit from './components/habit/gethabit/habit.jsx'; // Nuevo: componente para listar hábitos
import AddHabit from './components/habit/addhabit/addHabit.jsx'; // Nuevo: componente para añadir hábitos
import EditHabit from './components/habit/updatehabit/edithabit.jsx'; // Nuevo: componente para editar hábitos

import AddExpense from './components/expense/addexpense/addExpense.jsx';
import Expense from './components/expense/getexpense/expense.jsx';
import EditExpense from './components/expense/updateexpense/editexpense.jsx';

import './App.css';

function App() {
  const route = createBrowserRouter([
    {
      path: "/",
      element: <Task />, // Página inicial con tareas
    },
    {
      path: "/add",
      element: <Add />, // Añadir tarea
    },
    {
      path: "/edit/:id",
      element: <Edit />, // Editar tarea
    },
    {
      path: "/project",
      element: <Project />, // Listar proyectos
    },
    {
      path: "/addproject",
      element: <AddProject />, // Añadir proyecto
    },
    {
      path: "/editproject/:id",
      element: <EditProject />, // Editar proyecto
    },
    {
      path: "/habit", // Nueva ruta para listar hábitos
      element: <Habit />,
    },
    {
      path: "/addhabit", // Nueva ruta para añadir hábitos
      element: <AddHabit />,
    },
    {
      path: "/edithabit/:id", // Nueva ruta para editar hábitos
      element: <EditHabit />,
    },
    {
      path: "/expense", // Nueva ruta para listar gastos
      element: <Expense />,
    },
    {
      path: "/addexpense", // Nueva ruta para añadir gastos
      element: <AddExpense />,
    },
    {
      path: "/editexpense/:id", // Nueva ruta para editar gastos
      element: <EditExpense />,
    }

  ]);

  return (
    <div className="App">
      <RouterProvider router={route}></RouterProvider>
    </div>
  );
}

export default App;