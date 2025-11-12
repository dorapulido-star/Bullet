import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "./add.css";
import axios from 'axios';
import toast from 'react-hot-toast';

const Add = () => {
  const tasks = {
    symbol: "",
    task: "",
    date: "",
    priority: "",
    notes: ""
  };
  const [task, setTask] = useState(tasks); 
  const navigate = useNavigate();

  const inputHandler = (e) => {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
  }

  const submitForm = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5001/api/create", task)
      .then((response) => {
        toast.success(response.data.msg, {position: "top-right"})
        navigate("/")
      })
      .catch(error => console.log(error))
  }

  return (
    <div className='addTask'>
      <Link to={"/"}>Back</Link>
      <h3>Add new task</h3>
      <form className='addTaskForm' onSubmit={submitForm}>
        <div className='inputGroup'>
          <label htmlFor='symbol'>Symbol</label>
          <select onChange={inputHandler} id='symbol' name='symbol'>
            <option value="">Select a symbol</option>
            <option value="•">•</option>
            <option value="x">x</option>
            <option value=">">Migrada</option>
            <option value="<">Agendada</option>
          </select>
        </div>
        <div className='inputGroup'>
          <label htmlFor='task'>Task</label>
          <input type='text' onChange={inputHandler} id='task' name='task' autoComplete='off' placeholder='Task name' />
        </div>
        <div className='inputGroup'>
          <label htmlFor='date'>Date</label>
          <input type='date' onChange={inputHandler} id='date' name='date' autoComplete='off' />
        </div>
        <div className='inputGroup'>
          <label htmlFor='priority'>Priority</label>
          <select onChange={inputHandler} id='priority' name='priority'>
            <option value="">Select priority</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
        <div className='inputGroup'>
          <label htmlFor='notes'>Notes</label>
          <input type='text' onChange={inputHandler} id='notes' name='notes' autoComplete='off' placeholder='Optional notes' />
        </div>
        <div className='inputGroup'>
          <button type='submit'>ADD TASK</button>
        </div>
      </form>
    </div>
  );
}

export default Add;