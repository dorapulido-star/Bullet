import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from "react-hot-toast";
import "./task.css";
import { Link } from 'react-router-dom';

const Task = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/getall");
        setTasks(response.data);
      } catch (error) {
        toast.error("Error fetching data", { position: 'top-right' });
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const deleteTask = async (taskId) => {
    try {
      const response = await axios.delete(`http://localhost:5001/api/delete/${taskId}`);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
      toast.success(response.data.msg, { position: 'top-right' });
    } catch (error) {
      toast.error("Error deleting task", { position: 'top-right' });
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className='taskTable'>
      <Link to={"/add"} className='addButton'>Add Task</Link>
      <table border={1} cellPadding={10} cellSpacing={0}>
        <thead>
          <tr>
            <th>S. No.</th>
            <th>Symbol</th>
            <th>Task</th>
            <th>Date</th>
            <th>Priority</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => (
            <tr key={task._id}>
              <td>{index + 1}</td>
              <td>{task.symbol}</td>
              <td>{task.task}</td>
              <td>{new Date(task.date).toLocaleDateString()}</td>
              <td>{task.priority}</td>
              <td>{task.notes || '-'}</td>
              <td className='actionButtons'>
                <button onClick={() => deleteTask(task._id)}><i className="fa-solid fa-trash"></i></button>
                <Link to={`/edit/${task._id}`}><i className="fa-solid fa-pen-to-square"></i></Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Task;