import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, TextField, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, 
  IconButton, Box, Dialog, DialogTitle, DialogContent, 
  DialogActions, Pagination, InputAdornment, Avatar,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Delete, Edit, Search, Add } from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/employees';

function App() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [open, setOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState({ 
    name: '', email: '', phone: '', department: '', image: '' 
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, [page, search, department]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_URL}?search=${search}&department=${department}&page=${page}`);
      setEmployees(res.data.employees);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpen = (emp = { name: '', email: '', phone: '', department: '', image: '' }) => {
    setCurrentEmployee(emp);
    setIsEditing(!!emp._id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentEmployee({ name: '', email: '', phone: '', department: '', image: '' });
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await axios.put(`${API_URL}/${currentEmployee._id}`, currentEmployee);
      } else {
        await axios.post(API_URL, currentEmployee);
      }
      fetchEmployees();
      handleClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchEmployees();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Employee Directory
        </Typography>

        <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            sx={{ flexGrow: 1 }}
            variant="outlined"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={department}
              label="Department"
              onChange={(e) => setDepartment(e.target.value)}
            >
              <MenuItem value="">All Departments</MenuItem>
              <MenuItem value="Engineering">Engineering</MenuItem>
              <MenuItem value="Sales">Sales</MenuItem>
              <MenuItem value="Marketing">Marketing</MenuItem>
              <MenuItem value="HR">HR</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
            Add Employee
          </Button>
        </Box>

        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Photo</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Department</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp._id}>
                  <TableCell>
                    <Avatar src={emp.image}>{emp.name.charAt(0)}</Avatar>
                  </TableCell>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.phone}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpen(emp)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(emp._id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={(e, v) => setPage(v)} 
          />
        </Box>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Full Name"
              fullWidth
              value={currentEmployee.name}
              onChange={(e) => setCurrentEmployee({ ...currentEmployee, name: e.target.value })}
            />
            <TextField
              label="Email"
              fullWidth
              value={currentEmployee.email}
              onChange={(e) => setCurrentEmployee({ ...currentEmployee, email: e.target.value })}
            />
            <TextField
              label="Phone"
              fullWidth
              value={currentEmployee.phone}
              onChange={(e) => setCurrentEmployee({ ...currentEmployee, phone: e.target.value })}
            />
            <TextField
              label="Image URL"
              fullWidth
              value={currentEmployee.image}
              onChange={(e) => setCurrentEmployee({ ...currentEmployee, image: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={currentEmployee.department}
                label="Department"
                onChange={(e) => setCurrentEmployee({ ...currentEmployee, department: e.target.value })}
              >
                <MenuItem value="Engineering">Engineering</MenuItem>
                <MenuItem value="Sales">Sales</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
                <MenuItem value="HR">HR</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default App;
