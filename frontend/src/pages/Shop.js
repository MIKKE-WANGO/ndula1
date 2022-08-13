import React, {useState, useEffect} from 'react'
import "../css/shop.css"

import { toast } from 'react-toastify';

import { Link, useNavigate } from "react-router-dom"



const Shop = () => {

  const [products, setProducts] = useState([])
  const [search, setSearch] = useState("")

  const [brand, setBrand] = useState("ALL")
  
  const [empty, setEmpty] = useState(false)
    

  useEffect(() => {
      getProducts()
    }, []);

    
  useEffect(() => {
    
  }, [brand]);
  
  async function getProducts() {
      let response = await fetch('https://ndula-wango.herokuapp.com/shop/products', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',             
          },
      });
      let data = await response.json();       
      setProducts(data);  
  }

  const onSubmit = e => {
    e.preventDefault()
    searchProducts(search)
   
  };

  const changeBrand = (brand) => {
    setBrand(brand)
  }


  const onChange = (e) => {
      setSearch( e.target.value)
      searchProducts(e.target.value)
  }

  async function searchProducts(query) {
      let response = await fetch(`https://ndula-wango.herokuapp.com/shop/product-search`, {

          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
        
          },
          body: JSON.stringify({search:query})
      });

      let data = await response.json();  
      data = data.products  
      if (data.length === 0){
          setEmpty(true)
          
      }   else {
          setEmpty(false)
      }
      setProducts(data);
      
      if(!response.ok){
          toast.error('unable to search') 
      }
  }

 
  // Close the dropdown menu if the user clicks outside of it
  window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }

  let showBrands =() => {
    document.getElementById("myDropdown").classList.toggle("show");
  }

  return (
    <div className='home'>
      
      <div className='heading-shop'>
            <h2>SHOP ALL SNEAKERS</h2>
            <p>The vault runs shallow at Ndula for now. Shop for new releases from must-have names like Air Jordan, Nike, New Balance and Yeezy, along with the latest collaborations from brands like Vans, Reebok, Converse, ASICS, and more. </p>
      </div>

      <div className='filters'>

        
        <div className='search'>
          <form onSubmit={e => onSubmit(e)} >
            <input type="text" placeholder="Search.." name="search" autoComplete='false'  onChange={e => onChange(e)} />
            <button type="submit"><i class="fa fa-search"></i></button>
          </form>
        </div>

        <div class="dropdown">
            <p onClick={showBrands} class="dropbtn">CHOOSE BRAND: {brand}</p>
            <div id="myDropdown" class="dropdown-content">
              <p onClick={e => changeBrand('ALL')}>All</p>
              <p onClick={e => changeBrand('NIKE')}> Nike</p>
              <p onClick={e => changeBrand('ADIDDAS')}>Adiddas</p>
              <p onClick={e => changeBrand('NEW BALANCE')}>New Balance</p>
            </div>
          </div>

          
      </div>

     

      <div className='col'>
      {empty
          ?
          <div style={{marginTop:80,marginBottom:80, textAlign:'center'}}>
              <h4>Sorry,No Shoes Found</h4>
          </div>
              
          :
          <>
            {products.map(product =>
              brand === 'ALL'
              ?
                <div className='col-child' key={product.id}>
                  <Link to="#">
                    <img src={`https://res.cloudinary.com/dgcbtjq3c/${product.image}`}  alt={product.name}/>
                    <p className='pbrand'>{product.brand}</p>
                    <p className='pname'>{product.name}</p>
                    <p className='pprice'>{product.price}</p>
                    
                    <p className='pprice'></p>
                  </Link>
                </div>
              : 
                brand ==="NIKE"
                ?
                  product.brand === 'nike'
                  ?
                    <div className='col-child' key={product.id}>
                    <Link to="#">
                      <img src={`https://res.cloudinary.com/dgcbtjq3c/${product.image}`}  alt={product.name}/>
                      <p className='pbrand'>{product.brand}</p>
                      <p className='pname'>{product.name}</p>
                      <p className='pprice'>{product.price}</p>
                      
                      <p className='pprice'></p>
                    </Link>
                    </div>
                  :<></>
                : 
                  brand === 'ADIDDAS'
                  ?
                    product.brand === 'adiddas'
                    ?
                      <div className='col-child' key={product.id}>
                      <Link to="#">
                        <img src={`https://res.cloudinary.com/dgcbtjq3c/${product.image}`}  alt={product.name}/>
                        <p className='pbrand'>{product.brand}</p>
                        <p className='pname'>{product.name}</p>
                        <p className='pprice'>{product.price}</p>
                        
                        <p className='pprice'></p>
                      </Link>
                      </div>
                    :<></>
                  : brand === 'NEW BALANCE'
                    ?
                      product.brand === 'new balance'
                      ?
                        <div className='col-child' key={product.id}>
                        <Link to="#">
                          <img src={`https://res.cloudinary.com/dgcbtjq3c/${product.image}`}  alt={product.name}/>
                          <p className='pbrand'>{product.brand}</p>
                          <p className='pname'>{product.name}</p>
                          <p className='pprice'>{product.price}</p>                          
                          <p className='pprice'></p>
                        </Link>
                        </div>
                      :<></>
                    :<></>    
            )}</>
      }
      </div>
    </div>
  )
}

export default Shop