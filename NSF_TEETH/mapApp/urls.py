# -*- coding: utf-8 -*-
"""
Created on Thu Mar 06 16:56:28 2014

@author: chiayuanchuang
@app: mapApp
@class: urls
"""

from django.conf.urls import patterns, url
from django.views.generic import TemplateView
from djgeojson.views import GeoJSONLayerView
from .models import LocationPoint
from .models import LocationPolygon
from .views import MapLayer


urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'test_django_geo.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    #url(r'^admin/', include(admin.site.urls)),
    url(r'^$', TemplateView.as_view(template_name = 'mappage.html'), name='mapHome'),
    url(r'^testSVG$', TemplateView.as_view(template_name = 'testSVG.html'), name='testSVG'),
    url(r'^treeView$', TemplateView.as_view(template_name = 'treeview.html'), name='treeView'),    
    url(r'^data.geojsonPoint$', MapLayer.as_view(model=LocationPoint), name='dataPoint'),
    url(r'^data.geojsonPolygon$', GeoJSONLayerView.as_view(model=LocationPolygon), name='dataPolygon'),
)