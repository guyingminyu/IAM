# Generated by Django 2.1 on 2019-07-25 11:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_auto_20190725_1041'),
    ]

    operations = [
        migrations.AddField(
            model_name='tasklog',
            name='duration',
            field=models.IntegerField(default=0),
        ),
    ]
