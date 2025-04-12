// import './App.css'
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import UsersList from './pages/UsersList.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<UsersList />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  )
}

export default App
