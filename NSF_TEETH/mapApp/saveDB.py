# -*- coding: utf-8 -*-
"""
Created on Wed Feb 26 21:49:04 2014

@author: chiayuanchuang
"""
# import modules used here -- sys is a very standard one
import sys

# Gather our code in a main() function
def main(argv):
    if argv.length == 0:
        print 'saveDB.py inputfile'
    from django.core.serializers import deserialize
    source = open(argv[0]) #'testData.geojson'    
    for ws in deserialize('geojson', source):
        ws.save()
    
# the program.
if __name__ == '__main__':
    main(sys.argv[1:])
