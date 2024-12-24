import { Toaster } from 'sonner';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import ProtectedRoute from './ProtectedRoute';
import UnauthorizedPage from './UnauthorizedPage';
import SignUpForm from './SignUpForm';

function App() {
  return (
    <>
      <Toaster richColors position="bottom-center" expand={true} />
      <Router>
        <Routes>
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="/login"
            element={<ProtectedRoute noAuthentication  component={LoginPage} />}
          />
          <Route
            path="/"
            element={<ProtectedRoute component={HomePage} />}
          />
        
        </Routes>
      </Router>
    </>
  );
}

export default App;
