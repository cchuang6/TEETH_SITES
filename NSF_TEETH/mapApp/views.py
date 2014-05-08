"""
@author: chiayuanchuang
@app: mapApp
@class: views

"""

from djgeojson.views import GeoJSONLayerView

class MapLayer(GeoJSONLayerView):
    properties = ['model', 'name']