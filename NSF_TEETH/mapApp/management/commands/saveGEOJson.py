# -*- coding: utf-8 -*-
"""
Created on Thu Mar 06 22:53:15 2014

@author: chiayuanchuang
"""
# To Do:
# Write another version for specific database, See loaddata.py in django.core commands
#

import os
from django.db import DEFAULT_DB_ALIAS
from django.core.management.base import BaseCommand, CommandError
from django.core.serializers import deserialize
from optparse import make_option

class Command(BaseCommand):
    option_list = BaseCommand.option_list + (
            make_option('--database', action='store', dest='database',
            default=DEFAULT_DB_ALIAS, help='Nominates a specific database to save '
            'fixtures in. Defaults to the "default" database.'),        
    )
    help = ("save a GEOJson file into database ")
    args = '[filename]'

    def handle(self, *files, **options):
        if len(files) == 0:
            raise CommandError("You have to assign a file")
        for fileName in files:
            try:                
                if os.path.splitext(fileName)[1] != ".geojson":
                    raise CommandError("Can only parse *.geojson file")
                source = open(fileName) #'testData.geojson'  
                for ws in deserialize('geojson', source):
                    ws.save()   
            except IOError as e:
                print "I/O error({0}): {1}".format(e.errno, e.strerror)

