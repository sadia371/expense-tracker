import { useEffect, useState } from "react";
import { getMyExpenses } from "../api/expense";
import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    Typography,
    Alert
} from "@mui/material";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const [expenses, setExpenses] = useState([]);
    const [expenseLoading, setExpenseLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user, loading } = useAuth();

    useEffect(() => {
        if (!user) return;

        const fetchExpenses = async () => {
            try {
                const res = await getMyExpenses();
                setExpenses(res.data);
            } catch (err) {
                setError("Failed to load expenses");
                toast.error("Failed to load expenses");
            } finally {
                setExpenseLoading(false);
            }
        };

        fetchExpenses();
    }, [user]);

    if (loading || expenseLoading) {
        return (
            <Box className="flex justify-center items-center min-h-screen">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box className="p-6 bg-gray-100 min-h-screen">
            <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: "bold" }}>
                My Expenses
            </Typography>

            {error ? (
                <Alert severity="error">{error}</Alert>
            ) : expenses.length === 0 ? (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "80vh",
                    }}
                >
                    <Typography
                        variant="h6"
                        align="center"
                        sx={{ fontWeight: "bold", color: "text.secondary" }}
                    >
                        No expenses found.
                    </Typography>
                </Box>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {expenses.map((expense) => (
                        <Card key={expense._id}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {expense.category}
                                </Typography>
                                <Typography>Amount: ₹{expense.amount}</Typography>
                                <Typography>
                                    Date: {new Date(expense.date).toLocaleDateString()}
                                </Typography>
                                {expense.notes && (
                                    <Typography color="textSecondary">Note: {expense.notes}</Typography>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </Box>
    );
};

export default Dashboard;
