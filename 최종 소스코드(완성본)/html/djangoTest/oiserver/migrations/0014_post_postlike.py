# -*- coding: utf-8 -*-
# Generated by Django 1.11.9 on 2018-06-16 18:44
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('oiserver', '0013_auto_20180616_2347'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='postlike',
            field=models.IntegerField(default='0'),
        ),
    ]
