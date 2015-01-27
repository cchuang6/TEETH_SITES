
DEBUG = True

# Make these unique, and don't share it with anybody.
SECRET_KEY = "a6a5ba78-491e-4bfd-8318-76126bd5eabe2cf5aa63-d14c-400e-95b6-e6d186be84509aeafdad-9277-4b8d-bd3a-544ec3df4e8e"
NEVERCACHE_KEY = "dbfe96e7-f97a-43cc-8cd1-0ff879a748797bec56c1-c519-48d5-aa2b-713cb59e453ff0ea1ed2-74e9-49f3-9496-1261fdb0b0d8"

DATABASES = {
    "default": {
        # Ends with "postgresql_psycopg2", "mysql", "sqlite3" or "oracle".
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        # DB name or path to database file if using sqlite3.
        "NAME": "NSF_TEETH",
        # Not used with sqlite3.
        "USER": "cchuang6",
        # Not used with sqlite3.
        "PASSWORD": "asu1234",
        # Set to empty string for localhost. Not used with sqlite3.
        "HOST": "localhost",
        # Set to empty string for default. Not used with sqlite3.
        "PORT": "5432",
    }
}

EMAIL_HOST_USER = 'lancy0511@gmail.com'
EMAIL_USE_TLS = True 
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_PASSWORD = 'zkaqddsxcwkyspul'
EMAIL_SUBJECT_PREFIX = 'NSF_TEETH'
EMAIL_PORT = 587

#PAGES_MENU_SHOW_ALL = False

#SITE TITLE

SITE_TITLE="NSF TEETH"
SITE_TAGLINE = "This is a pilote website."


DASHBOARD_TAGS = (
    ("mezzanine_tags.app_list",),
    ("comment_tags.recent_comments",),
    ("mezzanine_tags.recent_actions",),
)

LEAFLET_CONFIG = {
    'MINIMAP': True,
    'PLUGINS': {
        'google-plugin': {
            'css': ['http://cdn.leafletjs.com/leaflet-0.7/leaflet.css'],            
            'auto-include': False,
        },
        'bing-plugin': {
            'js': '..\mapApp\static\js\Bing.js',
            'auto-include': False,
        }
    },
}


FILEBROWSER_EXTENSIONS = {
    'Folder': [''],
    'Image': ['.jpg','.jpeg','.gif','.png','.tif','.tiff'],
    'Document': ['.pdf','.doc','.rtf','.txt','.xls','.csv', '.docx'],
    'Video': ['.mov','.wmv','.mpeg','.mpg','.avi','.rm'],
    'Audio': ['.mp3','.mp4','.wav','.aiff','.midi','.m4p'],
    'Mesh': ['.stl', '.obj', '.dae'],
}

FILEBROWSER_SELECT_FORMATS = {
    'file': ['Folder', 'Image', 'Document', 'Video', 'Audio', 'Mesh'],
    'image': ['Image'],
    'document': ['Document'],
    'media': ['Video', 'Audio'],
    'mesh' : ['Mesh'],
}

FILEBROWSER_MAX_UPLOAD_SIZE = 100000000


TEETH_MODEL_FOLDER = "Models"

JQUERY_FILENAME = "jquery-2.1.0.min.js"
