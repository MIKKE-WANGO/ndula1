# Generated by Django 4.0.4 on 2022-08-14 18:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shop', '0009_product_rating'),
    ]

    operations = [
        migrations.AddField(
            model_name='review',
            name='name',
            field=models.CharField(blank=True, max_length=200),
        ),
    ]