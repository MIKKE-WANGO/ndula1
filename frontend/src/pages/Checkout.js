import React , {useState, useEffect}from 'react'
import "../css/checkout.css"
import { toast } from 'react-toastify';
import { Link, useNavigate} from "react-router-dom"

import {  PayPalButtons,PayPalScriptProvider } from "@paypal/react-paypal-js";


const Checkout = () => {
  
  const [cart, setCart] = useState([])

  
  const [deliveryPrice, setDeliveryPrice] = useState(300)

  const [method, setMethod] = useState('delivery')
  
  const [cartPrice, setCartPrice] = useState(0)

  
  const [TotalPrice, setTotalPrice] = useState(0)


  const [showSummary, setShowSummary] = useState(false)
  const[paid, setPaid] = useState(false)
  
  const [showPayments, setShowPayments] = useState(false)
  
  const [contactDetails, setContactDetails] = useState({
    email: '',
    phone: '',
    county:'',
    postal_code:'',
    address:'',
    full_name:''

  })

  const {email, phone, county, postal_code, address, full_name} = contactDetails;

  let navigate = useNavigate()


  useEffect(() => {
    getCart()
  }, []);

  useEffect(() => {
    
  }, [showPayments,method,]);

  useEffect(() => {
    redirect()
  },[paid])
  
  async function getCart() {
    if (localStorage.getItem('access')){
      let response = await fetch('https://ndula-wango.herokuapp.com/shop/order', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',                                   
              'Authorization': `Bearer ${localStorage.getItem('access')}`,           
          },  
    });

      let data = await response.json(); 
      if (!response) {
          return toast.error('Unable to get cart')
      } 
      setCart(data.cartitems)
      setCartPrice(data.cart_price)
      setTotalPrice(data.cart_price +deliveryPrice)

    }else{
        let cookiecart = JSON.parse(getCookie('cart'))
        console.log('Cart:', cookiecart)

        //create cart if cart is undefined
        if(cookiecart == undefined){
        document.cookie = 'cart=' + JSON.stringify(cookiecart) + ";domain=;path=/"
       
        }

        let cart = []
        let tprice = 0
        for (const [key, value] of Object.entries(cookiecart)) {
          
          let item = {}
          item.name = value.name
          item.id = key
          item.price = value.price
          item.total_price = value.total_price
          item.size = value.size
          item.image = value.image
          item.quantity = value.quantity
          cart.push(item)
          tprice += item.total_price
        }
        setCart(cart)
        setCartPrice(tprice)
        setTotalPrice(tprice + deliveryPrice)
    }
  }

  
  function getCookie(name){
    //split cookie string and get all individual name=value pairs in an array
    let cookieArr = document.cookie.split(";");
    //Loop through the array elements
    for(let i = 0; i< cookieArr.length; i++){
        var cookiePair = cookieArr[i].split("=");

        //reomve whitaspace at beginning of the cookie name and compare it with the given string

        if(name == cookiePair[0].trim()){
            //decode the cookie value and return
            return decodeURIComponent(cookiePair[1]);
        }
    }
    //return null if not found
    return null;
  }

  let showOrderSummary = () => {
    document.getElementById("summaryid").classList.toggle("appear");
    if (showSummary === true){
      setShowSummary(false)
    } else{
      setShowSummary(true)
    }
    
  }

  let chooseMethod = (method) => {
    setMethod(method)
    if (method==='delivery'){
      setTotalPrice(cartPrice+deliveryPrice)
      setShowPayments(false)
    } else {
      
      setTotalPrice(cartPrice)
      console.log('pickup')
      if(localStorage.getItem('access')){
        setShowPayments(true)
      }
    }
  }

  
  const onChange = (e) => {
    setContactDetails({...contactDetails, [e.target.name]: e.target.value});
}

  
const onSubmit = e => {
  e.preventDefault()
  setShowPayments(true)
  console.log(showPayments)
};

