# -*- coding: utf-8 -*-
"""
Created on Thu Mar 06 16:56:28 2014

@author: chiayuanchuang
@app: teethViewer3DApp
@class: urls
"""

from django.conf.urls import patterns, url
from django.views.generic import TemplateView
from teethViewer3DApp import views


urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'test_django_geo.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    #url(r'^admin/', include(admin.site.urls)),
    url(r'^$', views.index, name='teethViewer3DHome'),
    url(r'^stlViewer/', views.stlViewer, name='stlLoader'),
    
    

)