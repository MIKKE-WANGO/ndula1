# Generated by Django 4.0.4 on 2022-08-19 17:39

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('shop', '0014_order_payment_method'),
    ]

    operations = [
        migrations.CreateModel(
            name='Delivery_details',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('county', models.CharField(blank=True, max_length=200)),
                ('postal_code', models.IntegerField(blank=True, default=0, null=True)),
                ('address', models.IntegerField(blank=True, default=0, null=True)),
                ('customer', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='shop.customer')),
                ('order', models.OneToOneField(null=True, on_delete=django.db.models.deletion.SET_NULL, to='shop.order')),
            ],
        ),
    ]
