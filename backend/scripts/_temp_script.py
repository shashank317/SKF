
"""
FreeCAD script - Stepped Revolution Component
Dynamically generated with custom dimensions.
"""

import FreeCAD as App
import Part
import Sketcher
import Mesh
import MeshPart

OUTPUT_PATH = r"C:\\Users\\sumit\\OneDrive\\Desktop\\projects\\SKF\\SKF\\backend\\exports\\custom_model_a7b62b70.glb"
OUTPUT_FORMAT = "glb"

def create_stepped_revolution():
    """Create a stepped revolution component"""

    try:
        doc = App.ActiveDocument
        if doc is None:
            doc = App.newDocument('SteppedRevolution')
    except:
        doc = App.newDocument('SteppedRevolution')

    App.setActiveDocument(doc.Name)

    print("Creating Stepped Revolution component...")

    # -- Document & Body --
    body = doc.addObject('PartDesign::Body', 'Body')
    body.Label = 'Body'
    doc.recompute()

    # -- Sketch on XY Plane --
    sketch = body.newObject('Sketcher::SketchObject', 'Profile')
    sketch.AttachmentSupport = (doc.getObject('XY_Plane'), [''])
    sketch.MapMode = 'FlatFace'
    doc.recompute()

    V = App.Vector

    # Profile geometry (dynamic points based on input)
    segments = [
        (V(0,     0,    0), V(0,     22.2, 0)),
        (V(0,     22.2, 0), V(16.5,  22.2, 0)),
        (V(16.5,  22.2, 0), V(16.5,  53.0, 0)),
        (V(16.5,  53.0, 0), V(36.5,  53.0, 0)),
        (V(36.5,  53.0, 0), V(36.5,  48.0, 0)),
        (V(36.5,  48.0, 0), V(41.5,  48.0, 0)),
        (V(41.5,  48.0, 0), V(41.5,  43.0, 0)),
        (V(41.5,  43.0, 0), V(46.5,  43.0, 0)),
        (V(46.5,  43.0, 0), V(46.5,  17.2, 0)),
        (V(46.5,  17.2, 0), V(0,     17.2, 0)),
        (V(0,     17.2, 0), V(0,     0,    0)),
    ]

    for p1, p2 in segments:
        sketch.addGeometry(Part.LineSegment(p1, p2), False)
    doc.recompute()

    # Close polygon
    n = len(segments)
    for i in range(n):
        sketch.addConstraint(Sketcher.Constraint('Coincident', i, 2, (i + 1) % n, 1))
    
    # Lock origin
    sketch.addConstraint(Sketcher.Constraint('Coincident', 0, 1, -1, 1))
    doc.recompute()

    # Horizontal / vertical constraints
    for i in [0, 2, 4, 6, 8, 10]:
        sketch.addConstraint(Sketcher.Constraint('Vertical', i))
    for i in [1, 3, 5, 7, 9]:
        sketch.addConstraint(Sketcher.Constraint('Horizontal', i))
    doc.recompute()

    # Dimensional Constraints (Using exact coordinates)
    sketch.addConstraint(Sketcher.Constraint('DistanceY', -1, 1, 1, 1, 22.2))
    sketch.addConstraint(Sketcher.Constraint('DistanceY', -1, 1, 3, 1, 53.0))
    sketch.addConstraint(Sketcher.Constraint('DistanceY', -1, 1, 5, 1, 48.0))
    sketch.addConstraint(Sketcher.Constraint('DistanceY', -1, 1, 7, 1, 43.0))
    sketch.addConstraint(Sketcher.Constraint('DistanceY', -1, 1, 9, 1, 17.2))

    sketch.addConstraint(Sketcher.Constraint('DistanceX', -1, 1, 1, 2, 16.5))
    sketch.addConstraint(Sketcher.Constraint('DistanceX', -1, 1, 3, 2, 36.5))
    sketch.addConstraint(Sketcher.Constraint('DistanceX', -1, 1, 5, 2, 41.5))
    sketch.addConstraint(Sketcher.Constraint('DistanceX', -1, 1, 7, 2, 46.5))
    
    doc.recompute()
    sketch.Visibility = False
    doc.recompute()

    # Revolution
    rev = body.newObject('PartDesign::Revolution', 'Revolution')
    rev.Profile = (sketch, [''])
    rev.ReferenceAxis = (sketch, ['H_Axis'])
    rev.Angle = 360.0
    doc.recompute()

    print("SteppedRevolution created successfully with custom dimensions.")
    return doc

def export_model(doc):
    """Export the model to GLB/GLTF format"""
    print("Exporting to " + OUTPUT_FORMAT.upper() + "...")
    
    shapes = []
    for obj in doc.Objects:
        if hasattr(obj, 'Shape') and obj.Shape.Solids:
            shapes.append(obj.Shape)
    
    if not shapes:
        print("No shapes found to export!")
        return False
    
    if len(shapes) > 1:
        compound = Part.makeCompound(shapes)
    else:
        compound = shapes[0]
    
    mesh = MeshPart.meshFromShape(
        Shape=compound, LinearDeflection=0.1, AngularDeflection=0.5, Relative=False
    )
    
    stl_path = OUTPUT_PATH.replace('.glb', '.stl').replace('.gltf', '.stl')
    mesh.write(stl_path)
    print("STL saved: " + stl_path)
    
    obj_path = OUTPUT_PATH.replace('.glb', '.obj').replace('.gltf', '.obj')
    mesh.write(obj_path)
    print("OBJ saved: " + obj_path)

    try:
        mesh.write(OUTPUT_PATH)
        print(OUTPUT_FORMAT.upper() + " saved: " + OUTPUT_PATH)
    except Exception as e:
        print("Direct " + OUTPUT_FORMAT.upper() + " export not available. Use STL or OBJ instead.")
    
    fcstd_path = OUTPUT_PATH.replace('.glb', '.FCStd').replace('.gltf', '.FCStd')
    doc.saveAs(fcstd_path)
    print("FreeCAD file saved: " + fcstd_path)
    
    return True

doc = create_stepped_revolution()
export_model(doc)
