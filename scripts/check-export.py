from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET

with ZipFile('.work/smoke.zip') as archive:
    assert archive.testzip() is None
    assert archive.read('中文.txt').decode() == 'Unicode filenames work.'
    assert 'README.md' in archive.namelist()
    for name in archive.namelist():
        if name.endswith('.svg'):
            element = ET.fromstring(archive.read(name))
            assert element.tag == '{http://www.w3.org/2000/svg}svg'
            assert float(element.attrib['height']) > 0
print('ZIP integrity, Unicode names and SVG XML are valid.')
