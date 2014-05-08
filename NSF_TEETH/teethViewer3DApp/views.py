"""
@author: chiayuanchuang
@app: teethViewer3DApp
@class: views

"""

from django.shortcuts import render

def index(request):    
    return render(request, 'teethViewer3D.html')

def stlViewer(request):    
    return render(request, 'STLLoader2.html')