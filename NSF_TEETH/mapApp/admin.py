from django.contrib import admin

# Register your models here.
from mezzanine.pages.admin import PageAdmin
from .models import MapPage

admin.site.register(MapPage, PageAdmin)