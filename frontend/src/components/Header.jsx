import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Tooltip,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddIcon from "@mui/icons-material/Add";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ListAltIcon from "@mui/icons-material/ListAlt";
import InsightsIcon from "@mui/icons-material/Insights";
import { useAuth } from "../context/AuthContext";

const Header = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <AppBar position="static" sx={{ mb: 4 }}>
            <Toolbar
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                }}
            >
                <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", cursor: "pointer" }}
                    onClick={() => navigate("/dashboard")}
                >
                    TeamExpenseTracker
                </Typography>

                {token ? (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: isMobile ? 1 : 2,
                            flexWrap: "wrap",
                        }}
                    >
                        {/* Navigation */}
                        {isMobile ? (
                            <>
                                <Tooltip title="Dashboard">
                                    <IconButton component={RouterLink} to="/dashboard" color="inherit">
                                        <DashboardIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Add Expense">
                                    <IconButton component={RouterLink} to="/add-expense" color="inherit">
                                        <AddIcon />
                                    </IconButton>
                                </Tooltip>
                                {user?.role === "admin" && (
                                    <>
                                        <Tooltip title="Admin Panel">
                                            <IconButton component={RouterLink} to="/admin" color="inherit">
                                                <AdminPanelSettingsIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Audit Logs">
                                            <IconButton component={RouterLink} to="/audit-logs" color="inherit">
                                                <ListAltIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Insights">
                                            <IconButton component={RouterLink} to="/insights" color="inherit">
                                                <InsightsIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <Button component={RouterLink} to="/dashboard" color="inherit">
                                    Dashboard
                                </Button>
                                <Button component={RouterLink} to="/add-expense" color="inherit">
                                    Add Expense
                                </Button>
                                {user?.role === "admin" && (
                                    <>
                                        <Button component={RouterLink} to="/admin" color="inherit">
                                            Admin Panel
                                        </Button>
                                        <Button component={RouterLink} to="/audit-logs" color="inherit">
                                            Audit Logs
                                        </Button>
                                        <Button component={RouterLink} to="/insights" color="inherit">
                                            Insights
                                        </Button>
                                    </>
                                )}
                            </>
                        )}

                        {/* User Info */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <PersonIcon sx={{ fontSize: isMobile ? 18 : 22 }} />
                            <Typography
                                sx={{
                                    fontSize: isMobile ? "0.8rem" : "1rem",
                                    fontWeight: 500,
                                }}
                            >
                                {user?.name}
                            </Typography>

                            <Tooltip title="Logout">
                                <IconButton onClick={handleLogout} color="inherit">
                                    <LogoutIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                ) : (
                    <Box>
                        <Button component={RouterLink} to="/" color="inherit" startIcon={<LoginIcon />}>
                            Login
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;
