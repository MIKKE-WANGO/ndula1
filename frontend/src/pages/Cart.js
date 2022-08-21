import React , {useState, useEffect}from 'react'

import "../css/cart.css"


import { toast } from 'react-toastify';

import { Link, useNavigate} from "react-router-dom"


const Cart = () => {

  const [cart, setCart] = useState([])
  
  const [useCart, setUseCart] = useState(false)

  const [cartPrice, setCartPrice] = useState([])
  
  const [cartQuantity, setCartQuantity] = useState([])

  const [empty, setEmpty] = useState(false)
    
  useEffect(() => {
    getCart()
  }, []);

  useEffect(() => {
    
  }, [cart,empty]);

  let navigate = useNavigate()

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
      let cartitems = data.cartitems 
      if (!response) {
          return toast.error('Unable to get cart')
      } 
      if (cartitems.length === 0){
        setEmpty(true)
        
      }   else {
          setEmpty(false)
      }
      setUseCart(true)
      setCart(data.cartitems)
      setCartPrice(data.cart_price)
      setCartQuantity(data.cart_quantity)

    }else{
        let cookiecart = JSON.parse(getCookie('cart'))
        console.log('Cart:', cookiecart)

        //create cart if cart is undefined
        if(cookiecart == undefined){
        document.cookie = 'cart=' + JSON.stringify(cookiecart) + ";domain=;path=/"
        setEmpty(true)
        }

        let cart = []
        let tprice = 0
        let tquantity = 0
                
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
          tquantity += item.quantity
        }
        if (cart.length === 0){
          setEmpty(true)
        }
        setCart(cart)
        setCartPrice(tprice)
        setCartQuantity(tquantity)
    }
  }

  
  async function EditCart(action,size,productId) {
    if (localStorage.getItem('access')){
       
            let response = await fetch('https://ndula-wango.herokuapp.com/shop/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',                                   
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,           
                },               
                body: JSON.stringify({productId: productId, action:action,quantity:1,size:size })
            });

            let data = await response.json();   
            if (!response) {
                return toast.error('Unable to add to cart try again later')
            } 
            if (data.success === 'order updated'){    
                getCart()          
                return toast.success('Cart updated')
            }

            
            if (data.error === 'Quantity not available'){    
              getCart()          
              return toast.success('quantity not available')
          }
        
    } else{
      
      let cookiecart = JSON.parse(getCookie('cart'))

      if(action === 'add'){
        cookiecart[productId]['quantity'] += 1
        
        cookiecart[productId]['total_price'] += cookiecart[productId]['price']
        console.log(productId)
       
      }
      if(action == 'remove'){
        cookiecart[productId]['quantity'] -= 1
        
        cookiecart[productId]['total_price'] -= cookiecart[productId]['price']

        if(cookiecart[productId]['quantity'] <= 0){
            
            delete cookiecart[productId]
        }
        
      }
      document.cookie = 'cart=' + JSON.stringify(cookiecart) + ";domain=;path=/"   
      getCart()     
    }
}

  return (
    <div className='home'>
      {empty 
        ? 
        <div style={{marginTop:80,marginBottom:80, textAlign:'center', height:300, paddingTop:100}}>
            <h4 style={{marginBottom:20}}>Cart is empty</h4>
            
            <div className='addtocart'>
                    <button ><Link to ="/shop" style={{textDecoration:'none', color:'white'}}>Continue shopping</Link></button>
                </div>
        </div>
            
        
        :
              <div className='col' style={{marginTop:30}}>
                {cart.map(cartitem =>
                  <div className='col-child'  key={cartitem.id}>
                    
                      <img src={`https://res.cloudinary.com/dgcbtjq3c/${cartitem.image}`}  alt={cartitem.name}/>
                    
                      <p className='pnamecart'>{cartitem.name}</p>
                      
                      <p className='pnamecart'>Size: {cartitem.size}</p>
                      <p className='pnamecart s'>{cartitem.total_price}</p>
                      
                      <div className='quantitycart'>
                            <div className='minus' onClick={e => EditCart('remove',cartitem.size,cartitem.id)}>-</div>
                            <div className='quantityno'>{cartitem.quantity}</div>
                            <div className='minus' onClick={e => EditCart('add',cartitem.size,cartitem.id)}>+</div>
                        </div>                
                  </div>
                )}
              </div>
            
          }

      {empty 
      ?<> </>
      :
      <div className='gotocheckout'>
            <p>Total Price:{cartPrice}</p>
            
            <p>Total Quantity:{cartQuantity}</p>

            <div className='addtocart'>
                    <button style={{marginTop:10}}><Link to ="/checkout" style={{textDecoration:'none', color:'white', fontSize:18}}>Checkout</Link></button>
                </div>

      </div>
      }

    </div>
  )
}

export default Cart