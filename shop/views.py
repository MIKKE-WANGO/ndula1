import json
from re import S
from rest_framework.views import APIView
from rest_framework import permissions, status
from rest_framework.response import Response 
from rest_framework.generics import ListAPIView, RetrieveAPIView

from django.contrib.auth import get_user_model
User = get_user_model()

from .serializers import *
from .models import *
import random
import datetime
import math
from django.utils.timezone import make_aware
from django.core.mail import send_mail
from django.contrib.postgres.search import SearchQuery,  SearchVector
from django_daraja.mpesa.core import MpesaClient
from rest_framework.decorators import api_view,permission_classes

from rest_framework.permissions import AllowAny

class RegisterView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self,request, format=None):
        data = request.data

        name = data['name']
        email = data['email']
        email = email.lower()
        phone = data['phone']
        password = data['password']
        re_password = data['re_password']

        if password == re_password:
            if len(password) >=6:
                if (len(phone) == 10):
                    if not User.objects.filter(email=email).exists():
                    

                        User.objects.create_user(name=name, email=email,phone=phone, password=password)
                        return Response(
                                    {'success': 'User created successfully'},
                                    status=status.HTTP_201_CREATED
                                )
                    else:
                        return Response(
                            {'error': 'User with this email already exists'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                         
                else:
                    return Response(
                            {'error': 'invalid phone number'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    

            else:
                return Response(
                        {'error': 'Password must be at least 6 characters long'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
        
        else:
            return Response(
                    {'error': 'Passwords do not match'},
                    status=status.HTTP_400_BAD_REQUEST
                )


#get user details
class RetrieveUserView(APIView):
    def get(self, request, format=None):
        try:
            user = request.user
            print(user)
            user = UserSerializer(user)
            return Response(
                {'user': user.data},
                status=status.HTTP_200_OK
            )
        except:
            return Response(
                {'error': 'Something went wrong when retrieving the user details'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


def createResetPasswordCode():  
    ## storing strings in a list
    digits = [i for i in range(0, 10)]
    ## initializing a string
    code = ""
    ## we can generate any length of string we want
    for i in range(6):
        index = math.floor(random.random() * 10)
        code += str(digits[index])

    return code



class SendResetPasswordCode(APIView):
    permission_classes = (permissions.AllowAny,)

    #create otp save it in db and send it through email
    def post(self, request, format=None):
        data = request.data
        email = data['email']
        print(request.user)
        if  User.objects.filter(email=email).exists():
            
            otp = createResetPasswordCode()
            expiry_date = datetime.now() + timedelta(hours=0, minutes=10, seconds=0)            

            new_otp = ResetPasswordCode(email=email, code=otp, expiry_date=expiry_date)
            new_otp.save()

            send_mail("OTP", "Your otp is " + otp + " .It will expire in 10 minutes", "mikemundati@gmail.com",[ email], fail_silently=False)
            return Response(
                                    {'success': 'Otp sent successfully'},
                                    status=status.HTTP_201_CREATED
                                )

        else:
             return Response(
                            {'error': 'User with this email does not  exists'},
                            status=status.HTTP_400_BAD_REQUEST
                        )

class TesCode(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        data = request.data
        otp = data['code']
        email = data['email']

        #check if otp exists
        exists = ResetPasswordCode.objects.filter(code=otp, email=email).exists()
        #check if otp has not expired
        valid = ResetPasswordCode.objects.filter(code=otp, email=email, expiry_date__gt =datetime.now()).exists()
        
        if (exists):
            if (valid):
             
                    otp_delete = ResetPasswordCode.objects.get(code=otp, email=email, expiry_date__gt =datetime.now())
                    
                    return Response(
                            {'success': ' Code is valid '},
                            status=status.HTTP_201_CREATED
                        )      
                
            else:
                #if otp has expired
                #delete otp
                otp_delete = ResetPasswordCode.objects.get(code=otp, email=email, expiry_date__lt =datetime.now())
                otp_delete.delete()

                return Response(
                    {'error': ' OTP has expired'},
                    status=status.HTTP_400_BAD_REQUEST
                )      
        else:
            return Response(
                    {'error': 'Invalid OTP'},
                    status=status.HTTP_400_BAD_REQUEST
                )

class ResetPassword(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        data = request.data
        otp = data['code']
        email = data['email']
        password = data['password']
        
        #check if otp exists
        exists = ResetPasswordCode.objects.filter(code=otp, email=email).exists()
        #check if otp has not expired
        valid = ResetPasswordCode.objects.filter(code=otp, email=email, expiry_date__gt =datetime.now()).exists()
        
        
        if (exists):
            if (valid):
                if len(password) >=6:
                    #if otp is valid
                    #reset password
                    user = User.objects.get(email=email)
                    user.set_password(password)
                    user.save()

                    #delete otp
                    otp_delete = ResetPasswordCode.objects.get(code=otp, email=email, expiry_date__gt =datetime.now())
                    otp_delete.delete()

                    return Response(
                            {'success': ' password reset '},
                            status=status.HTTP_201_CREATED
                        )
                
                else:
                    return Response(
                        {'error': 'Password must be at least 6 characters long'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
            else:
                #if otp has expired
                #delete otp
                otp_delete = ResetPasswordCode.objects.get(code=otp, email=email, expiry_date__lt =datetime.now())
                otp_delete.delete()

                return Response(
                    {'error': ' OTP has expired'},
                    status=status.HTTP_400_BAD_REQUEST
                )      
        else:
            return Response(
                    {'error': 'Invalid OTP'},
                    status=status.HTTP_400_BAD_REQUEST
                )

class ProductsListView(ListAPIView):
    permission_classes = (permissions.AllowAny,)  
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    pagination_class = None
    

class RecommendedView(ListAPIView):
    permission_classes = (permissions.AllowAny,) 

    def post(self, request, format=None):
        data = request.data
        brand = data['brand']
        products = Product.objects.filter(brand=brand)
        products = ProductSerializer(products, many=True)
      
        return Response(
            {'products': products.data},
            status=status.HTTP_200_OK
        )

class ProductSearchView(APIView):
    permission_classes = (permissions.AllowAny,)
    def post(self, request, format=None):
        data = request.data
        search = data['search']
        
        if search == "":
            products = Product.objects.all()
             
            products = ProductSerializer(products, many=True)
            return Response(
                {'products': products.data},
                status=status.HTTP_200_OK
            )


        vector = SearchVector('name','description','brand','color')
        query = SearchQuery(search)

        products = Product.objects.annotate( search=vector).filter(search=query)
        products = ProductSerializer(products, many=True)
        return Response(
            {'products': products.data},
            status=status.HTTP_200_OK
        )



class ProductDetailView(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request, pk):
        product = Product.objects.get(id=pk)
        if (request.user.is_authenticated == True):
            user = request.user
            wishlist = WishlistItem.objects.filter(user=user,product=product).exists()
            sizes = Sizes.objects.filter(Product=product)
            product = ProductSerializer(product)
            sizes = SizeSerializer(sizes, many=True)
            return Response(
            {'product': product.data,'wishlist':wishlist, 'sizes':sizes.data},
            status=status.HTTP_200_OK
            )
        else:          
            
            sizes = Sizes.objects.filter(Product=product)
            product = ProductSerializer(product)
            
            sizes = SizeSerializer(sizes, many=True)
            
            return Response(
            {'product': product.data,'wishlist':False, 'sizes':sizes.data},
            status=status.HTTP_200_OK
            )



class WishlistItemView(APIView):
    def post(self, request, format=None):
        data = request.data
        productId = data['productId']
        user = request.user
        product = Product.objects.get(id=productId)

        if WishlistItem.objects.filter(user=user, product=product).exists():
            item = WishlistItem.objects.get(user=user, product=product)
            item.delete()
            return Response(
            {'success': 'Wishlist item removed successfully'},
            status=status.HTTP_201_CREATED
        )

        item = WishlistItem(user=user, product=product)
        item.save()

        return Response(
            {'success': 'Wishlist item created successfully'},
            status=status.HTTP_201_CREATED
        )

    def get(self, request, format=None):
        user = request.user
        items = WishlistItem.objects.filter(user=user)
        products = []
        for item in items:
            id = item.product.id
            product = Product.objects.get(id=id)
            product = ProductSerializer(product)
            product = product.data
            products.append(product)
        
        return Response(
            {'wishlist': products},
            status=status.HTTP_200_OK
        )



class CreateReviewView(APIView):
    def post(self, request, format=None):
        data = request.data
        productId = data['productId']
        comment = data['comment']
        rating = data['rating']
        rating = rating/20
        user = request.user
        product = Product.objects.get(id=productId)

        review = Review(user = user, name=user.name,product=product, rating=rating, comment=comment)
        review.save()

        #update product's rating
        product.get_avg_rating      

        return Response(
            {'success': 'Review created successfully'},
            status=status.HTTP_201_CREATED
        )


class GetReviewView(APIView):
    
    permission_classes = (permissions.AllowAny,)
    def post(self, request, format=None):
        data = request.data
        productId = data['productId']
        
        product = Product.objects.get(id=productId)
        reviews = Review.objects.filter(product=product)
        reviews = ReviewSerializer(reviews, many=True)

        return Response(
            {'reviews': reviews.data},
            status=status.HTTP_200_OK
        )
        


class ManageOrder(APIView):

    #update orderitems quantity
    def post(self, request, format=None):
        data = request.data
        productId = data['productId']
        action = data['action']
        quantity = data['quantity']
        size = data['size']

        user = request.user
        customer, created = Customer.objects.get_or_create(user=user,name=user.name,email=user.email,phone= user.phone)

        order, created = Order.objects.get_or_create(customer=customer, paid=False)

        product = Product.objects.get(id=productId)
        orderItem, created = OrderItem.objects.get_or_create(order=order,product=product, size=size)

        sizeAvailable = Sizes.objects.get(size=size, Product=product)
    
        if action == 'add':
            
            orderItem.quantity = (orderItem.quantity + quantity)
        elif action == 'remove':
            orderItem.quantity = (orderItem.quantity - 1)

        if sizeAvailable.quantity >= orderItem.quantity:
            orderItem.save()
        else:
             return Response(
                {'error': 'Quantity not available'},
                status=status.HTTP_200_OK
            )

        if orderItem.quantity <= 0:
            orderItem.delete()
   

        return Response(
                {'success': 'order updated'},
                status=status.HTTP_200_OK
            )

    #get orderitems to display in cart,cart_total_price,cart_total_quantity
    def get(self, request, format=None):
        user = request.user
        customer, created = Customer.objects.get_or_create(user=user,name=user.name,email=user.email,phone= user.phone)

        order, created = Order.objects.get_or_create(customer=customer, paid=False)

        orderitems = order.orderitem_set.all()
        total_cart_price = order.get_cart_total_price
        total_cart_quantity = order.get_cart_quantity
        cartItems = []

        for item in orderitems:
            #get serialized image from product table
            p = Product.objects.get(id=item.product.id)
            p = ProductSerializer(p)
            p = p.data
            image=p['image']

            product = {"id":item.product.id, "image":image, "name": item.product.name, "size":item.size,"price": item.product.price, "quantity":item.quantity, "total_price": item.get_total_price}
            cartItems.append(product)

        
        return Response(
             {"cartitems":cartItems, "cart_price":total_cart_price, "cart_quantity": total_cart_quantity},
                status=status.HTTP_200_OK
        )


class ProcessPayment(APIView):
    
    permission_classes = (permissions.AllowAny,)
    def post(self, request, format=None):
        data = request.data
        method = data['method']
        if (request.user.is_authenticated == True):
            user = request.user
            if(method == 'delivery'):
                
                county = data['county']
                postal_code = data['postal_code']
                address = data['address']
                payment = data['payment']
                customer, created = Customer.objects.get_or_create(user=user,name=user.name,email=user.email,phone=user.phone)
                order, created = Order.objects.get_or_create(customer=customer, paid=False)
                delivery,created = Delivery_details.objects.get_or_create(customer=customer,order=order,county=county,postal_code=postal_code,address=address)

                transaction_id = datetime.datetime.now().timestamp() + customer.id
                order.paid = True
                order.delivery_method = method
                order.payment_method = payment
                order.transaction_id = transaction_id
                order.date_ordered = datetime.datetime.now()
                order.save()
                return Response(
                    {'success': 'payment made'},
                    status=status.HTTP_200_OK
                )

            else:
                payment = data['payment']
                customer, created = Customer.objects.get_or_create(user=user,name=user.name,email=user.email,phone=user.phone)
                order, created = Order.objects.get_or_create(customer=customer, paid=False)
                transaction_id = datetime.datetime.now().timestamp() + customer.id
                order.paid = True
                order.delivery_method = method
                order.payment_method = payment
                order.transaction_id = transaction_id
                order.save()
                return Response(
                    {'success': 'payment made'},
                    status=status.HTTP_200_OK
                )

        else:
            if(method == 'delivery'):
                email = data['email']
                phone = data['phone']
                county = data['county']
                postal_code = data['postal_code']
                address = data['address']
                full_name = data['full_name']
                payment = data['payment']
                cart = data['cart']

                customer, created = Customer.objects.get_or_create(
                    email=email
                )

                customer.name= full_name
                customer.phone = phone
                customer.save()
                transaction_id = datetime.datetime.now().timestamp() + customer.id
              
                order = Order.objects.create(
                    customer = customer,
                    complete=False,
                    paid = True,
                    delivery_method = method,
                    payment_method = payment,
                    transaction_id = transaction_id,
                    date_ordered = datetime.datetime.now()
                
                )


                for i in cart:
                    product = Product.objects.get(id=i)
                    orderitem, created = OrderItem.objects.get_or_create(product=product, order=order,quantity=cart[i]['quantity'],size=cart[i]['size'])
                
                return Response(
                    {'success': 'payment made'},
                    status=status.HTTP_200_OK
                )

            else:
                email = data['email']
                phone = data['phone']
                full_name = data['full_name']
                payment = data['payment']
                cart = data['cart']

                customer, created = Customer.objects.get_or_create(
                    email=email
                )

                customer.name= full_name
                customer.phone = phone
                customer.save()
                transaction_id = datetime.datetime.now().timestamp() + customer.id
              
                order = Order.objects.create(
                    customer = customer,
                    complete=False,
                    paid = True,
                    delivery_method = method,
                    payment_method = payment,
                    transaction_id = transaction_id,
                    date_ordered = datetime.datetime.now()
                
                )

                for i in cart:
                    product = Product.objects.get(id=i)
                    orderitem, created = OrderItem.objects.get_or_create(product=product, order=order,quantity=cart[i]['quantity'],size=cart[i]['size'])
                
                
                return Response(
                    {'success': 'payment made'},
                    status=status.HTTP_200_OK
                )


@api_view(['GET'])
@permission_classes([AllowAny])
def stk_push(request):

    cl = MpesaClient()
    # Use a Safaricom phone number that you have access to, for you to be able to view the prompt.
    phone_number = '0746460915'
    amount = 1
    account_reference = 'Ndula'
    transaction_desc = 'Test stk push'
    callback_url = 'https://ndula-wango.herokuapp.com/shop/mpesa_stk_push_callback'
    response = cl.stk_push(phone_number, amount, account_reference, transaction_desc, callback_url)
    print(response)
    print(json.loads(response.text))
    return Response(
                    {'success': response},
                    status=status.HTTP_200_OK
                ) 


@api_view(['GET'])
@permission_classes([AllowAny])
def stk_push_callback(request):
        data = request.body
        print(data['ResultCode'])
        print(data['ResultDesc'])
    