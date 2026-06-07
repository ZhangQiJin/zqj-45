import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Wardrobe from "@/pages/Wardrobe";
import Transform from "@/pages/Transform";
import Styling from "@/pages/Styling";
import Scenes from "@/pages/Scenes";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-earth-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Wardrobe />} />
            <Route path="/transform" element={<Transform />} />
            <Route path="/styling" element={<Styling />} />
            <Route path="/scenes" element={<Scenes />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
