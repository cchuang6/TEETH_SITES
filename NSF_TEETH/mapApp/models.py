"""
@author: chiayuanchuang
@app: mapApp
@class: models

"""

from django.db import models

# Create your models here.
from django.contrib.gis.db import models as gismodels
from django.utils.translation import ugettext_lazy as _
from mezzanine.pages.models import Page

class MapPage(Page):
    class Meta:
        verbose_name= _("Map Page")
        verbose_name_plural=_("Map Pages")

class LocationPoint(gismodels.Model):
    #id = models.IntegerField()
    name = models.CharField(max_length=256)
    geom = gismodels.PointField()
    objects = gismodels.GeoManager()

    def __unicode__(self):
        return self.name
        
class LocationPolygon(gismodels.Model):
    #id = models.IntegerField()
    name = models.CharField(max_length=256)
    geom = gismodels.PolygonField()
    objects = gismodels.GeoManager()

    def __unicode__(self):
        return self.name