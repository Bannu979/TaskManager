import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import { PlusIcon, ArrowRightOnRectangleIcon, UserCircleIcon, CheckCircleIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const statusColors = {
  'To Do': 'from-blue-400 to-blue-600',
  'In Progress': 'from-yellow-400 to-yellow-600',
  'Done': 'from-green-400 to-green-600',
};
const statusOptions = ['To Do', 'In Progress', 'Done'];

const demoTasks = {
  'In Progress': [
    { id: 'demo-inp-1', title: 'Design UI for dashboard', status: 'In Progress', created_at: new Date() },
    { id: 'demo-inp-2', title: 'Write API docs', status: 'In Progress', created_at: new Date() },
  ],
  'Done': [
    { id: 'demo-done-1', title: 'Set up project structure', status: 'Done', created_at: new Date() },
    { id: 'demo-done-2', title: 'Implement authentication', status: 'Done', created_at: new Date() },
  ]
};

const Dashboard = ({ setIsAuthenticated }) => {
  const [tasks, setTasks] = useState({
    'To Do': [],
    'In Progress': [],
    'Done': []
  });
  const [newTask, setNewTask] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStatus, setEditStatus] = useState('To Do');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confetti, setConfetti] = useState(false);
  const confettiRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  useEffect(() => {
    if (!token) {
      setIsAuthenticated(false);
      navigate('/login', { replace: true });
      return;
    }
    fetchTasks();
    // eslint-disable-next-line
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      let loadedTasks = response.data;
      if (
        loadedTasks['In Progress'].length === 0 &&
        loadedTasks['Done'].length === 0 &&
        loadedTasks['To Do'].length === 0
      ) {
        loadedTasks = {
          'To Do': [],
          'In Progress': [...demoTasks['In Progress']],
          'Done': [...demoTasks['Done']]
        };
      }
      setTasks(loadedTasks);
      setLoading(false);
    } catch (err) {
      if (localStorage.getItem('token')) {
        setError('Error fetching tasks');
      }
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e?.preventDefault();
    if (!newTask.trim()) return;
    try {
      const response = await axios.post('/api/tasks', {
        title: newTask,
        status: 'To Do'
      });
      setTasks({
        ...tasks,
        'To Do': [response.data, ...tasks['To Do']]
      });
      setNewTask('');
      setShowModal(false);
    } catch (err) {
      setError('Error adding task');
    }
  };

  const handleEditTask = (task) => {
    setEditTask(task);
    setEditTitle(task.title);
    setEditStatus(task.status);
    setEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    if (String(editTask.id).startsWith('demo')) {
      setTasks((prev) => {
        const newTasks = { ...prev };
        for (const status of statusOptions) {
          newTasks[status] = newTasks[status].filter((t) => t.id !== editTask.id);
        }
        newTasks[editStatus] = [
          { ...editTask, title: editTitle, status: editStatus },
          ...newTasks[editStatus]
        ];
        return newTasks;
      });
      setEditModal(false);
      return;
    }
    try {
      await axios.put(`/api/tasks/${editTask.id}`, { title: editTitle, status: editStatus });
      fetchTasks();
      setEditModal(false);
    } catch (err) {
      setError('Error editing task');
    }
  };

  const handleFinishTask = async (task) => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 1200);
    if (String(task.id).startsWith('demo')) {
      setTasks((prev) => {
        const newToDo = prev['To Do'].filter((t) => t.id !== task.id);
        const newDone = [
          { ...task, status: 'Done', created_at: new Date() },
          ...prev['Done']
        ];
        return { ...prev, 'To Do': newToDo, 'Done': newDone };
      });
      return;
    }
    try {
      await axios.put(`/api/tasks/${task.id}`, { status: 'Done' });
      setTasks((prev) => {
        const newToDo = prev['To Do'].filter((t) => t.id !== task.id);
        const newDone = [
          { ...task, status: 'Done', created_at: new Date() },
          ...prev['Done']
        ];
        return { ...prev, 'To Do': newToDo, 'Done': newDone };
      });
    } catch (err) {
      setError('Error finishing task');
    }
  };

  const handleDeleteTask = async (taskToDelete) => {
    if (!window.confirm(`Are you sure you want to delete "${taskToDelete.title}"?`)) {
      return;
    }
    setTasks((prev) => ({
      ...prev,
      Done: prev.Done.filter((task) => task.id !== taskToDelete.id),
    }));
    if (String(taskToDelete.id).startsWith('demo')) {
      return;
    }
    try {
      await axios.delete(`/api/tasks/${taskToDelete.id}`);
    } catch (err) {
      setError('Error deleting task. Please refresh.');
      fetchTasks();
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;
    const newTasks = { ...tasks };
    const [movedTask] = newTasks[sourceStatus].splice(source.index, 1);
    newTasks[destStatus].splice(destination.index, 0, movedTask);
    setTasks(newTasks);
    if (String(movedTask.id).startsWith('demo')) return;
    try {
      await axios.put(`/api/tasks/${movedTask.id}`, {
        status: destStatus
      });
    } catch (err) {
      setError('Error updating task');
      fetchTasks();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  // Confetti animation
  useEffect(() => {
    if (confetti && confettiRef.current) {
      const canvas = confettiRef.current;
      const ctx = canvas.getContext('2d');
      const w = canvas.width = window.innerWidth;
      const h = canvas.height = window.innerHeight;
      const pieces = Array.from({ length: 60 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * 0.3,
        r: Math.random() * 8 + 4,
        d: Math.random() * 40 + 10,
        color: `hsl(${Math.random() * 360}, 80%, 60%)`,
        tilt: Math.random() * 10 - 10
      }));
      let frame = 0;
      function draw() {
        ctx.clearRect(0, 0, w, h);
        pieces.forEach((p, i) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
          ctx.fillStyle = p.color;
          ctx.fill();
          p.y += Math.cos(frame + i) + 2 + p.d / 20;
          p.x += Math.sin(frame) * 2;
          if (p.y > h) p.y = 0;
        });
        frame++;
        if (confetti) requestAnimationFrame(draw);
      }
      draw();
    }
  }, [confetti]);

  // Filtered tasks by search
  const filteredTasks = {};
  for (const status of statusOptions) {
    filteredTasks[status] = tasks[status].filter((task) =>
      task.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent relative overflow-x-hidden">
      {confetti && <canvas ref={confettiRef} className="fixed inset-0 pointer-events-none z-[100]" />}
      {/* Header */}
      <header className="bg-white/30 backdrop-blur-md shadow-lg rounded-b-2xl border-b border-white/40">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <UserCircleIcon className="h-10 w-10 text-blue-600 drop-shadow animate-bounce" />
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight drop-shadow animate-fade-in">Task Manager</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-700 font-semibold bg-white/40 px-4 py-2 rounded-xl shadow transition-all duration-200"
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8">
        {/* Add Task Button & Search */}
        <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h2 className="text-2xl font-bold text-white drop-shadow animate-slide-in">Your Tasks</h2>
          <input
            type="text"
            placeholder="Search tasks..."
            className="input-field max-w-xs shadow animate-fade-in"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="btn-primary flex items-center gap-2 animate-bounce"
            onClick={() => setShowModal(true)}
          >
            <PlusIcon className="h-5 w-5" />
            Add Task
          </button>
        </div>

        {/* Modal for Adding Task */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
            <div className="bg-white/90 rounded-2xl p-8 shadow-2xl w-full max-w-md animate-slide-in relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Add a New Task</h3>
              <form onSubmit={handleAddTask} className="flex flex-col gap-4">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Task title..."
                  className="input-field"
                  autoFocus
                />
                <button type="submit" className="btn-primary flex items-center gap-2 justify-center animate-pulse">
                  <PlusIcon className="h-5 w-5" />
                  Add Task
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal for Editing Task */}
        {editModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
            <div className="bg-white/90 rounded-2xl p-8 shadow-2xl w-full max-w-md animate-slide-in relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setEditModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Edit Task</h3>
              <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Task title..."
                  className="input-field"
                  autoFocus
                />
                <select
                  className="input-field"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <button type="submit" className="btn-primary flex items-center gap-2 justify-center animate-pulse">
                  <PencilSquareIcon className="h-5 w-5" />
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative animate-fade-in">
            {error}
          </div>
        )}

        {/* Task Columns */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {statusOptions.map((status) => (
              <div key={status} className="space-y-4">
                <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2 animate-fade-in">
                  <span className={`status-badge bg-gradient-to-r ${statusColors[status]}`}>{status}</span>
                </h2>
                <Droppable droppableId={status}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="task-column min-h-[300px] animate-fade-in"
                    >
                      {filteredTasks[status].length === 0 && (
                        <div className="empty-state animate-fade-in">
                          <span className="text-4xl">✨</span>
                          <span>No tasks here yet!</span>
                        </div>
                      )}
                      {filteredTasks[status].map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="task-card animate-fade-in group relative"
                            >
                              <div className="flex items-center gap-2">
                                <span className={`status-badge bg-gradient-to-r ${statusColors[task.status]}`}>{task.status}</span>
                                <button
                                  className="ml-2 btn-secondary flex items-center gap-1 shadow-lg hover:scale-110 transition-transform duration-200"
                                  onClick={() => handleEditTask(task)}
                                  style={{ position: 'static' }}
                                >
                                  <PencilSquareIcon className="h-5 w-5 text-blue-600" />
                                </button>
                                <span className="text-xs text-gray-400 ml-auto">{new Date(task.created_at).toLocaleDateString()}</span>
                              </div>
                              <h3 className="text-gray-900 font-semibold text-lg mt-1 mb-1 break-words group-hover:scale-105 transition-transform duration-200">{task.title}</h3>
                              {status === 'To Do' && (
                                <button
                                  className="absolute bottom-3 right-3 btn-secondary flex items-center gap-1 shadow-lg animate-pulse hover:scale-110 transition-transform duration-200"
                                  onClick={() => handleFinishTask(task)}
                                >
                                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                  Finish
                                </button>
                              )}
                              {status === 'Done' && (
                                <button
                                  className="absolute bottom-3 right-3 btn-secondary flex items-center gap-1 shadow-lg animate-pulse hover:scale-110 transition-transform duration-200"
                                  onClick={() => handleDeleteTask(task)}
                                >
                                  <TrashIcon className="h-5 w-5 text-red-600" />
                                  Delete
                                </button>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </main>
    </div>
  );
};

export default Dashboard; 