import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from "axios";
import "../addtask/add.css"; // Cambiado de adduser a addtask
import toast from 'react-hot-toast';

const Edit = () => {
  const initialTaskState = {
    symbol: "",
    task: "",
    date: "",
    priority: "",
    notes: ""
  };

  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(initialTaskState);

  const inputChangeHandler = (e) => {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
  };

  useEffect(() => {
    axios.get(`http://localhost:5001/api/getone/${id}`)
      .then(response => {
        // Aseguramos que la fecha esté en formato correcto para el input tipo date
        const taskData = {
          ...response.data,
          date: new Date(response.data.date).toISOString().split('T')[0]
        };
        setTask(taskData);
      })
      .catch(error => {
        console.log(error);
      });
  }, [id]);

  const submitForm = async (e) => {
    e.preventDefault();
    await axios.put(`http://localhost:5001/api/update/${id}`, task)
      .then((response) => {
        toast.success(response.data.msg, { position: "top-right" });
        navigate("/");
      })
      .catch(error => console.log(error));
  };

  return (
    <div className='addTask'>
      <Link to={"/"}>Back</Link>
      <h3>Update task</h3>
      <form className='addTaskForm' onSubmit={submitForm}>
        <div className='inputGroup'>
          <label htmlFor='symbol'>Symbol</label>
          <select value={task.symbol} onChange={inputChangeHandler} id='symbol' name='symbol'>
            <option value="">Select a symbol</option>
            <option value="•">•</option>
            <option value="x">x</option>
            <option value=">">Migrada</option>
            <option value="<">Agendada</option>
          </select>
        </div>
        <div className='inputGroup'>
          <label htmlFor='task'>Task</label>
          <input type='text' value={task.task} onChange={inputChangeHandler} id='task' name='task' autoComplete='off' placeholder='Task name'/>
        </div>
        <div className='inputGroup'>
          <label htmlFor='date'>Date</label>
          <input type='date' value={task.date} onChange={inputChangeHandler} id='date' name='date' autoComplete='off'/>
        </div>
        <div className='inputGroup'>
          <label htmlFor='priority'>Priority</label>
          <select value={task.priority} onChange={inputChangeHandler} id='priority' name='priority'>
            <option value="">Select priority</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
        <div className='inputGroup'>
          <label htmlFor='notes'>Notes</label>
          <input type='text' value={task.notes || ''} onChange={inputChangeHandler} id='notes' name='notes' autoComplete='off' placeholder='Optional notes'/>
        </div>
        <div className='inputGroup'>
          <button type='submit'>UPDATE TASK</button>
        </div>
      </form>
    </div>
  );
}

export default Edit;