import os,sys
#os.environ['PATH'] = 'C:\\OSGeo4W\\bin;' + os.environ['PATH']
print os.environ['PATH']
sys.path.append('C:\TEETH_SITES')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "NSF_TEETH.settings")

import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()