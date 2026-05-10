import { useEffect, useState } from "react";
import { fetchAuditLogs } from "../api/audit";
import {
    Box,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Divider,
} from "@mui/material";
import { toast } from "react-hot-toast";

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetchAuditLogs();
                setLogs(res.data.logs || []);
            } catch (err) {
                toast.error("Failed to load audit logs");
                setLogs([]);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    return (
        <Box className="p-6 bg-gray-100 min-h-screen">
            <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: "bold" }}>
                Audit Logs
            </Typography>
            {loading ? (
                <Box className="flex justify-center items-center h-40">
                    <CircularProgress />
                </Box>
            ) : logs.length === 0 ? (
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
                        sx={{ color: "text.secondary" }}
                    >
                        No logs available.
                    </Typography>
                </Box>
            ) : (
                <Box className="grid gap-4 max-w-3xl mx-auto">
                    {logs.map((log) => (
                        <Card key={log._id} elevation={3} className="rounded-lg">
                            <CardContent>
                                <Typography variant="subtitle1" className="font-semibold text-blue-800">
                                    Action: {log.action}
                                </Typography>
                                <Divider className="my-2" />

                                <Typography className="text-sm text-gray-700">
                                    <strong>{log.userRole === "admin" ? "Admin" : "User"} Name:</strong> {log.user?.name || "N/A"}
                                </Typography>
                                <Typography className="text-sm text-gray-700">
                                    <strong>{log.userRole === "admin" ? "Admin" : "User"} Email:</strong> {log.user?.email || "N/A"}
                                </Typography>

                                {log.target && (
                                    <>
                                        <Typography className="text-sm text-gray-700">
                                            <strong>Target Name:</strong> {log.target?.name || "N/A"}
                                        </Typography>
                                        <Typography className="text-sm text-gray-700">
                                            <strong>Target Email:</strong> {log.target?.email || "N/A"}
                                        </Typography>
                                    </>
                                )}

                                <Typography className="text-sm text-gray-700">
                                    <strong>Timestamp:</strong>{" "}
                                    {new Date(log.createdAt).toLocaleString()}
                                </Typography>
                                <Typography className="text-sm text-gray-700">
                                    <strong>Details:</strong> {log.details || "N/A"}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default AuditLogs;
