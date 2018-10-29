# -*- coding: utf-8 -*-
# Generated by Django 1.11.9 on 2018-03-04 04:07
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('oiserver', '0007_userroom_usernickname'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userimage',
            name='userID',
        ),
        migrations.AddField(
            model_name='userimage',
            name='userNickName',
            field=models.CharField(default='default', max_length=200),
        ),
    ]
