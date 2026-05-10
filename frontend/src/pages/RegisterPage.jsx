import { useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    IconButton,
    InputAdornment,
    MenuItem,
    Link
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from "react-hot-toast";
import { registerUser } from "../api/auth";
import { useNavigate, Link as RouterLink } from "react-router-dom";

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "employee",
    });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const emailRegex = /^\S+@\S+\.\S+$/;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address");
            return;
        }
        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        try {
            await registerUser(formData);
            toast.success("Registration successful. Please login.");
            navigate("/");
        } catch (err) {
            toast.error(err.response.data.message || "Registration failed");
        }
    };

    return (
        <Container maxWidth="sm" className="py-12">
            <Box className="bg-white p-6 rounded shadow">
                <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: "bold" }}>
                    Register
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        name="name"
                        label="Name"
                        fullWidth
                        margin="normal"
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        name="email"
                        label="Email"
                        fullWidth
                        margin="normal"
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        name="password"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        fullWidth
                        margin="normal"
                        onChange={handleChange}
                        required
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }
                        }}
                    />
                    <TextField
                        select
                        name="role"
                        label="Role"
                        fullWidth
                        margin="normal"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <MenuItem value="employee">Employee</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                    </TextField>

                    <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                        Register
                    </Button>

                    <Box mt={2} textAlign="center">
                        <Typography variant="body2">
                            Already have an account?{" "}
                            <Link
                                component={RouterLink}
                                to="/"
                                underline="hover"
                                sx={{ color: "primary.main", fontWeight: 500 }}
                            >
                                Login
                            </Link>
                        </Typography>
                    </Box>
                </form>
            </Box>
        </Container>
    );
};

export default RegisterPage;
