"""
FreeCAD Stepped Revolution Component with GLB/GLTF Export

This script opens FreeCAD, generates the component from claude.py, and exports to GLB/GLTF.

Usage:
    python pully1.py                    # Generate and export
    python pully1.py --output model.glb
    python pully1.py --gui              # Open in FreeCAD GUI
"""

import subprocess
import os
import sys

WORKSPACE_DIR = r"c:\Users\shashank\Desktop\New folder (4)"

def find_freecad():
    possible_paths = [
        r"C:\Program Files\FreeCAD 1.0\bin\FreeCAD.exe",
        r"C:\Program Files\FreeCAD 0.21\bin\FreeCAD.exe",
        r"C:\Program Files\FreeCAD 0.20\bin\FreeCAD.exe",
        r"C:\Program Files\FreeCAD\bin\FreeCAD.exe",
    ]
    for path in possible_paths:
        if os.path.exists(path):
            return path
    return None

def find_freecadcmd():
    possible_paths = [
        r"C:\Program Files\FreeCAD 1.0\bin\FreeCADCmd.exe",
        r"C:\Program Files\FreeCAD 0.21\bin\FreeCADCmd.exe",
        r"C:\Program Files\FreeCAD 0.20\bin\FreeCADCmd.exe",
        r"C:\Program Files\FreeCAD\bin\FreeCADCmd.exe",
    ]
    for path in possible_paths:
        if os.path.exists(path):
            return path
    return None


# ============================================================================
# EXACT COPY OF claude.py WITH EXPORT ADDED
# ============================================================================
SCRIPT_TEMPLATE = '''
"""
FreeCAD script - Stepped Revolution Component
Cleaned and reconstructed from console log.

Profile is a closed staircase polygon revolved 360 around the Y-axis (V_Axis).

Key dimensions (from final setDatum constraints in original session):
  Radii (X mm): 0 | 13 | 33 | 100.5 | 160.5
  Heights (Y mm): 0 | 20 | 25 | 32.5 | 45 | 50
"""

import FreeCAD as App
import Part
import Sketcher
import Mesh
import MeshPart

OUTPUT_PATH = r"{output_path}"
OUTPUT_FORMAT = "{output_format}"


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

    # -- Profile geometry --
    # Closed staircase polygon. X = radius, Y = height.
    # Reading counterclockwise from origin:
    #
    #        Y
    #   50 --| ##
    #   45 --| ########
    #   32.5-| ################
    #   25 --| #
    #   20 --| ####################
    #    0 --+---------------------- X
    #        0  13  33     100.5  160.5

    V = App.Vector

    segments = [
        (V(0,     0,    0), V(0,     25,   0)),  # 0  - axis left, y: 0 -> 25
        (V(0,     25,   0), V(13,    25,   0)),  # 1  - shelf @ y=25, w=13
        (V(13,    25,   0), V(13,    50,   0)),  # 2  - step up, y: 25 -> 50
        (V(13,    50,   0), V(33,    50,   0)),  # 3  - shelf @ y=50, w=20
        (V(33,    50,   0), V(33,    45,   0)),  # 4  - step down, y: 50 -> 45
        (V(33,    45,   0), V(100.5, 45,   0)),  # 5  - shelf @ y=45, w=67.5
        (V(100.5, 45,   0), V(100.5, 32.5, 0)),  # 6  - step down, y: 45 -> 32.5
        (V(100.5, 32.5, 0), V(160.5, 32.5, 0)),  # 7  - shelf @ y=32.5, w=60
        (V(160.5, 32.5, 0), V(160.5, 20,   0)),  # 8  - outer wall, y: 32.5 -> 20
        (V(160.5, 20,   0), V(0,     20,   0)),  # 9  - base @ y=20, back to axis
        (V(0,     20,   0), V(0,     0,    0)),  # 10 - axis right, y: 20 -> 0
    ]

    for p1, p2 in segments:
        sketch.addGeometry(Part.LineSegment(p1, p2), False)
    doc.recompute()

    # -- Close the polygon (coincident constraints) --
    n = len(segments)
    for i in range(n):
        sketch.addConstraint(Sketcher.Constraint('Coincident', i, 2, (i + 1) % n, 1))
    doc.recompute()

    # -- Lock origin --
    sketch.addConstraint(Sketcher.Constraint('Coincident', 0, 1, -1, 1))
    doc.recompute()

    # -- Horizontal / vertical direction constraints --
    for i in [0, 2, 4, 6, 8, 10]:
        sketch.addConstraint(Sketcher.Constraint('Vertical', i))
    for i in [1, 3, 5, 7, 9]:
        sketch.addConstraint(Sketcher.Constraint('Horizontal', i))
    doc.recompute()

    # -- Dimensional constraints --
    # Y shelf heights
    sketch.addConstraint(Sketcher.Constraint('DistanceY', -1, 1, 1,  1,  25.0))
    sketch.addConstraint(Sketcher.Constraint('DistanceY', -1, 1, 3,  1,  50.0))
    sketch.addConstraint(Sketcher.Constraint('DistanceY', -1, 1, 5,  1,  45.0))
    sketch.addConstraint(Sketcher.Constraint('DistanceY', -1, 1, 7,  1,  32.5))
    sketch.addConstraint(Sketcher.Constraint('DistanceY', -1, 1, 9,  1,  20.0))

    # X step radii
    sketch.addConstraint(Sketcher.Constraint('DistanceX', -1, 1, 1,  2,  13.0))
    sketch.addConstraint(Sketcher.Constraint('DistanceX', -1, 1, 3,  2,  33.0))
    sketch.addConstraint(Sketcher.Constraint('DistanceX', -1, 1, 5,  2,  100.5))
    sketch.addConstraint(Sketcher.Constraint('DistanceX', -1, 1, 7,  2,  160.5))
    doc.recompute()

    sketch.Visibility = False
    doc.recompute()

    # -- Revolution (360 around H_Axis / Base X axis in XY plane) --
    rev = body.newObject('PartDesign::Revolution', 'Revolution')
    rev.Profile = (sketch, [''])
    rev.ReferenceAxis = (sketch, ['H_Axis'])
    rev.Angle = 360.0
    rev.Reversed = 0
    rev.Midplane = 0
    rev.Type = 0
    rev.UpToFace = None
    sketch.Visibility = False
    doc.recompute()

    print("=" * 50)
    print("SteppedRevolution created successfully.")
    print("=" * 50)
    print("  Radii (X mm): 0 | 13 | 33 | 100.5 | 160.5")
    print("  Heights (Y mm): 0 | 20 | 25 | 32.5 | 45 | 50")
    print("=" * 50)

    return doc


def export_model(doc):
    """Export the model to GLB/GLTF format"""
    
    print("Exporting to " + OUTPUT_FORMAT.upper() + "...")
    
    # Get all shapes from bodies
    shapes = []
    for obj in doc.Objects:
        if hasattr(obj, 'Shape') and obj.Shape.Solids:
            shapes.append(obj.Shape)
    
    if not shapes:
        print("No shapes found to export!")
        return False
    
    # Combine all shapes
    if len(shapes) > 1:
        compound = Part.makeCompound(shapes)
    else:
        compound = shapes[0]
    
    # Create mesh from shape
    mesh = MeshPart.meshFromShape(
        Shape=compound,
        LinearDeflection=0.1,
        AngularDeflection=0.5,
        Relative=False
    )
    
    # Save as STL
    stl_path = OUTPUT_PATH.replace('.glb', '.stl').replace('.gltf', '.stl')
    mesh.write(stl_path)
    print("STL saved: " + stl_path)
    
    # Save as OBJ
    obj_path = OUTPUT_PATH.replace('.glb', '.obj').replace('.gltf', '.obj')
    mesh.write(obj_path)
    print("OBJ saved: " + obj_path)
    
    # Try GLB/GLTF
    try:
        mesh.write(OUTPUT_PATH)
        print(OUTPUT_FORMAT.upper() + " saved: " + OUTPUT_PATH)
    except Exception as e:
        print("Direct " + OUTPUT_FORMAT.upper() + " export not available")
        print("Use Blender to convert STL/OBJ to GLB/GLTF")
    
    # Save FreeCAD document
    fcstd_path = OUTPUT_PATH.replace('.glb', '.FCStd').replace('.gltf', '.FCStd')
    doc.saveAs(fcstd_path)
    print("FreeCAD file saved: " + fcstd_path)
    
    return True


# Run
doc = create_stepped_revolution()
export_model(doc)
'''


