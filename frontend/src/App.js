import './App.css';
import Login from './pages/login/Login';
import Register from "./pages/register/Register";
import Search from "./pages/search/Search";
import PostPage from "./pages/post/Post";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Leftbar from "./components/leftbar/Leftbar";
import Rightbar from "./components/rightbar/Rightbar";
import Home from "./pages/home/Home";
import Profile from "./pages/profile/Profile";
import "./style.scss";
import { useContext } from 'react';
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/authContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function App() {
  
  const {currentUser} = useContext(AuthContext);

  const { darkMode } = useContext(DarkModeContext);

  const queryClient = new QueryClient();


  const Layout = () => {
    return (
      <QueryClientProvider client={queryClient}>
      
        <div className={`theme-${darkMode ? "dark" : "light"}`}>
          <Navbar />
          <div style={{ display: "flex" }}>
            <Leftbar />
            <div style={{ flex: 6 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/post/:id" element={<PostPage />} />
                <Route path="/profile/:id" element={<Profile />} />
              </Routes>
            </div>
            <Rightbar />
          </div>
        </div>
      </QueryClientProvider>
    );
  };

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
