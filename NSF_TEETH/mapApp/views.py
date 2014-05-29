"""
@author: chiayuanchuang
@app: mapApp
@class: views

"""
import os
from django.shortcuts import render_to_response
from django.conf import settings as django_settings
from django.utils.translation import ugettext as _
from django.template import RequestContext as Context
from django.core.files.storage import default_storage
from django.contrib import messages
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from filebrowser3D_safe.functions import (get_path, get_file, get_directory, get_settings_var)

from djgeojson.views import GeoJSONLayerView
def view3D(request):
	query = request.GET
	query = {'dir': django_settings.TEETH_MODEL_FOLDER, 'filename':query.get('filename', '')}
	for key, value in query.iteritems():
		print "key: " + key + ", value: " + value
	path = get_path(query.get('dir', ''))
	filename = get_file(path, query.get('filename', ''))
	
	
	if path is None or filename is None:
		if path is None:			
			msg = _('The requested Folder does not exist.')
		else:			
			msg = _('The requested File "%s" does not exist.') %query.get('filename', '')
			messages.add_message(request, messages.ERROR, msg)
			return HttpResponseRedirect(reverse("treeView"))

	file_url = django_settings.MEDIA_URL + get_directory() + path + "/" + filename
	abs_path = os.path.join(django_settings.MEDIA_ROOT, get_directory(), path)
	file_extension = os.path.splitext(filename)[1].lower()

	return render_to_response('teethViewer3D/teethViewer3D.html', {        
		'query': query,
		'filename': _(u'%s') % filename,
		'file_extension': file_extension,
		'title': _(u'Teeth Model "%s"') % filename,
		'settings_var': get_settings_var(),
		'file_url': _(u'%s') % file_url,        
	}, context_instance=Context(request))
	

class MapLayer(GeoJSONLayerView):
    properties = ['model', 'name']