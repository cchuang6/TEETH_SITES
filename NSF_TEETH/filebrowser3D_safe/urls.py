from __future__ import unicode_literals

from django.conf.urls import *

urlpatterns = patterns('',

    # filebrowser urls
    url(r'^browse/$', 'filebrowser3D_safe.views.browse', name="fb_browse"),
    url(r'^mkdir/', 'filebrowser3D_safe.views.mkdir', name="fb_mkdir"),
    url(r'^upload/', 'filebrowser3D_safe.views.upload', name="fb_upload"),
    url(r'^rename/$', 'filebrowser3D_safe.views.rename', name="fb_rename"),
    url(r'^delete/$', 'filebrowser3D_safe.views.delete', name="fb_delete"),
    url(r'^view3D/$', 'filebrowser3D_safe.views.view3D', name="fb_view3D"),
    url(r'^check_file/$', 'filebrowser3D_safe.views._check_file', name="fb_check"),
    url(r'^upload_file/$', 'filebrowser3D_safe.views._upload_file', name="fb_do_upload"),


)
