
"""
FreeCAD script - Stepped Revolution Component
Dynamically generated with custom dimensions.
"""

import FreeCAD as App
import Part
import Sketcher
import Mesh
import MeshPart

OUTPUT_PATH = r"C:\\Users\\shashank\\Desktop\\New folder (4)\\free\\output\\6.glb"
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
        (V(0,     0,    0), V(0,     25.0, 0)),
        (V(0,     25.0, 0), V(13.0,  25.0, 0)),
        (V(13.0,  25.0, 0), V(13.0,  50.0, 0)),
        (V(13.0,  50.0, 0), V(33.0,  50.0, 0)),
        (V(33.0,  50.0, 0), V(33.0,  45.0, 0)),
        (V(33.0,  45.0, 0), V(50.25,  45.0, 0)),
        (V(50.25,  45.0, 0), V(50.25,  30.0, 0)),
        (V(50.25,  30.0, 0), V(80.25,  30.0, 0)),
        (V(80.25,  30.0, 0), V(80.25,  20.0, 0)),
        (V(80.25,  20.0, 0), V(0,     20.0, 0)),
        (V(0,     20.0, 0), V(0,     0,    0)),
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
    sketch.addConstraint(Sketcher.Constraint('DistanceY', -1, 1, 1, 1, 25.0))
    sketch.addConstraint(Sketcher.Constraint('DistanceY', -1, 1, 3, 1, 50.0))
    sketch.addConstraint(Sketcher.Constraint('DistanceY', -1, 1, 5, 1, 45.0))
    sketch.addConstraint(Sketcher.Constraint('DistanceY', -1, 1, 7, 1, 30.0))
    sketch.addConstraint(Sketcher.Constraint('DistanceY', -1, 1, 9, 1, 20.0))

    sketch.addConstraint(Sketcher.Constraint('DistanceX', -1, 1, 1, 2, 13.0))
    sketch.addConstraint(Sketcher.Constraint('DistanceX', -1, 1, 3, 2, 33.0))
    sketch.addConstraint(Sketcher.Constraint('DistanceX', -1, 1, 5, 2, 50.25))
    sketch.addConstraint(Sketcher.Constraint('DistanceX', -1, 1, 7, 2, 80.25))
    
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
    
    # Save FreeCAD document first
    fcstd_path = OUTPUT_PATH.replace('.glb', '.FCStd').replace('.gltf', '.FCStd')
    doc.saveAs(fcstd_path)
    print("FreeCAD file saved: " + fcstd_path)

    body = doc.getObject('Body')
    if not body:
        print("Error: Body object not found for export.")
        return False

    try:
        # User provided GUI-based export script
        import FreeCADGui as Gui
        import ImportGui
        
        print("FreeCAD GUI environment detected. Attempting native GLB export via ImportGui...")
        
        __objs__ = [body]
        if hasattr(ImportGui, "exportOptions"):
            options = ImportGui.exportOptions(OUTPUT_PATH)
            ImportGui.export(__objs__, OUTPUT_PATH, options)
        else:
            ImportGui.export(__objs__, OUTPUT_PATH)
            
        print(OUTPUT_FORMAT.upper() + " successfully saved via ImportGui: " + OUTPUT_PATH)
        
    except ImportError:
        print("Headless mode detected (FreeCADCmd). ImportGui not available.")
        print("Falling back to STL/OBJ...")
        
        # Fallback to mesh export for headless
        compound = body.Shape
        mesh = MeshPart.meshFromShape(
            Shape=compound, LinearDeflection=0.1, AngularDeflection=0.5, Relative=False
        )
        stl_path = OUTPUT_PATH.replace('.glb', '.stl').replace('.gltf', '.stl')
        mesh.write(stl_path)
        print("STL saved: " + stl_path)
        
        obj_path = OUTPUT_PATH.replace('.glb', '.obj').replace('.gltf', '.obj')
        mesh.write(obj_path)
        print("OBJ saved: " + obj_path)
    except Exception as e:
        print("Export failed: " + str(e))
    
    return True

doc = create_stepped_revolution()
export_model(doc)
