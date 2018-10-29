# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin
from .models import UserInfo, UserRoom, UserImage, MultiPlayRoom, UserVideo, Post, Comment
# Register your models here.
admin.site.register(UserInfo)
admin.site.register(UserRoom)
admin.site.register(UserImage)
admin.site.register(MultiPlayRoom)
admin.site.register(UserVideo)
admin.site.register(Post)
admin.site.register(Comment)