def generate_script(output_path=None, output_format="glb"):
    if output_path is None:
        output_path = os.path.join(WORKSPACE_DIR, "stepped_revolution." + output_format)
    
    return SCRIPT_TEMPLATE.format(
        output_path=output_path.replace("\\", "\\\\"),
        output_format=output_format
    )


def run_freecad_script(script_content, use_gui=False):
    if use_gui:
        freecad_exe = find_freecad()
    else:
        freecad_exe = find_freecadcmd()
        if freecad_exe is None:
            freecad_exe = find_freecad()
    
    if freecad_exe is None:
        print("ERROR: FreeCAD not found!")
        return False
    
    print("Using FreeCAD: " + freecad_exe)
    
    script_path = os.path.join(WORKSPACE_DIR, "_temp_script.py")
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write(script_content)
    
    print("Script saved to: " + script_path)
    
    try:
        if use_gui:
            subprocess.Popen([freecad_exe, script_path])
            print("FreeCAD GUI launched.")
        else:
            print("Running FreeCAD in console mode...")
            result = subprocess.run(
                [freecad_exe, script_path],
                capture_output=True,
                text=True,
                timeout=300
            )
            print(result.stdout)
            if result.stderr:
                print("Errors:", result.stderr)
        return True
    except Exception as e:
        print("Error: " + str(e))
        return False


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="FreeCAD Stepped Revolution with Export")
    parser.add_argument("--output", "-o", type=str, default=None, help="Output file path")
    parser.add_argument("--format", "-f", choices=["glb", "gltf"], default="glb", help="Output format")
    parser.add_argument("--gui", action="store_true", help="Open FreeCAD GUI")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("FreeCAD Stepped Revolution Generator")
    print("=" * 60)
    print("  Radii (X mm): 0 | 13 | 33 | 100.5 | 160.5")
    print("  Heights (Y mm): 0 | 20 | 25 | 32.5 | 45 | 50")
    print("  Format: " + args.format.upper())
    print("=" * 60)
    
    script = generate_script(output_path=args.output, output_format=args.format)
    run_freecad_script(script, use_gui=args.gui)


if __name__ == "__main__":
    main()
