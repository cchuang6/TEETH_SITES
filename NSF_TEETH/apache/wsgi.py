import os,sys, site

#def printMessage(message):
#	print >> sys.stderr, "message"

## ADD the username for the virtualenv you installed
#  You can get user name by CMD:
#  echo %USERPROFILE%
#
#username = ["chiayuanchuang"]

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
PROJECT_DIRNAME = PROJECT_ROOT.split(os.sep)[-1]



#print "SITE_PACKAGES_PATH: " + os.environ["SITE_PACKAGES_PATH"]
#printMessage("GDAL_DATA: " + os.environ["GDAL_DATA"])
#PACKAGES_PATH = os.environ["SITE_PACKAGES_PATH"]
#PACKAGES_PATH = "C:\\Users\\" + username[0] + "\\Envs\\nsf_teeth\\Lib\\site-packages"
#print "PACKAGES_PATH: " + PACKAGES_PATH
#sys.path.insert(0, PROJECT_ROOT)
#sys.path.insert(0, PACKAGES_PATH)
#site.addsitedir(PACKAGES_PATH)


sys.path.append(os.path.abspath(os.path.join(PROJECT_ROOT, "..")))

##PRINT ALL PATH
#print "Path--------------"
#for path in sys.path:
#	print path
#print "End print path------"


settings_module = "%s.settings" % PROJECT_DIRNAME
os.environ["DJANGO_SETTINGS_MODULE"] = settings_module


import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()


