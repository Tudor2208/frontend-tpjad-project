import LoginForm from "./LoginForm";
import '../css/LoginPage.css';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const navigate = useNavigate();

    const handleLogin = async (email, password) => {
        const url = 'http://localhost:8080/api/v1/auth/authenticate';

        const requestBody = {
            email: email,
            password: password
        };

        try {
            const response = await fetch(url, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify(requestBody), 
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('user', JSON.stringify(data));

                navigate("/"); 
                toast.success("Login successful");
            } else {
                toast.error('Invalid credentials!'); 
            }

        } catch (error) {
            console.error('Error during login:', error);
            toast.error('An error occurred while logging in.');
        }
    }

    return (
        <div className="login-page">
            <LoginForm onSubmit={handleLogin}/>
        </div>
    );
}

export default LoginPage;
