import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home'; // Este deve ser o seu componente da página inicial (Header, Hero, Seções)
import AgendarAtendimento from './Pages/AgendarAtendimento';
import Materiais from './Pages/Materiais';
import Cadastro from './Pages/cadastro'; // Este deve ser o seu componente AuthForm (o formulário de Login/Registo)
import Advogado from './Pages/Advogado';

function App() {
  return (
    <Router>
      <Routes>
        {/*
          ROTA PRINCIPAL: Deve carregar a página inicial completa.
          Se o formulário de Cadastro estiver aparecendo aqui,
          o problema está DENTRO do componente Home (Pages/Home.jsx)
          que deve estar importando e renderizando o componente Cadastro/AuthForm.
        */}
        <Route path="/" element={<Home />} />

        {/* ROTAS SECUNDÁRIAS */}
        <Route path="/Agendaratendimento" element={<AgendarAtendimento />} />
        <Route path="/Materiais" element={<Materiais />} />
        
        {/* ROTA DE CADASTRO/LOGIN: Carrega o AuthForm */}
        <Route path="/Cadastro" element={<Cadastro />} />

        {/* Rota para o layout do Advogado */}
        <Route path="/Advogado/*" element={<Advogado />} />
      </Routes>
    </Router>
  );
}

export default App;