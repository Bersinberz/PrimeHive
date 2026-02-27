import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/Auth";
import HomePage from "./pages/User/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;