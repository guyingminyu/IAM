# Generated by Django 2.1 on 2019-06-19 10:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_auto_20190610_1952'),
    ]

    operations = [
        migrations.AlterField(
            model_name='step',
            name='step_type',
            field=models.CharField(max_length=100, verbose_name='类型'),
        ),
    ]
