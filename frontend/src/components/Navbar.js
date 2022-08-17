import React,{useEffect, useState} from 'react'
import "../css/navbar.css"
import menu from "../assets/menu blue.png"
import { Link } from 'react-router-dom'

//calling verify whenever navbar is interacted with
const Navbar = (props) => {

  const [verified, setverified] = useState(false)
  
  useEffect(() => {
    Verify()
  },[])

  
  useEffect(() => {
   
  },[verified])

  async function  Verify  ()  {
    //retrieve refresh and access
    let response = await fetch('https://ndula-wango.herokuapp.com/api/token/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',        
        },
        
        body: JSON.stringify({token: ` ${localStorage.getItem('access')}`})
    })

    //remove items from local storage
    if(!response.ok){
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      localStorage.removeItem('username')
      localStorage.removeItem("userphone")
      localStorage.removeItem('useremail')
      return setverified(false)
    }

    let data = await response.json()
    console.log(data)
    setverified(true)   
  }

  let showMenu = () => {
    Verify()
    const toggle = document.getElementById("mobileMenu")
    const nav = document.getElementById("navbar")
    if(toggle.style.height === '200px'){
        toggle.style.height = '0px';
        nav.classList.remove("navv")
    }
    else{
        toggle.style.height = '200px'
        nav.classList.add("navv")
    }
  }

  let reduceMenu = () => {
    Verify()
    const toggle = document.getElementById("mobileMenu")
    if(toggle.style.height == '200px'){
        toggle.style.height = '0px';
    }    
}

let logout = () => {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
  localStorage.removeItem('username')
  localStorage.removeItem("userphone")
  localStorage.removeItem('useremail')
  props.setVerified(false)
}

  return (
    <div class="sticky nav-bar" id="navbar">
            <div class="nav-logo">
                <h1 ><Link to="" onClick={e => reduceMenu(e)}>NDULA</Link></h1>
            </div>
            <div class="nav-links" id="mobileMenu">
                <ul id="menu">
                    
                    <li><Link to="/shop"  class="highlight" onClick={e => reduceMenu(e)}>Shop</Link></li>
                    <li><Link to="/cart" class="highlight" onClick={e => reduceMenu(e)}>Cart</Link></li>
                    {verified ? 
                    <>
                     <li><Link to="account" class="highlight" onClick={e => reduceMenu(e)}>Acount</Link></li>
                  
                    <li><Link  to="#" class="highlight" onClick={logout}>Logout</Link></li>
                    
                     </>
                    :
                    
                    <li><Link to="/login" class="highlight" onClick={e => reduceMenu(e)}>Login</Link></li>
                    }
                   
            
                </ul>
            </div>
            <img src={menu} class="menu-icon" onClick={e => showMenu(e)}  alt="mobile menu "/>
            
      </div>
  )
}

export default Navbar