import {
  //BrowserRouter as Router,
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import React ,{useState,useEffect}from 'react'

import './App.css';
import Home from './pages/Home';
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer"
import Register from "./pages/Register";

import Cart from "./pages/Cart";
import Shop from "./pages/Shop";
import RequestPasswordReset from "./pages/RequestPasswordReset";

import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Zoom} from 'react-toastify';

  
function App() {

  return (
    <Router>
        <Navbar />
        <div >
         <Routes>
         
            <Route path="/" element={<Home />}/>           
            <Route path="/reset-password" element={<RequestPasswordReset/>}/>           
            <Route path="/register" element={<Register/> }/>
            <Route path="/login" element={<Login  />}/>
            <Route path="/cart" element={<Cart/>}/>           
            <Route path="/shop" element={<Shop/>}/>
                       
        </Routes>  
        <ToastContainer theme='dark' transition={Zoom} />
        </div>
        <Footer/>
        
    
  </Router>
   
  );
}

export default App;
