import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import AgendarAtendimento from './Pages/AgendarAtendimento';
import Materiais from 'src/Pages/Materiais';
import Cadastro from 'src/Pages/Cadastro';
import Advogado from 'src/Pages/Advogado';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas principais */}
        <Route path="/" element={<Home />} />

        <Route path="/agendaratendimento" element={<AgendarAtendimento />} />
        <Route path="/materiais" element={<Materiais />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Rota para o layout do Advogado */}
        <Route path="/advogado/*" element={<Advogado />} />
      </Routes>
    </Router>
  );
}

export default App;
