# -*- coding: utf-8 -*-
# Generated by Django 1.11.9 on 2018-06-23 18:26
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('oiserver', '0015_auto_20180617_0345'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='comment',
            name='password',
        ),
    ]
