import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Stack,
  Paper,
  MenuItem,
  TextField,
} from "@mui/material";
import { toast } from "react-hot-toast";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DownloadIcon from "@mui/icons-material/Download";
import { getAllExpenses, updateExpenseStatus } from "../api/expense";
import Papa from "papaparse";
import Grid from '@mui/material/Grid';

const AdminPanel = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    status: "",
    category: "",
    user: "",
    startDate: "",
    endDate: "",
  });

  const fetchAll = async () => {
    try {
      const res = await getAllExpenses();
      setExpenses(res.data);
      setFilteredExpenses(res.data);
    } catch (err) {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateExpenseStatus(id, status);
      toast.success(`Marked as ${status}`);
      fetchAll();
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) {
      toast.error("No expenses to export");
      return;
    }

    const csv = Papa.unparse(
      filteredExpenses.map((e) => ({
        ID: e._id,
        Amount: e.amount,
        Category: e.category,
        Status: e.status,
        "User Name": e.user?.name || "",
        "User Email": e.user?.email || "",
        Date: new Date(e.date).toLocaleDateString(),
        Notes: e.notes || "",
      }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "expenses.csv");
    link.click();
  };

  useEffect(() => {
    const filtered = expenses.filter((expense) => {
      const matchStatus = filters.status
        ? expense.status === filters.status
        : true;

      const matchCategory = filters.category
        ? expense.category === filters.category
        : true;

      const matchUser = filters.user
        ? expense.user?.name
          .toLowerCase()
          .includes(filters.user.toLowerCase())
        : true;

      const expenseDate = new Date(expense.date);
      const matchStartDate = filters.startDate
        ? expenseDate >= new Date(filters.startDate)
        : true;

      const matchEndDate = filters.endDate
        ? expenseDate <= new Date(filters.endDate)
        : true;

      return (
        matchStatus &&
        matchCategory &&
        matchUser &&
        matchStartDate &&
        matchEndDate
      );
    });

    setFilteredExpenses(filtered);
  }, [filters, expenses]);

  useEffect(() => {
    fetchAll();
  }, []);

  const categories = [...new Set(expenses.map((e) => e.category))];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f9fafb", minHeight: "100vh" }}>
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold", mb: 3 }}
      >
        Admin Panel – All Expenses
      </Typography>

      {/* FILTERS */}
      <Paper elevation={1} sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} columns={12} justifyContent="center">
          <Grid sx={{ gridColumn: 'span 2' }}>
            <TextField
              select
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              size="small"
              fullWidth
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
          </Grid>

          <Grid sx={{ gridColumn: 'span 2' }}>
            <TextField
              select
              label="Category"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              size="small"
              fullWidth
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid sx={{ gridColumn: 'span 2' }}>
            <TextField
              label="User Name"
              value={filters.user}
              onChange={(e) => setFilters({ ...filters, user: e.target.value })}
              size="small"
              fullWidth
              sx={{ minWidth: 200 }}
            />
          </Grid>

          <Grid sx={{ gridColumn: 'span 3' }}>
            <TextField
              label="Start Date"
              type="date"
              size="small"
              fullWidth
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              slotProps={{
                inputLabel: { shrink: true }
              }}
              sx={{ minWidth: 200 }}
            />
          </Grid>

          <Grid sx={{ gridColumn: 'span 3' }}>
            <TextField
              label="End Date"
              type="date"
              size="small"
              fullWidth
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              slotProps={{
                inputLabel: { shrink: true }
              }}
              sx={{ minWidth: 200 }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* CSV BUTTON SECTION */}
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleExportCSV}
          startIcon={<DownloadIcon />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
            px: 3,
            py: 1,
          }}
        >
          Export CSV
        </Button>
      </Box>

      {/* EXPENSE LIST */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress size={50} />
        </Box>
      ) : filteredExpenses.length === 0 ? (
        <Typography align="center" color="text.secondary">
          No expenses match the filters.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredExpenses.map((expense) => (
            <Grid key={expense._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {expense.category}
                  </Typography>
                  <Typography color="text.secondary">
                    <strong>Amount:</strong> ₹{expense.amount}
                  </Typography>
                  <Typography color="text.secondary">
                    <strong>Status:</strong>{" "}
                    <span
                      style={{
                        color:
                          expense.status === "approved"
                            ? "green"
                            : expense.status === "rejected"
                              ? "red"
                              : "#666",
                        fontWeight: 600,
                      }}
                    >
                      {expense.status}
                    </span>
                  </Typography>
                  <Typography color="text.secondary">
                    <strong>User:</strong> {expense.user?.name}
                  </Typography>
                  <Typography color="text.secondary">
                    <strong>Email:</strong> {expense.user?.email}
                  </Typography>
                  <Typography color="text.secondary">
                    <strong>Date:</strong>{" "}
                    {new Date(expense.date).toLocaleDateString()}
                  </Typography>
                  {expense.notes && (
                    <Typography color="text.secondary">
                      <strong>Note:</strong> {expense.notes}
                    </Typography>
                  )}
                </Box>

                <Stack direction="row" spacing={2} mt={3}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<CheckCircleIcon />}
                    onClick={() =>
                      handleStatusChange(expense._id, "approved")
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<CancelIcon />}
                    onClick={() =>
                      handleStatusChange(expense._id, "rejected")
                    }
                  >
                    Reject
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AdminPanel;
