const Task = require('../models/Task');

// Get all tasks for a user
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.findAll({
            where: { user_id: req.user.id },
            order: [['created_at', 'DESC']]
        });

        // Group tasks by status
        const groupedTasks = {
            'To Do': tasks.filter(task => task.status === 'To Do'),
            'In Progress': tasks.filter(task => task.status === 'In Progress'),
            'Done': tasks.filter(task => task.status === 'Done')
        };

        res.json(groupedTasks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
};

// Create a new task
exports.createTask = async (req, res) => {
    try {
        const { title, status = 'To Do' } = req.body;

        const task = await Task.create({
            title,
            status,
            user_id: req.user.id
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error creating task', error: error.message });
    }
};

// Update task status or title
exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, title } = req.body;

        const task = await Task.findOne({
            where: {
                id,
                user_id: req.user.id
            }
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (status) task.status = status;
        if (title) task.title = title;
        await task.save();

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task', error: error.message });
    }
};

// Delete task (Bonus feature)
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findOne({
            where: {
                id,
                user_id: req.user.id
            }
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await task.destroy();
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task', error: error.message });
    }
}; 