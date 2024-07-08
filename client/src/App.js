import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import ContractInteraction from './ContractInteraction';
import FundraisingProjects from './FundraisingProjects';
import TokenDistribution from './TokenDistribution';
import TokenTrading from './TokenTrading';

const App = () => {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <img src="/Dream.png" className="App-logo" alt="logo" />
          <h1>CrowdFunding DAPP</h1>
          <nav>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/fundraising">Fundraising Projects</Link></li>
              <li><Link to="/distribution">Token Distribution</Link></li>
              <li><Link to="/trading">Token Trading</Link></li>
            </ul>
          </nav>
        </header>
        <main>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/fundraising" element={<FundraisingProjects />} />
            <Route path="/distribution" element={<TokenDistribution />} />
            <Route path="/trading" element={<TokenTrading />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

const Home = () => (
  <div>
    <ContractInteraction />
    <p className="dream-text">The Starting Point of Your Dreams</p>
  </div>
);

export default App;
