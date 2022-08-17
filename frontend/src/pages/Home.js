import React , {useState, useEffect} from 'react'

import { Link, useNavigate } from "react-router-dom"

import "../css/home.css"
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules
import { Autoplay, Pagination, Navigation } from "swiper";

import home1 from "../assets/home9.jpg"

import home2 from "../assets/home10.jpg"

import home3 from "../assets/home7.jpg"

import home4 from "../assets/home6.jpg"

import home5 from "../assets/home12.jpg"

const Home = () => {


  const [products, setProducts] = useState([])

    
    useEffect(() => {
        getProducts()
      }, []);
    

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

  return (
    <div className='home'>
      <div className='Intro'>
        <>
          <Swiper
            spaceBetween={0}
            centeredSlides={true}
            autoplay={{
              delay: 1400,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
            }}
            navigation={false}
            modules={[Autoplay, Pagination, Navigation]}
            className="mySwiper"
          >

          <SwiperSlide><img src={home2}  alt="mobile menu "/></SwiperSlide>
          <SwiperSlide><img src={home1}  alt="mobile menu "/></SwiperSlide>
          <SwiperSlide><img src={home3}  alt="mobile menu "/></SwiperSlide>
          <SwiperSlide><img src={home4}  alt="mobile menu "/></SwiperSlide>
          <SwiperSlide><img src={home5}  alt="mobile menu "/></SwiperSlide>
          </Swiper>
        </>
        <div className='call'> <Link to="/shop">SHOP NOW</Link> </div>

      </div>
      <div className='heading'>
            <h2>NEW RELEASES</h2>
      </div>

      <div className='col'>
      {products.map(product =>
        product.status === 'new' ?
        <div className='col-child'  key={product.id}>
          <Link to={`/product/${product.id}`}>
            <img src={`https://res.cloudinary.com/dgcbtjq3c/${product.image}`}  alt={product.name}/>
            <p className='pbrand'>{product.brand}</p>
            <p className='pname'>{product.name}</p>
            <p className='pprice'>{product.price}</p>
            
            <p className='pprice'></p>
          </Link>
        </div>
        :<></>
      )}
      </div>

      
      <div className='heading'>
            <h2>TOP PICKS</h2>
      </div>

      <div className='col'>
      {products.map(product =>
        product.status === 'top' ?
        <div className='col-child'  key={product.id}>
          <Link to={`/product/${product.id}`}>
            <img src={`https://res.cloudinary.com/dgcbtjq3c/${product.image}`}  alt={product.name}/>
            <p className='pbrand'>{product.brand}</p>
            <p className='pname'>{product.name}</p>
            <p className='pprice'>{product.price}</p>
            
            <p className='pprice'></p>
          </Link>
        </div>
        :<></>
      )}
      </div>

    </div>
  )
}

export default Home