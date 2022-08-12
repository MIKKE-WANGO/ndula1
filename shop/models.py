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
    image = CloudinaryField('image')
    image1 = CloudinaryField('image')
    image2 = CloudinaryField('image')

    #total quantity
    @property
    def get_product_quantity(self):
        sizes = self.sizes_set.all()
        total = sum([size.quantity for size in sizes])
        return total

    def __str__(self):
        return self.name


class Sizes(models.Model):
    Product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=False)
    size = models.IntegerField(default=0, null=True, blank=True)
    quantity = models.IntegerField(default=0, null=True, blank=True)

    def __str__(self):
        return self.size

