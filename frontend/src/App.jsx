import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import AddNote from "./pages/AddNote";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import "./App.css";

export default function App() {
  return (
    <div className="shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddNote />} />
        <Route path="/profile/:id" element={<Profile />} />
      </Routes>
    </div>
  );
}
