from django.urls import path,include
from .views import *


urlpatterns = [
  path('register', RegisterView.as_view()),
  path('user-details', RetrieveUserView.as_view()),
  path('request-reset-code', SendResetPasswordCode.as_view()),
  path('test-code', TesCode.as_view()),
  path('reset-password', ResetPassword.as_view()),
  
  path('products', ProductsListView.as_view()),
  path('product-search', ProductSearchView.as_view()),
  path('product/<str:pk>', ProductDetailView.as_view()),
  
  path('recommended', RecommendedView.as_view()),
  
  path('wishlist', WishlistItemView.as_view()),
  
  path('review', CreateReviewView.as_view()),
  path('get-reviews', GetReviewView.as_view()),

  path('order', ManageOrder.as_view()),
  
  path('payment', ProcessPayment.as_view()),
]