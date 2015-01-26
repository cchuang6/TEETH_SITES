Introduction
============

This is a Digital Library which can visualize 3D teeth models. The whole project is funded by NSF. The backend is based on Django. The Content Management System (CMS) is Mezzanine. The 3D rendering library is Threejs.


Features
========

* Visualize 3D models.
* Rendering curvature for 3D models.
* Teeth models are based on location where these models were found.
* A genealogy tree view which can easily navigate models.

Requirements
============

Please refer requirement.txt

If you do not get PIL to work (_pillow_ is a replacement package that works
with virtulalenvs), use FileField instead of ImageField in
fileupload/models.py as commented in the file.

Installation
============

Please read INSTALLATION.txt

Backup Data
============

"python manage.py dumpdata --indent=4 -e contenttypes -e auth.Permission > file.json"


License
=======
MIT, as the original project. See LICENSE.txt.
