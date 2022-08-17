from django import forms
from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.core.exceptions import ValidationError
from .models import *

from django.contrib.auth import get_user_model
User = get_user_model()


class UserCreationForm(forms.ModelForm):
    """A form for creating new users. Includes all the required
    fields, plus a repeated password."""
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Password confirmation', widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ('email', 'name', 'phone')

    def clean_password2(self):
        # Check that the two password entries match
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):
        # Save the provided password in hashed format
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    """A form for updating users. Includes all the fields on
    the user, but replaces the password field with admin's
    disabled password hash display field.
    """
    password = ReadOnlyPasswordHashField()

    class Meta:
        model = User
        fields = ('email', 'password', 'name', 'phone', 'is_active', 'is_staff')


class UserAdmin(BaseUserAdmin):
    # The forms to add and change user instances
    form = UserChangeForm
    add_form = UserCreationForm

    # The fields to be used in displaying the User model.
    # These override the definitions on the base UserAdmin
    # that reference specific fields on auth.User.
    list_display = ('email', 'name', 'phone')
    list_filter = ('is_staff',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('phone','name')}),
        ('Permissions', {'fields': ('is_staff',)}),
    )
    # add_fieldsets is not a standard ModelAdmin attribute. UserAdmin
    # overrides get_fieldsets to use this attribute when creating a user.
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'phone', 'password1', 'password2'),
        }),
    )
    search_fields = ('email',)
    ordering = ('email',)
    filter_horizontal = ()



class ResetPasswordCodeAdmin(admin.ModelAdmin):
    list_display = ('email', 'code', 'date_created', 'expiry_date')


class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone')


class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'quantity')
    list_filter = ('price', 'quantity')


class SizesAdmin(admin.ModelAdmin):
    
    list_filter = ('size', 'quantity')

class WishlistItemAdnmin(admin.ModelAdmin):
    list_display = ('user', 'product')


class ReviewAdnmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'rating')



class OrderAdmin(admin.ModelAdmin):
    list_display = ('id','customer', 'paid', 'complete', 'date_ordered')
    ordering = ('date_ordered',)
    list_filter = ('paid', 'complete')

class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('product','order', 'quantity', 'size', 'date_added')


admin.site.register(User, UserAdmin,)
admin.site.register(ResetPasswordCode ,ResetPasswordCodeAdmin)
admin.site.register(Customer, CustomerAdmin)
admin.site.register(Sizes, SizesAdmin)
admin.site.register(Product, ProductAdmin)

admin.site.register(WishlistItem,WishlistItemAdnmin)

admin.site.register(Review,ReviewAdnmin)


admin.site.register(Order, OrderAdmin)
admin.site.register(OrderItem, OrderItemAdmin)