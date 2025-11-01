import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import AgendarAtendimento from './Pages/AgendarAtendimento';
import Materiais from './Pages/Materiais';
import Cadastro from '../Pages/Cadastro';
import Advogado from './Pages/Advogado';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas principais */}
        <Route path="/" element={<Home />} />

        <Route path="/Agendaratendimento" element={<AgendarAtendimento />} />
        <Route path="/materiais" element={<Materiais />} />
        <Route path="/Cadastro" element={<Cadastro />} />

        {/* Rota para o layout do Advogado */}
        <Route path="/Advogado/*" element={<Advogado />} />
      </Routes>
    </Router>
  );
}

export default App;
