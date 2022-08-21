import React, {useState, useEffect} from 'react'
import {  useParams, Link , useNavigate} from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "../css/product.css"
// import required modules
import { Pagination, Navigation } from "swiper";
import { toast } from 'react-toastify';

import { Rating } from 'react-simple-star-rating'

const Product = (props) => {
    
  const productId = useParams(props.id)
  
  const [product, setProduct] = useState("")    
  
  const [quantity, setQuantity] = useState(1)
  
  const [chosenSize, setChosenSize] = useState('')
  
  const [sizes, setSizes] = useState([])

  const [maxQuantityForChosenSize, setmaxQuantityForChosenSize] = useState(5)
  
  const [wishlist, setWishlist] = useState(false)
  
  const [ratingValue, setRatingValue] = useState(0)
  
  const [rating, setRating] = useState(0)

  const [reviews, setReviews] = useState([])
  
  const [review, setReview] = useState('')
  
  const [noreviews, setNoReviews] = useState(false)
  
    const [recommended, setRecommended] = useState([]) 

    let navigate = useNavigate()

  useEffect(() => {
    getProduct()
  }, [productId]);

  
  useEffect(() => {
    
  }, [quantity,chosenSize, wishlist, ratingValue]);

  
  useEffect(() => {
    scrollToTop()
}, []);

  const scrollToTop = () => {
    window.scrollTo(0,0)
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

    

  async function getProduct() {
    if (localStorage.getItem('access')){
        let response = await fetch(`https://ndula-wango.herokuapp.com/shop/product/${productId.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',             
                'Authorization': `Bearer ${localStorage.getItem('access')}`,  
            },
        });
        let data = await response.json();       
        setProduct(data.product);  
        setWishlist(data.wishlist)
        setSizes(data.sizes)
        getRecommended(data.product.brand)
        setRatingValue(data.product.rating)
        getReviews()

    } else {
        let response = await fetch(`https://ndula-wango.herokuapp.com/shop/product/${productId.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',             
            },
        });
        let data = await response.json();       
        setProduct(data.product);  
        setSizes(data.sizes)
        getRecommended(data.product.brand)
        
        setRatingValue(data.product.rating)
        getReviews()

       
        }
    }

    async function checkWishlist() {
        if (localStorage.getItem('access')){
            let response = await fetch(`https://ndula-wango.herokuapp.com/shop/wishlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',             
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,  
                },
                
                body: JSON.stringify({productId: productId.id})
            });
            let data = await response.json();       

            if(!response){
                return toast.error('unable to add to wishlist')
            }

            if (data.success === 'Wishlist item removed successfully'){
                setWishlist(false)
                return toast.success('Item removed from wishlist')
            } else if(data.success === 'Wishlist item created successfully'){
                setWishlist(true)
                return toast.success('item addded to wishlist')
            }
            
        } else {
            toast.warning('Login to add item to wishlist')
            return navigate('/login')
            
        }
    }
    
    async function getRecommended(brand) {
        let response = await fetch('https://ndula-wango.herokuapp.com/shop/recommended', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',             
            },
            
            body: JSON.stringify({brand: brand})
        });
        let data = await response.json();       
        setRecommended(data.products); 
    }

    async function getReviews() {
        let response = await fetch('https://ndula-wango.herokuapp.com/shop/get-reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',             
            },
            
            body: JSON.stringify({productId: productId.id})
        });
        let data = await response.json();   
        data = data.reviews    
        if (data.length === 0){
            setNoReviews(true)
            
        }   else {
            setNoReviews(false)
        }
        setReviews(data); 
    }

    async function CreateReview() {
        if (localStorage.getItem('access')){
            let response = await fetch('https://ndula-wango.herokuapp.com/shop/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',                                   
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,           
                },
                
                body: JSON.stringify({productId: productId.id, comment:review, rating:rating})
            });
            let data = await response.json();   
            if (!response) {
                return toast.error('Unable to add review try again later')
            } 
            if (data.success === 'Review created successfully'){
                getProduct()
                setReview('')
                setRating(0)
                return toast.success('Thank you for your review')
            }
        } else{
            toast.warn('Login to add review')
            return navigate('/login')
            
        }
    }

    async function AddToCart(action) {
        if (localStorage.getItem('access')){
            if (chosenSize != ''){
                let response = await fetch('https://ndula-wango.herokuapp.com/shop/order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',                                   
                        'Authorization': `Bearer ${localStorage.getItem('access')}`,           
                    },               
                    body: JSON.stringify({productId: productId.id, action:action,quantity:quantity,size:chosenSize })
                });

                let data = await response.json();   
                if (!response) {
                    return toast.error('Unable to add to cart try again later')
                } 
                if (data.success === 'order updated'){              
                    return toast.success('Item added to cart')
                }
            } else {
                toast.warn("Choose a size")

            }
        } else{
            if (chosenSize != ''){
                   addCookieItem()
                   toast.success('item addded to cart')
            
            } else {
                toast.warn("Choose a size")
            }
           
            
        }
    }
        
    function addCookieItem(){
        let cookiecart = JSON.parse(getCookie('cart'))
        console.log('Cart:', cookiecart)

        //create cart if cart is undefined
        if(cookiecart == undefined){
        cookiecart = {}
        console.log('Cart Created', cookiecart)
        document.cookie = 'cart=' + JSON.stringify(cookiecart) + ";domain=;path=/"

        }
        console.log('not logged in')

        cookiecart[productId.id] = {'quantity':quantity, 'name':product.name,'image':product.image, 'price':product.price,'size':chosenSize, 'total_price':quantity*product.price}
        
        console.log('Cart Created', cookiecart)
        document.cookie = 'cart=' + JSON.stringify(cookiecart) + ";domain=;path=/"
    
    }

    const minus = () => {
        if (quantity != 1 ){
        setQuantity(quantity-1)}
    }

    const add = () =>{
        if (quantity < maxQuantityForChosenSize){
        setQuantity(quantity+1)
        }
    }

    const chooseSize = (size,quantity) =>{
        setChosenSize(size)
        setmaxQuantityForChosenSize(quantity)
        setQuantity(1)
    }

    const handleRating = (rate) => {
        setRating(rate)
        // other logic
    }

    let showAddReview = () => {
        if (localStorage.getItem('access')){
            document.getElementById("drop").classList.toggle("show");
        } else {
            toast.warning('login to create review')
            return navigate('/login')
        }
    }

    const onChange = (e) => {
        setReview(e.target.value)
        }

        const onSubmit = e => {
        e.preventDefault()
        CreateReview()
        
        document.getElementById("drop").classList.toggle("show")
        
        };

  return (
    <div className='product-page'>
        <div className='product'>
            <div className='product-images'>
                
                <Swiper
                    slidesPerView={1}
                    spaceBetween={30}
                    loop={true}
                    pagination={{
                    clickable: true,
                    }}
                    navigation={true}
                    modules={[Pagination, Navigation]}
                    className="mySwiper"
                >
                    <SwiperSlide><img src={`https://res.cloudinary.com/dgcbtjq3c/${product.image}`}  alt={product.name}/></SwiperSlide>
                    <SwiperSlide><img src={`https://res.cloudinary.com/dgcbtjq3c/${product.image1}`}  alt={product.name}/></SwiperSlide>
                    <SwiperSlide><img src={`https://res.cloudinary.com/dgcbtjq3c/${product.image2}`}  alt={product.name}/></SwiperSlide>
                </Swiper>
                
            </div>

            <div className='product-details'>
                {wishlist 
                ?
                    <p className=' love' style={{right:40}}onClick={e => checkWishlist()}><i  class="fa-solid fa-heart " style={{color:'red'}}></i></p>
                :
                    <p className='love' onClick={e => checkWishlist()}><i  class="fa-regular fa-heart "></i> Add to Wish List</p>
                    
                }
            
                <p className='pbrand'>{product.brand}</p>
                
                <p className='pname'>{product.name}</p>
                
                <p className='pbrand'>{product.price} ksh</p>
                <p className='pbrand' style={{color:'black'}}>AVAILABLE SIZES <i class="fa fa-arrow-down"></i></p>

                <div className='sizes'>
                    {sizes.map(size =>
                        chosenSize === size.size
                        ?
                            <div className='sizechild chosen' onClick={e => chooseSize(size.size, size.quantity)}>
                                {size.size}
                            </div>
                        : size.quantity > 0
                            ?
                                <div className='sizechild' onClick={e => chooseSize(size.size, size.quantity)}>
                                    {size.size}
                                </div>
                            :<></>
                    )}
                    
                </div>

                <div className='quantity'>
                    <div className='minus' onClick={e => minus()}>-</div>
                    <div className='quantityno'>{quantity}</div>
                    <div className='minus' onClick={e => add()}>+</div>
                </div>

                <div className='addtocart'>
                    <button onClick={e => AddToCart('add')}>Add to cart</button>
                </div>

                <hr className='pspace'></hr>
            
                <p className='pbrand' style={{color:'black', paddingTop:20}}>ABOUT THIS PRODUCT</p>
                
                <p className='pbrand' style={{color:'black', paddingTop:20, fontSize:14, textAlign:'justify'}}>{product.description}</p>            

            </div>

        </div>
        
        {noreviews 
       
            ?    
            
                <div className='reviews' style={{height:350}} >
                    <div className='heading' style={{paddingBottom:20}}>
                            <h2>CUSTOMER REVIEWS</h2>
                    </div>      

                <Rating 
                    initialValue={ratingValue}
                    readonly={true}
                    className="stars"
                    allowHalfIcon={true}
                    fillColor='red'
                    size={30}
                    />

                    <div className='add_review' style={{paddingBottom:10}}>
                        <p onClick={ showAddReview}>Add Review</p>
                        <div className='dropform' id='drop'>
                            <label >Rating</label>
                            <Rating 
                                transition
                                onClick={handleRating}
                                allowHalfIcon={true}
                                fillColor='red'
                                size={25}
                                style={{marginTop:5}}
                                />
                            
                            <form onSubmit={e => onSubmit(e)}>
                                <label for='email'>Review</label>
                                    <textarea
                                    name="review"  
                                    type="text area"
                                    value={review}
                                    onChange={e => onChange(e)}                        
                                    />
                                     
                                    <button type='submit'>Add Review</button>                                   

                            </form>
                        </div> 
                    </div>

                    

                    <h4 style={{marginLeft:40}}>No Reviews</h4>
            </div>
            
            : 
            <div className='reviews'>
                <div className='heading' >
                        <h2 style={{paddingBottom:20}}>CUSTOMER REVIEWS</h2>
                </div>    
                
                <Rating 
                    initialValue={ratingValue}
                    readonly={true}
                    className="stars"
                    allowHalfIcon={true}
                    fillColor='red'
                    size={30}
                    />

                    <div className='add_review' style={{paddingBottom:10}}>
                        <p onClick={ showAddReview}>Add Review</p>
                        <div className='dropform' id='drop'>
                            <label >Rating</label>
                            <Rating 
                                transition
                                onClick={handleRating}
                                allowHalfIcon={true}
                                fillColor='red'
                                size={25}
                                style={{marginTop:5}}
                                />
                            
                            <form onSubmit={e => onSubmit(e)}>
                                <label for='email'>Review</label>
                                    <textarea
                                    name="review"  
                                    type="text area"
                                    value={review}
                                    onChange={e => onChange(e)}                        
                                    />
                                     
                                    <button type='submit'>Add Review</button>                                   

                            </form>
                        </div> 
                    </div>
                
                {reviews.map(review =>
                        <div className='reviewschild' key={review.id}>
                            <Rating 
                            initialValue={review.rating}
                            readonly={true}
                            allowHalfIcon={true}
                            fillColor='red'
                            size={20}
                            />              
                            <p className='rname'>{review.name} on {new Date(review.date_added).toLocaleDateString()}</p>
                            
                            <p className='rcomment'>{review.comment}</p>          

                        </div>
                    )}         
            
                </div>}


      <div className='heading'>
            <h2>RECOMMENDED FOR YOU</h2>
      </div>
            
        <div className='col'>
            {recommended.map(recommend =>
                
                    <div className='col-child' key={recommend.id} onClick={e => window.scrollTo(0,0)}>
                    <Link to={`/product/${recommend.id}`}>
                        <img src={`https://res.cloudinary.com/dgcbtjq3c/${recommend.image}`}  alt={recommend.name}/>
                        <p className='pbrand'>{recommend.brand}</p>
                        <p className='pname'>{recommend.name}</p>
                        <p className='pprice'>{recommend.price}</p>
                        
                    </Link>
                    </div>
            )}
        </div>
       
    </div>
  )
}

export default Product