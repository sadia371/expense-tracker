import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Paper,
    useTheme
} from "@mui/material";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    LineChart, Line, CartesianGrid, ResponsiveContainer
} from "recharts";
import { getAllExpenses } from "../api/expense";
import { toast } from "react-hot-toast";

const Insights = () => {
    const theme = useTheme();
    const [categoryData, setCategoryData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const res = await getAllExpenses();
                const expenses = res.data;

                if (!expenses.length) {
                    setCategoryData([]);
                    setMonthlyData([]);
                    return;
                }

                // Category-wise grouping
                const catMap = {};
                expenses.forEach(e => {
                    catMap[e.category] = (catMap[e.category] || 0) + e.amount;
                });

                // Transforming grouped category data into recharts-friendly format
                const category = Object.entries(catMap).map(([category, total]) => ({ category, total }));

                // Month-wise grouping
                const monthMap = {};
                expenses.forEach(e => {
                    const month = new Date(e.date).toLocaleString("default", { month: "short", year: "numeric" });
                    monthMap[month] = (monthMap[month] || 0) + e.amount;
                });
                // Transforming grouped monthly data into recharts-friendly format
                const months = Object.entries(monthMap).map(([month, total]) => ({ month, total }));

                setCategoryData(category);
                setMonthlyData(months);
            } catch (error) {
                toast.error("Failed to fetch insights");
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, []);

    if (loading) {
        return (
            <Box sx={{ minHeight: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!categoryData.length && !monthlyData.length) {
        return (
            <Box sx={{ mt: 5, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    No expense data to display insights.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>

            <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: "bold" }}>
                Expense Insights
            </Typography>

            <Paper elevation={3} sx={{ p: 3, my: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Total Expenses by Category
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryData}>
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total" fill={theme.palette.primary.main} />
                    </BarChart>
                </ResponsiveContainer>
            </Paper>

            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Monthly Expense Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="total"
                            stroke={theme.palette.error.main}
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Paper>
        </Box>
    );
};

export default Insights;
