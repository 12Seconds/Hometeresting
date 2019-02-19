from django.conf.urls import url
from . import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^scene$', views.scene, name='scene'),
    url(r'^help$', views.help, name='help'),


    #ajax url
    url(r'^doSave/$', views.doSave, name='save'),		# save action
    url(r'^doLoadSearch/$', views.doLoadSearch, name='LoadSearch'), #before load search room list 
    url(r'^doLoad/$', views.doLoad, name='Load'),		# load action

    url(r'^doRename/$', views.doRename, name='rename'),     # rename action
    url(r'^doDelete/$', views.doDelete, name='delete'),     # delete action
    url(r'^doProfile/$', views.doProfile, name='profileChange'),    # setprofile action
    
    url(r'^doLoadVideo/$', views.doLoadVideo, name='LoadVideo'),    # loadVideo action
    url(r'^doLoadImage/$', views.doLoadImage, name='LoadImage'),    # loadImage action
    url(r'^doImageSearch/$', views.doImageSearch, name='ImageSearch'),  # image serach
    url(r'^doVideoSearch/$', views.doVideoSearch, name='VideoSearch'),  # image serach
    url(r'^doImageDelete/$', views.doImageDelete, name='ImageDelete'),  # image serach
    url(r'^doVideoDelete/$', views.doVideoDelete, name='VideoDelete'),  # image serach



   
    url(r'^doNicknameSave/$', views.doNicknameSave, name='nicknameSave'),        # nickname save
    url(r'^doUserRoomSearch/$', views.doUserRoomSearch, name='UserRoomSearch'),  # search onother users room with nickname 
    url(r'^doSearchLoad/$', views.doSearchLoad, name='SearchLoad'),  # return json data
    url(r'^doSearchAllImage/$', views.doSearchAllImage, name='SearchAllImage'),  # return json data
    url(r'^doInsertMulRoom/$', views.doInsertMulRoom, name='InsertMulRoom'),  # insert to multiroom db
    url(r'^doMulRoomAll/$', views.doMulRoomAll, name='MulRoomAll'),  # show all mulroomlist
    url(r'^doMulSearchLoad/$', views.doMulSearchLoad, name='MulSearchLoad'),  # join mul room
    url(r'^doMulFrameUpdate/$', views.doMulFrameUpdate, name='MulFrameUpdate'),  # multuplay host image update

    url(r'^doPostSave/$', views.doPostSave, name='PostSave'), # post save
    url(r'^getPost/$', views.getPost, name='getPost'), # post get
    url(r'^doPostDelete/$', views.doPostDelete, name='PostDelete'), # post delete
    url(r'^doPostLike/$', views.doPostLike, name='PostLike'), # post like

    url(r'^doCommentSave/$', views.doCommentSave, name='CommentSave'), # comment save
    url(r'^getComment/$', views.getComment, name='getComment'), # comment get
    url(r'^doCommentDelete/$', views.doCommentDelete, name='CommentDelete'), # comment delete

    url(r'^.well-known/acme-challenge/BBokSPJG2C6lE10fqHJlYTJWgq8XXtlxCZ_cGe3MGzo/$', views.sslFileFunc, name='sslFileFunc'),  # ssl file func

    url(r'^vrscene/$', views.VRScene, name='VRScene'),     # VR scene

    url(r'^socket/$', views.socket, name='socket'),		# multiPlay server

    url(r'^test/$', views.test, name='test'),		# test.html

]


urlpatterns += static('/media/', document_root=settings.MEDIA_ROOT)