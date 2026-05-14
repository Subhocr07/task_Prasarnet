import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, TextField, Button, List, ListItem, 
  ListItemText, IconButton, Checkbox, Paper, Box, Select, 
  MenuItem, FormControl, InputLabel, Dialog, DialogTitle, 
  DialogContent, DialogActions, Pagination, InputAdornment, 
  Chip, Tooltip, Divider, Snackbar, Alert, Fade, LinearProgress
} from '@mui/material';
import { 
  DeleteOutline, EditOutlined, SearchOutlined, AddRounded, 
  VisibilityOutlined, TaskAltRounded, HistoryRounded, 
  DoneAllRounded 
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tasks';

// Custom Colors for a more "designed" feel
const COLORS = {
  primary: '#4f46e5', // Indigo
  secondary: '#64748b', // Slate
  success: '#10b981', // Emerald
  warning: '#f59e0b', // Amber
  info: '#3b82f6', // Blue
  background: '#f8fafc'
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState({ title: '', description: '', status: 'pending' });
  const [isEditing, setIsEditing] = useState(false);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchTasks();
  }, [page, search]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}?search=${search}&page=${page}`);
      setTasks(res.data.tasks);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      showSnackbar('Failed to fetch tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpen = (task = { title: '', description: '', status: 'pending' }) => {
    setCurrentTask(task);
    setIsEditing(!!task._id);
    setOpen(true);
  };

  const handleView = (task) => {
    setCurrentTask(task);
    setViewOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setViewOpen(false);
    setCurrentTask({ title: '', description: '', status: 'pending' });
  };

  const handleSubmit = async () => {
    if (!currentTask.title.trim()) {
      showSnackbar('Title is required', 'warning');
      return;
    }
    try {
      if (isEditing) {
        await axios.put(`${API_URL}/${currentTask._id}`, currentTask);
        showSnackbar('Task updated successfully');
      } else {
        await axios.post(API_URL, currentTask);
        showSnackbar('New task added!');
      }
      fetchTasks();
      handleClose();
    } catch (err) {
      showSnackbar('Operation failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        showSnackbar('Task removed', 'info');
        fetchTasks();
      } catch (err) {
        showSnackbar('Delete failed', 'error');
      }
    }
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await axios.put(`${API_URL}/${task._id}`, { ...task, status: newStatus });
      fetchTasks();
      showSnackbar(newStatus === 'completed' ? 'Task completed! 🎉' : 'Task reopened');
    } catch (err) {
      showSnackbar('Status update failed', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'ongoing': return COLORS.info;
      case 'pending': return COLORS.warning;
      default: return COLORS.secondary;
    }
  };

  return (
    <Box sx={{ bgcolor: COLORS.background, minHeight: '100vh', py: 6 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ 
            fontWeight: 800, 
            letterSpacing: '-0.02em',
            color: '#1e293b'
          }}>
            Daily Workflow
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            Stay organized and keep track of your daily progress.
          </Typography>
        </Box>

        <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="What are you looking for?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined sx={{ color: COLORS.secondary }} />
                </InputAdornment>
              ),
              sx: { 
                bgcolor: 'white', 
                borderRadius: 3,
                '& fieldset': { border: 'none' },
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }
            }}
          />
          <Button 
            variant="contained" 
            startIcon={<AddRounded />} 
            onClick={() => handleOpen()}
            sx={{ 
              px: 4, 
              py: 1.5,
              borderRadius: 3, 
              textTransform: 'none', 
              fontSize: '1rem',
              fontWeight: 600,
              bgcolor: COLORS.primary,
              '&:hover': { bgcolor: '#4338ca' },
              boxShadow: '0 10px 15px -3px rgb(79 70 229 / 0.3)'
            }}
          >
            New Task
          </Button>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: COLORS.primary } }} />}

        <Paper elevation={0} sx={{ 
          borderRadius: 4, 
          overflow: 'hidden', 
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
        }}>
          <List sx={{ p: 0 }}>
            {tasks.length === 0 && !loading ? (
              <Box sx={{ p: 8, textAlign: 'center' }}>
                <DoneAllRounded sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>All caught up!</Typography>
                <Typography variant="body2" color="text.disabled">Try creating a new task to fill this space.</Typography>
              </Box>
            ) : (
              tasks.map((task, index) => (
                <Fade in timeout={300 + index * 50} key={task._id}>
                  <Box>
                    <ListItem 
                      sx={{ 
                        py: 2.5, 
                        px: 4,
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: '#f1f5f9' }
                      }}
                    >
                      <Checkbox
                        checked={task.status === 'completed'}
                        onChange={() => toggleStatus(task)}
                        icon={<HistoryRounded />}
                        checkedIcon={<TaskAltRounded sx={{ color: COLORS.success }} />}
                        sx={{ mr: 2 }}
                      />
                      <ListItemText
                        primary={
                          <Typography variant="h6" sx={{ 
                            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                            color: task.status === 'completed' ? '#94a3b8' : '#334155',
                            fontWeight: 600,
                            fontSize: '1.1rem'
                          }}>
                            {task.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: '350px', mt: 0.5 }}>
                            {task.description || 'No description provided.'}
                          </Typography>
                        }
                      />
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip 
                          label={task.status} 
                          size="small" 
                          sx={{ 
                            textTransform: 'uppercase', 
                            fontWeight: 800, 
                            fontSize: '0.65rem',
                            letterSpacing: '0.05em',
                            bgcolor: getStatusColor(task.status),
                            color: 'white',
                            px: 1,
                            minWidth: '90px'
                          }}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton onClick={() => handleView(task)} size="small" sx={{ color: '#94a3b8', '&:hover': { color: '#64748b', bgcolor: '#e2e8f0' } }}>
                              <VisibilityOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Task">
                            <IconButton onClick={() => handleOpen(task)} size="small" sx={{ color: '#94a3b8', '&:hover': { color: COLORS.primary, bgcolor: '#e0e7ff' } }}>
                              <EditOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Task">
                            <IconButton onClick={() => handleDelete(task._id)} size="small" sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444', bgcolor: '#fee2e2' } }}>
                              <DeleteOutline fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </ListItem>
                    {index < tasks.length - 1 && <Divider sx={{ mx: 4, borderColor: '#f1f5f9' }} />}
                  </Box>
                </Fade>
              ))
            )}
          </List>
        </Paper>

        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={(e, v) => setPage(v)} 
            sx={{ 
              '& .MuiPaginationItem-root': { borderRadius: 2, fontWeight: 600 },
              '& .Mui-selected': { bgcolor: `${COLORS.primary} !important`, color: 'white' }
            }}
          />
        </Box>
      </Container>

      {/* Form Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#1e293b' }}>
          {isEditing ? 'Refine Task' : 'New Assignment'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Task Title"
              fullWidth
              autoFocus
              placeholder="e.g. Design meeting, Bug fix..."
              value={currentTask.title}
              onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
              InputProps={{ sx: { borderRadius: 3 } }}
            />
            <TextField
              label="Details (Optional)"
              fullWidth
              multiline
              rows={3}
              placeholder="Describe what needs to be done..."
              value={currentTask.description}
              onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
              InputProps={{ sx: { borderRadius: 3 } }}
            />
            <FormControl fullWidth>
              <InputLabel>Priority/Status</InputLabel>
              <Select
                value={currentTask.status}
                label="Priority/Status"
                onChange={(e) => setCurrentTask({ ...currentTask, status: e.target.value })}
                sx={{ borderRadius: 3 }}
              >
                <MenuItem value="pending">Pending Review</MenuItem>
                <MenuItem value="ongoing">Active Work</MenuItem>
                <MenuItem value="completed">Finished</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleClose} sx={{ color: COLORS.secondary, fontWeight: 600 }}>Discard</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            sx={{ 
              px: 4, 
              borderRadius: 3, 
              bgcolor: COLORS.primary,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={viewOpen} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.25rem' }}>Task Insight</Typography>
          <Chip 
            label={currentTask.status} 
            sx={{ bgcolor: getStatusColor(currentTask.status), color: 'white', fontWeight: 800, fontSize: '0.7rem' }}
          />
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#f1f5f9' }}>
          <Box sx={{ py: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#334155' }}>{currentTask.title}</Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 4, lineHeight: 1.6 }}>
              {currentTask.description || 'This task has no additional details.'}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 0.5 }}>IDENTIFIED ON</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                  {currentTask.created_at ? new Date(currentTask.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 0.5 }}>LAST UPDATE</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                  {currentTask.updated_at ? new Date(currentTask.updated_at).toLocaleTimeString() : 'Recently'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: 3, color: COLORS.secondary, borderColor: '#e2e8f0' }}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<EditOutlined />}
            onClick={() => { setViewOpen(false); setOpen(true); setIsEditing(true); }}
            sx={{ borderRadius: 3, bgcolor: COLORS.primary, textTransform: 'none' }}
          >
            Edit Entry
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ borderRadius: 3, fontWeight: 600, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