let redirect = ()  => {
  if(paid){
    
      console.log('redirected')
      return navigate('/shop')
      }
  
  
  }

  async function handleApprove() {
    //request backend to fulfill order
    console.log('paid')

    if (localStorage.getItem('access')){
      let response = await fetch(`https://ndula-wango.herokuapp.com/shop/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',             
                'Authorization': `Bearer ${localStorage.getItem('access')}`,  
            },
            body: JSON.stringify({county:county, postal_code:postal_code, address:address,method:method, payment:'paypal'})
        });
        let data = await response.json(); 
        if(data.success === 'payment made'){
          toast.success('payment has been made')
          setPaid(true)
        }
    } else {
      let cookiecart = JSON.parse(getCookie('cart'))
      let response = await fetch(`https://ndula-wango.herokuapp.com/shop/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',               
            },
            body: JSON.stringify({cart:cookiecart,county:county, postal_code:postal_code, address:address, full_name:full_name,email:email,phone:phone, method:method, payment:'paypal'})
           
        });
        let data = await response.json();
        if(data.success === 'payment made'){
          toast.success('payment has been made')
          let cart = {}
          document.cookie = 'cart=' + JSON.stringify(cart) + ";domain=;path=/"
          setPaid(true)
        }
      
    }

  }

  async function mpesa_call() {
    let response = await fetch('https://ndula-wango.herokuapp.com/shop/stk_push', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',      
                 
                                          
          },  
    });
    let data = await response.json();
      
    

  }

  return (
    <div className='home'>

      <p style={{textAlign:'center', paddingTop:20, color:'#818181',width:'100%', backgroundColor:'white'}}>---CHOOSE----</p>
        
       {method === 'delivery' 
        ? <div className='choose-method'>
            <button onClick={e => chooseMethod('delivery')} style={{border: '2px solid black'}}>DELIVERY</button>
            <button onClick={e => chooseMethod('pickup')}>PICK UP</button>
          </div>
        : <div className='choose-method'>
            <button onClick={e => chooseMethod('delivery')} >DELIVERY</button>
            <button onClick={e => chooseMethod('pickup')} style={{border: '2px solid black'}}>PICK UP</button>
          </div>


        }

      <div className='checkout'>
        <div className='order-summary'>

          <div className='show-summary'>
            {showSummary? <p className='show1'  onClick={ showOrderSummary}>Hide order summary <i class="fa fa-arrow-up"></i></p>: <p className='show1'  onClick={ showOrderSummary}>Show order summary <i class="fa fa-arrow-down"></i></p>}
            {method === 'delivery'? <p className='show2'>Ksh {cartPrice+ deliveryPrice}</p>:  <p className='show2'>Ksh {cartPrice}</p>}
          </div>

          <div className='summary' id='summaryid'>
            {cart.map(cartitem =>
              <div className='summary-child'  key={cartitem.id}>
                
                  <img src={`https://res.cloudinary.com/dgcbtjq3c/${cartitem.image}`}  alt={cartitem.name}/>
                
                <div className='block-order'>
                  <p className='pname-checkout'>{cartitem.name} </p>
                  <p className='pname-checkout'>size:{cartitem.size}</p>
                  <p className='pname-checkout'>ksh {cartitem.total_price}</p>
                </div>
              </div>
            )}

            <div className='show-total'>
              <p >Subtotal: {cartPrice}</p>
              {method === 'delivery'? <p>Delivery: {deliveryPrice}</p> : <p>Delivery: None</p>}
              <hr></hr>
              {method === 'delivery' ? <p>Total: {cartPrice + deliveryPrice}</p> : <p>Total: {cartPrice}</p>}
            </div>

          </div>

        </div>

        <div className='order-details'>
          {localStorage.getItem('access')
            ?<>
              </>
            :
            
            <div className='contact-details'>
               
              <p>CONTACT DETAILS</p>
              
              <hr style={{width:'80%'}}></hr>
              <Link to="/login" style={{textDecoration:'none', display:"inline"}}>Already have an account? Login</Link>
              <Link to="" style={{textDecoration:'none', display:"block", marginTop:15}}>Fill forms to access payment methods</Link>
            
              <form onSubmit={e => onSubmit(e)} >
                <label for='email'>Email address</label>
                  <input
                  name="email"  
                  type="email"
                  value={email}
                  onChange={e => onChange(e)}                        
                />
                <label for='phone'>Phone Number</label>
                  <input
                  name="phone"  
                  type="number"
                  value={phone}
                  onChange={e => onChange(e)}                        
                />
                <label for='phone'>Full Name</label>
                <input
                name="full_name"  
                type="text"
                value={full_name}
                onChange={e => onChange(e)}                        
                />
                {method === 'pickup' ? <button type='submit'>SUBMIT</button> :<></>}
              </form>
            </div>
          }

          {method === 'delivery'
          ?
          <div className='contact-details'>
            <form onSubmit={e => onSubmit(e)} >
            <p>DELIVERY DETAILS</p>
              
              <hr style={{width:'80%'}}></hr>
              
               <label for='email'>County</label>
                <input
                name="county"  
                type="text"
                value={county}
                onChange={e => onChange(e)}                        
                />
              <label for='phone'>Postal Code</label>
                <input
                name="postal_code"  
                type="number"
                value={postal_code}
                onChange={e => onChange(e)}                        
              />
              <label for='phone'>Address</label>
                <input
                name="address"  
                type="number"
                value={address}
                onChange={e => onChange(e)}                        
              />
              <button type='submit'>SUBMIT</button>

            </form>
          </div>
          :<></>
          }

          <div className='payments'>
         
          {showPayments?
            <>
              <div>
                <button className='mpesa' onClick={e => mpesa_call()}>MPESA</button>

              </div>
           
              <PayPalScriptProvider options={{ "client-id": "AVJJzeDI8ntCsuE7H3BmXTAlP5XofdGi9b24IrtrN2I6271HewkaaH-Glx2HAHUt0v4pQhXss7sHtiN_" }}>
              <PayPalButtons  style={{color:'silver'}}
                createOrder={(data, actions) => {
                  if (method === 'delivery'){
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: TotalPrice
                            }
                        }]
                    })
                  } else if(method === 'pickup'){
                    return actions.order.create({
                      purchase_units: [{
                          amount: {
                              value: cartPrice
                          }
                      }]
                  })
                  }
                }}

                onApprove={async (data, actions) => {
                  const order = await actions.order.capture()
                  console.log('order: ', order)
                  handleApprove(data.orderID)
                }}

                onError={(err) => {
                  console.log(err)
                  toast.error('Unable to make payment try again later')
                }}
              
              />
              </PayPalScriptProvider>
              </>
              :<></>

            
          }
          </div>
        
        

        </div>

      </div>
    </div>
  )
}

export default Checkout