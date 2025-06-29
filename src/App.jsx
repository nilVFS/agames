
// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import GameList from "./pages/GameList";
import Debts from "./pages/Debts";
import GameDetails from "./pages/GameDetails"; 
import Home from "./pages/Home"
import Login from './pages/Login'
import Register from './pages/Register'
import "./App.css"

function App() {
  return (
    <Router>
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<GameList />} />
          <Route path="/games/:id" element={<GameDetails />}/>
          <Route path="/debts" element={<Debts />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;

