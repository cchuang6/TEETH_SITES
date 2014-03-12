
# Create your views here.
# Create your views here.

from djgeojson.views import GeoJSONLayerView

class MapLayer(GeoJSONLayerView):
    properties = ['model', 'name']