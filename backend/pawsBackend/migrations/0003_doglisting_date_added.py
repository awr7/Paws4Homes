# Generated by Django 4.2.7 on 2023-12-03 13:25

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('pawsBackend', '0002_doglisting'),
    ]

    operations = [
        migrations.AddField(
            model_name='doglisting',
            name='date_added',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]