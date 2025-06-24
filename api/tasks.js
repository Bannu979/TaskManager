import Task from './Task';
import { authenticate } from './_auth';

export default async function handler(req, res) {
  try {
    const user = await authenticate(req);
    if (req.method === 'GET') {
      // Get all tasks for a user
      const tasks = await Task.findAll({
        where: { user_id: user.id },
        order: [['created_at', 'DESC']],
      });
      const groupedTasks = {
        'To Do': tasks.filter((task) => task.status === 'To Do'),
        'In Progress': tasks.filter((task) => task.status === 'In Progress'),
        'Done': tasks.filter((task) => task.status === 'Done'),
      };
      return res.json(groupedTasks);
    } else if (req.method === 'POST') {
      // Create a new task
      const { title, status = 'To Do' } = req.body;
      const task = await Task.create({ title, status, user_id: user.id });
      return res.status(201).json(task);
    } else if (req.method === 'PUT') {
      // Update task status or title
      const { id, status, title } = req.body;
      const task = await Task.findOne({ where: { id, user_id: user.id } });
      if (!task) return res.status(404).json({ message: 'Task not found' });
      if (status) task.status = status;
      if (title) task.title = title;
      await task.save();
      return res.json(task);
    } else if (req.method === 'DELETE') {
      // Delete task
      const { id } = req.body;
      const task = await Task.findOne({ where: { id, user_id: user.id } });
      if (!task) return res.status(404).json({ message: 'Task not found' });
      await task.destroy();
      return res.json({ message: 'Task deleted successfully' });
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    if (error.message === 'Authentication required' || error.message === 'User not found') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error processing request', error: error.message });
  }
} 