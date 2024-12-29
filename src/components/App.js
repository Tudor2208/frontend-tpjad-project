import { Toaster } from 'sonner';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import ProtectedRoute from './ProtectedRoute';
import UnauthorizedPage from './UnauthorizedPage';
import Groups from './Groups';
import SignUpForm from './SignUpForm';
import GroupMembers from './GroupMembers';

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
         <Route
            path="/groups"
            element={<ProtectedRoute component={Groups} />}
          />
           <Route
            path="/group/:groupId"
            element={<ProtectedRoute component={GroupMembers} />}
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
