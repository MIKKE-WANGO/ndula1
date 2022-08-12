
import React ,{useState,useEffect}from 'react'

import { toast } from 'react-toastify';

import "../css/login.css"
import { Link, useNavigate } from "react-router-dom"



const Login = () => {

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  //destructure to access formData keys  individually
  const {email, password} = formData

  const [loggedin, setLoggedin] = useState(false)
    
  let navigate = useNavigate()

  useEffect(() => {
    redirect()
  },[loggedin])

  let redirect = ()  => {
    if(loggedin){
      
        console.log('redirected')
        return navigate('/')
        }
    if(localStorage.getItem('access')){
      
      return navigate('/')
    }
    
    }

  const onChange = (e) => {
      setFormData({...formData, [e.target.name]: e.target.value});
  }

  const onSubmit = e => {
    e.preventDefault()
    Loginuser(formData)
   
  };


  async function  Loginuser  (formData)  {
    //retrieve refresh and access
    let response = await fetch(' https://ndula-wango.herokuapp.com/api/token/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            
        },
        body: JSON.stringify(formData)
    })

    //remove items from local storage
    if(!response.ok){
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      toast.error("Username or password is incorrect");
      return console.log('not authorised') 
      
    }

    let data = await response.json()

    console.log("login success")
    
    //set access in localstorage of browser
    localStorage.setItem('access', data.access)
    localStorage.setItem('refresh', data.refresh)
    
    get_user()
       
  }

  const get_user = async () => {
    if (localStorage.getItem('access')){
      let response = await fetch('https://ndula-wango.herokuapp.com/shop/user-details', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',            
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access')}`,      
            },
       })

      let data = await response.json()
 
      if(!response.ok){
        console.log("unable to get user")     
      }

      localStorage.setItem('username', data.user.name)
      localStorage.setItem('userphone', data.user.phone)
      localStorage.setItem('useremail', data.user.email)

      console.log("user accessed")

      setLoggedin(true)
      
     
    } else {
      console.log(" no access key")
    }
  }

  return (
    
    <div className='login-outer'>
    <div className='login'>
      <div className='login-inner'>
        <p>LOGIN</p>

        <hr></hr>
        
        <form onSubmit={e => onSubmit(e)} style={{margin:5}} >
               
               <label for='email'>Email address</label>
                <input
                name="email"  
                type="email"
                value={email}
                onChange={e => onChange(e)}                        
                />

                <label for='password'>Password</label>
                <input  
                name="password" 
                type="password"
                value={password}
                onChange={e => onChange(e)} 
                />

                <Link to="/reset-password" >Forgot Password?</Link>

                <button type='submit'><h4>LOGIN</h4></button>

                <p className='new'>------- New to Ndula? -------</p>
                <Link to='/register'><button  className='lb'><h4>CREATE ACCOUNT</h4></button></Link>

          
        </form>

      
      </div>
    </div>
    </div>
  )
}

export default Login