

import React ,{useState,useEffect}from 'react'
import "../css/login.css"
import { Link, useNavigate } from "react-router-dom"


import {  toast } from 'react-toastify';
//import 'react-toastify/dist/ReactToastify.css';

const Register = () => {

  
 
  const [formData, setFormData] = useState({
    name:'',
    email: '',
    phone: '',
    password: '',
    re_password:'',

  })

  const [accountCreated, setAccountCreated] = useState(false)

  
  useEffect(() => {
    redirect()
  },[accountCreated])

  //destructure to access formData keys  individually
  const {name,email,phone, password, re_password} = formData

  let navigate = useNavigate()

  let redirect = ()  => {
    if(accountCreated){
        console.log('redirected')
        return navigate('/login')
        }
    
    }

  const onChange = (e) => {
      setFormData({...formData, [e.target.name]: e.target.value});
  }

  
  const onSubmit = e => {
    e.preventDefault()
    if (password === re_password){
      
      signup(formData)
        } else {
          toast.error("Passwords do not match!");
  
      }
    
  };
  
  const signup= async  (formData) => {
  
    let response = await fetch('https://ndula-wango.herokuapp.com/shop/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            
        },
        body: JSON.stringify(formData)
    })

    let data = await response.json()
    
    //remove items from local storage
    if(!response.ok){
      setAccountCreated(false)

      if( data.error === 'User with this email already exists'){
        toast.error('User with this email already exists')
        return console.log('user already exists')    
    
      } else if(data.error==='Password must be at least 6 characters long'){
        toast.error("Password must be at least 6 characters long");
  
      } else if(data.error ==='Username already taken'){
        toast.error('Username is already taken')
      }
        
    } else {
      setAccountCreated(true)
      toast.success('Account created')
      console.log("sign up success") 
     
    }         
  }

  return (
    <div className='login-outer'>
    <div className='login'>
      <div className='login-inner'>
        <p>CREATE ACCOUNT</p>

        <hr></hr>
        
        <form onSubmit={e => onSubmit(e)} style={{margin:5}} >
               
                <label for='name'>Full Name</label>
                <input  
                name="name" 
                type="text"
                value={name}
                onChange={e => onChange(e)} 
                />

               <label for='email'>Email address</label>
                <input
                name="email"  
                type="email"
                value={email}
                onChange={e => onChange(e)}                        
                />

                <label for='phone'>Mobile Number</label>
                <input  
                name="phone" 
                type="number"
                value={phone}
                onChange={e => onChange(e)} 
                />

                <label for='password'>Password</label>
                <input  
                name="password" 
                type="password"
                value={password}
                onChange={e => onChange(e)} 
                />

                <label for='re_password'>Confirm Password</label>
                <input  
                name="re_password" 
                type="password"
                value={re_password}
                onChange={e => onChange(e)} 
                />
             
                <button type='submit'><h4>CREATE ACCOUNT</h4></button>

                <p className='new'>------- Already have an account? -------</p>
                <Link to='/login'><button  className='lb'><h4>LOGIN</h4></button></Link>
         
        </form>
               
      </div>
    </div>
    </div>
  )
}

export default Register