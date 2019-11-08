# Generated by Django 2.1 on 2019-03-04 19:16

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_api_api_case_coverage'),
    ]

    operations = [
        migrations.CreateModel(
            name='CaseApi',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('api_params', models.CharField(default='', max_length=1000)),
                ('sort', models.IntegerField(default=1)),
                ('ca_create_time', models.DateTimeField(blank=True, default=django.utils.timezone.now, null=True)),
                ('ca_update_time', models.DateTimeField(blank=True, null=True)),
                ('api', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.Api')),
                ('case', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.Case')),
            ],
        ),
        migrations.RemoveField(
            model_name='step',
            name='case',
        ),
        migrations.AddField(
            model_name='step',
            name='CaseApi',
            field=models.ForeignKey(default='', on_delete=django.db.models.deletion.CASCADE, to='api.CaseApi'),
            preserve_default=False,
        ),
    ]
