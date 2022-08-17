from datetime import datetime, timedelta
from statistics import mean
from django.conf import settings
from django.db import models

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from cloudinary.models import CloudinaryField

# Create your models here.

#custom user manager
class UserAccountManager(BaseUserManager):

    def create_user(self, email, name, phone, password=None):
        if not email:
            raise ValueError('Users must have email address')

        #ensure emails are consistent
        email = self.normalize_email(email)
        email = email.lower()

        #create user
        user = self.model(
            email = email,
            name = name,
            phone= phone
        )
        user.set_password(password)
        user.save()

        return user

    def create_superuser(self, email, name,phone, password=None):
        user = self.create_user(email, name, phone, password)
        user.is_superuser = True
        user.is_staff = True
        user.save()

        return user    

class UserAccount(AbstractBaseUser, PermissionsMixin):

    #i can add any other fields i would want a user to have such as phone number
    email = models.EmailField(max_length=255, unique=True)
    name = models.CharField(max_length=255, null=True)
    phone = models.CharField(max_length=10,null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserAccountManager()

    #determine what default login will be 
    #Normally it is 'username' but i want to use email
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'phone' ]

    def get_full_name(self):
        return self.name

    def get_short_name(self):
        return self.name
    
    def __str__(self):
        return self.email


class ResetPasswordCode(models.Model):
    email = models.EmailField()
    code = models.CharField(max_length=6)
    date_created = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateTimeField(null=True)
   
class Customer(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True,)
    name = models.CharField(max_length=100, null=True,blank=True)
    email = models.EmailField( max_length=100, null=True,blank=True, unique=True)
    phone = models.CharField(max_length=10,null=True)
    def __str__(self):
        return self.user.email

class Product(models.Model):
    class Color(models.TextChoices):
        BLACK = 'black'
        RED = 'red'
        BROWN = 'brown'
        GREEN = 'green'
        BLUE = 'blue'
        WHITE = 'white'
    
    class Status(models.TextChoices):
        NEW = 'new'
        TOP = 'top'

    class Brand(models.TextChoices):
        NIKE = 'nike'
        ADIDDAS = 'adiddas'
        NEWBALANCE = 'new balance'

    name = models.CharField(max_length=200,blank=True)
    price = models.IntegerField(blank=True)
    brand =  models.CharField(max_length=20, choices=Brand.choices, default=Brand.NIKE)
    color =  models.CharField(max_length=20, choices=Color.choices, default=Color.BLACK)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    description = models.TextField(null=True,blank=True)
    date_added = models.DateTimeField(auto_now_add=True)
    quantity = models.IntegerField(default=0, null=True, blank=True)
    rating = models.DecimalField(max_digits= 7, decimal_places=2,blank=True, default=0)
    image = CloudinaryField('image')
    image1 = CloudinaryField('image')
    image2 = CloudinaryField('image')

    #total quantity
    @property
    def get_product_quantity(self):
        sizes = self.sizes_set.all()
        total = sum([size.quantity for size in sizes])
        return total

    @property
    def get_avg_rating(self):
        reviews = self.review_set.all()
        average = mean([review.rating for review in reviews])
        self.rating = average
        self.save()
        return average


    def __str__(self):
        return self.name


class Sizes(models.Model):
    Product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=False)
    size = models.IntegerField(default=0, null=True, blank=True)
    quantity = models.IntegerField(default=0, null=True, blank=True)

    def __str__(self):
        return "{}".format(self.size) + " " + self.Product.name


class WishlistItem(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True,)
    product =  models.ForeignKey(Product, on_delete=models.CASCADE, null=True)
    date_added = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.product.name


class Review(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True,)
    
    name = models.CharField(max_length=200,blank=True)
    product =  models.ForeignKey(Product, on_delete=models.CASCADE, null=True)
    rating = models.DecimalField(max_digits= 7, decimal_places=2,blank=True, default=0)
    comment = models.TextField(null=True,blank=True)
    date_added = models.DateTimeField(auto_now_add=True)




class Order(models.Model):
    class Status(models.TextChoices):
        PROCESSING = 'Processing'
        TRANSIT = 'Transit'
        ARRIVED = 'Arrived'

    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=False)
    date_created = models.DateTimeField(auto_now_add=True)
    date_ordered = models.DateField(null=True)
    paid = models.BooleanField(default=False)
    status =  models.CharField(max_length=20,choices=Status.choices, default=Status.PROCESSING)
    complete = models.BooleanField(default=False)
    transaction_id = models.CharField(max_length=100, null=True,blank=True)

    def __str__(self):
        return self.customer.__str__() + " " + str(self.id)

    #total price
    @property
    def get_cart_total_price(self):
        orderitems = self.orderitem_set.all()
        total = sum([item.get_total_price for item in orderitems])
        return total

    #total quantity
    @property
    def get_cart_quantity(self):
        orderitems = self.orderitem_set.all()
        total = sum([item.quantity for item in orderitems])
        return total


class OrderItem(models.Model):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True)
    quantity = models.IntegerField(default=0, null=True, blank=True)
    date_added = models.DateTimeField(auto_now_add=True)
    size = models.IntegerField(default=0, null=True, blank=True)

    def __str__(self):
        return self.product.name


    @property
    def get_total_price(self):
        total = self.product.price *self.quantity
        return total
