# -*- coding: utf-8 -*-
# Generated by Django 1.11.9 on 2018-02-01 17:47
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('oiserver', '0003_auto_20180202_0152'),
    ]

    operations = [
        migrations.AddField(
            model_name='userroom',
            name='roomName',
            field=models.CharField(default='default', max_length=100),
        ),
    ]
