"""
FreeCAD T-Bolt Generator with GLB/GLTF Export - Dynamic Parameters

Stepped Tube with Octagonal Boss. Called from the API endpoint.

Usage:
    Called from backend API via generate_script() and run_freecad_script()
"""

import os
import sys
import subprocess
import tempfile

WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))

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
# DYNAMIC SCRIPT TEMPLATE - Full T-Bolt geometry with octagonal boss
# ============================================================================
SCRIPT_TEMPLATE = '''
"""
FreeCAD script - T-Bolt (Stepped Tube with Octagonal Boss)
Dynamically generated with custom dimensions.
"""

import FreeCAD as App
import Part
import Sketcher
import Mesh
import MeshPart

OUTPUT_PATH = r"{output_path}"
OUTPUT_FORMAT = "{output_format}"

def create_tbolt():
    """Create a stepped tube with octagonal boss (T-Bolt)"""

    try:
        doc = App.ActiveDocument
        if doc is None:
            doc = App.newDocument('TBolt')
    except:
        doc = App.newDocument('TBolt')

    App.setActiveDocument(doc.Name)
    V = App.Vector

    print("Creating T-Bolt...")

    # ─────────────────────────────────────────────────────────────────
    # Parameters from user input
    # ─────────────────────────────────────────────────────────────────
    inner_bore_radius = {inner_bore_radius}    # Thread radius (M size / 2)
    bore_axial_len    = {bore_axial_len}       # Main body length
    step1_drop        = {step1_drop}           # Step 1 drop
    narrow_shelf_w    = {narrow_shelf_w}       # Narrow shelf width
    step2_drop        = {step2_drop}           # Step 2 drop
    outer_shelf_w     = {outer_shelf_w}        # Thread/outer shelf width
    
    boss_half_side    = {boss_half_side}       # Octagonal boss half-side (head_width / 2)
    boss_chamfer      = {boss_chamfer}         # Corner chamfer offset
    boss_depth        = {boss_depth}           # Boss/head depth
    fillet_radius     = {fillet_radius}        # Fillet radius

    # Derived values
    r1 = inner_bore_radius
    r2 = inner_bore_radius - step1_drop
    r3 = r2 - step2_drop
    
    x1 = bore_axial_len
    x2 = x1 + narrow_shelf_w
    x3 = x2 + narrow_shelf_w
    x4 = x3 + outer_shelf_w

    # ─────────────────────────────────────────────────────────────────
    # Document & Body
    # ─────────────────────────────────────────────────────────────────
    body = doc.addObject('PartDesign::Body', 'Body')
    body.Label = 'Body'
    doc.recompute()

    # ─────────────────────────────────────────────────────────────────
    # SKETCH: Revolution profile on XZ_Plane
    # X = axial direction, Y = radius
    # ─────────────────────────────────────────────────────────────────
    sketch = body.newObject('Sketcher::SketchObject', 'Profile')
    sketch.AttachmentSupport = (doc.getObject('XZ_Plane'), [''])
    sketch.MapMode = 'FlatFace'
    doc.recompute()

    segs = [
        (V(0,   0,  0), V(0,   r1, 0)),    # 0  left inner wall (vertical)
        (V(0,   r1, 0), V(x1,  r1, 0)),    # 1  inner bore shelf (horizontal)
        (V(x1,  r1, 0), V(x1,  r2, 0)),    # 2  step 1 down (vertical)
        (V(x1,  r2, 0), V(x2,  r2, 0)),    # 3  narrow shelf (horizontal)
        (V(x2,  r2, 0), V(x2,  r3, 0)),    # 4  step 2 down (vertical)
        (V(x2,  r3, 0), V(x4,  r3, 0)),    # 5  outer shelf (horizontal)
        (V(x4,  r3, 0), V(x4,  0,  0)),    # 6  outer right wall (vertical)
        (V(x4,  0,  0), V(0,   0,  0)),    # 7  base along H_Axis (horizontal)
    ]

    for p1, p2 in segs:
        sketch.addGeometry(Part.LineSegment(p1, p2), False)
    doc.recompute()

    n = len(segs)

    # Close the polygon
    for i in range(n):
        sketch.addConstraint(Sketcher.Constraint('Coincident', i, 2, (i + 1) % n, 1))
    doc.recompute()

    # Lock start to origin
    sketch.addConstraint(Sketcher.Constraint('Coincident', 0, 1, -1, 1))
    doc.recompute()

    # Direction constraints
    for i in [0, 2, 4, 6]:
        sketch.addConstraint(Sketcher.Constraint('Vertical', i))
    for i in [1, 3, 5, 7]:
        sketch.addConstraint(Sketcher.Constraint('Horizontal', i))
    doc.recompute()

    # Dimensional constraints
    sketch.addConstraint(Sketcher.Constraint('DistanceY', 0, 1, 0, 2, r1))
    sketch.addConstraint(Sketcher.Constraint('DistanceX', 0, 1, 1, 2, x1))
    sketch.addConstraint(Sketcher.Constraint('DistanceY', 2, 2, 2, 1, step1_drop))
    sketch.addConstraint(Sketcher.Constraint('DistanceX', 3, 1, 3, 2, narrow_shelf_w))
    sketch.addConstraint(Sketcher.Constraint('DistanceY', 4, 2, 4, 1, step2_drop))
    sketch.addConstraint(Sketcher.Constraint('DistanceX', 5, 1, 5, 2, outer_shelf_w))
    doc.recompute()

    sketch.Visibility = False
    doc.recompute()

    # ─────────────────────────────────────────────────────────────────
    # REVOLUTION: 360° around H_Axis
    # ─────────────────────────────────────────────────────────────────
    rev = body.newObject('PartDesign::Revolution', 'Revolution')
    rev.Profile       = (sketch, [''])
    rev.ReferenceAxis = (sketch, ['H_Axis'])
    rev.Angle         = 360.0
    rev.Reversed      = 0
    rev.Midplane      = 0
    rev.Type          = 0
    rev.UpToFace      = None
    sketch.Visibility = False
    doc.recompute()

    # ─────────────────────────────────────────────────────────────────
    # SKETCH001: Octagonal boss cross-section on YZ_Plane (at X=0)
    # Square with 45 deg corner cuts (chamfered square).
    # ─────────────────────────────────────────────────────────────────
    sk2 = body.newObject('Sketcher::SketchObject', 'BossProfile')
    sk2.AttachmentSupport = (doc.getObject('YZ_Plane'), [''])
    sk2.MapMode = 'FlatFace'
    doc.recompute()

    R = boss_half_side   # half-side of outer square
    c = boss_chamfer     # corner chamfer offset

    # 8 vertices of chamfered square (CCW from top-right of top edge)
    oct_verts = [
        V( c,  R, 0),   # v0
        V(-c,  R, 0),   # v1
        V(-R,  c, 0),   # v2
        V(-R, -c, 0),   # v3
        V(-c, -R, 0),   # v4
        V( c, -R, 0),   # v5
        V( R, -c, 0),   # v6
        V( R,  c, 0),   # v7
    ]

    for i in range(8):
        sk2.addGeometry(
            Part.LineSegment(oct_verts[i], oct_verts[(i + 1) % 8]),
            False
        )
    doc.recompute()

    # Close polygon (coincident constraints)
    for i in range(8):
        sk2.addConstraint(Sketcher.Constraint('Coincident', i, 2, (i + 1) % 8, 1))
    doc.recompute()

    # Cardinal side directions
    sk2.addConstraint(Sketcher.Constraint('Horizontal', 0))   # top edge
    sk2.addConstraint(Sketcher.Constraint('Horizontal', 4))   # bottom edge
    sk2.addConstraint(Sketcher.Constraint('Vertical',   2))   # left edge
    sk2.addConstraint(Sketcher.Constraint('Vertical',   6))   # right edge
    doc.recompute()

    # Fix all vertex positions via DistanceX/DistanceY from origin
    sk2.addConstraint(Sketcher.Constraint('DistanceX', -1, 1, 0, 1, c))    # v0x = +c
    sk2.addConstraint(Sketcher.Constraint('DistanceY', -1, 1, 0, 1, R))    # v0y = +R
    sk2.addConstraint(Sketcher.Constraint('DistanceX', 1, 1, -1, 1, c))    # v1x = -c
    sk2.addConstraint(Sketcher.Constraint('DistanceX', 2, 1, -1, 1, R))    # v2x = -R
    sk2.addConstraint(Sketcher.Constraint('DistanceY', -1, 1, 2, 1, c))    # v2y = +c
    sk2.addConstraint(Sketcher.Constraint('DistanceY', 3, 1, -1, 1, c))    # v3y = -c
    sk2.addConstraint(Sketcher.Constraint('DistanceX', 4, 1, -1, 1, c))    # v4x = -c
    sk2.addConstraint(Sketcher.Constraint('DistanceY', 4, 1, -1, 1, R))    # v4y = -R
    sk2.addConstraint(Sketcher.Constraint('DistanceX', -1, 1, 5, 1, c))    # v5x = +c
    sk2.addConstraint(Sketcher.Constraint('DistanceX', -1, 1, 6, 1, R))    # v6x = +R
    sk2.addConstraint(Sketcher.Constraint('DistanceY', 6, 1, -1, 1, c))    # v6y = -c
    sk2.addConstraint(Sketcher.Constraint('DistanceY', -1, 1, 7, 1, c))    # v7y = +c
    doc.recompute()

    sk2.Visibility = False
    doc.recompute()

    # ─────────────────────────────────────────────────────────────────
    # PAD: Boss outward from left end (along -X / reversed N_Axis)
    # ─────────────────────────────────────────────────────────────────
    pad = body.newObject('PartDesign::Pad', 'Boss')
    pad.Profile           = (sk2, [''])
    pad.Length            = boss_depth
    pad.ReferenceAxis     = (sk2, ['N_Axis'])
    pad.AlongSketchNormal = 1
    pad.Type              = 0
    pad.UpToFace          = None
    pad.Reversed          = 1
    pad.Midplane          = 0
    pad.Offset            = 0
    sk2.Visibility        = False
    doc.recompute()

    # ─────────────────────────────────────────────────────────────────
    # FILLET: Radius on pad-to-revolution join edge
    # ─────────────────────────────────────────────────────────────────
    try:
        fillet = body.newObject('PartDesign::Fillet', 'Fillet')
        fillet.Base   = (pad, ['Edge3'])
        fillet.Radius = fillet_radius
        pad.Visibility = False
        doc.recompute()
    except Exception as e:
        print("NOTE: Fillet skipped (" + str(e) + "). Add manually if needed.")

    print("T-Bolt created successfully.")
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
        # GUI-based export for GLB
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

doc = create_tbolt()
export_model(doc)
'''


def generate_script(output_path, output_format, m, l, head_width, head_height, slot_width, thread_len):
    """Generate the FreeCAD script with calculated parameters"""
    
    if output_path is None:
        output_path = os.path.join(WORKSPACE_DIR, "tbolt_output." + output_format)
    
    # Parse thread size (e.g., "M10" -> 10.0, or just a number)
    if isinstance(m, str) and m.upper().startswith('M'):
        try:
            thread_diameter = float(m[1:])
        except:
            thread_diameter = 10.0
    else:
        try:
            thread_diameter = float(m)
        except:
            thread_diameter = 10.0
    
    # Calculate derived parameters
    inner_bore_radius = thread_diameter / 2.0        # Thread radius
    bore_axial_len    = max(10.0, l)                 # Main body length
    step1_drop        = max(0.5, thread_diameter * 0.075)   # Step 1 drop (~1.5mm for M20)
    narrow_shelf_w    = max(0.5, thread_diameter * 0.05)    # Narrow shelf (~1mm for M20)
    step2_drop        = max(0.25, thread_diameter * 0.025)  # Step 2 drop (~0.5mm for M20)
    outer_shelf_w     = max(5.0, thread_len)                # Thread/outer shelf
    
    boss_half_side    = max(5.0, head_width / 2.0)          # Octagonal boss half-side
    boss_chamfer      = max(1.0, boss_half_side * 0.316)    # Corner chamfer (~12mm for 38mm half-side)
    boss_depth        = max(3.0, head_height)               # Boss depth
    fillet_radius     = max(0.5, min(6.0, head_height * 0.24))  # Fillet radius (capped at 6mm)
    
    return SCRIPT_TEMPLATE.format(
        output_path=output_path.replace("\\", "\\\\"),
        output_format=output_format,
        inner_bore_radius=inner_bore_radius,
        bore_axial_len=bore_axial_len,
        step1_drop=step1_drop,
        narrow_shelf_w=narrow_shelf_w,
        step2_drop=step2_drop,
        outer_shelf_w=outer_shelf_w,
        boss_half_side=boss_half_side,
        boss_chamfer=boss_chamfer,
        boss_depth=boss_depth,
        fillet_radius=fillet_radius
    )


def run_freecad_script(script_content, use_gui=False):
    """Execute the FreeCAD script"""
    
    if use_gui:
        freecad_exe = find_freecad()
    else:
        freecad_exe = find_freecadcmd()
        if freecad_exe is None:
            freecad_exe = find_freecad()
    
    if freecad_exe is None:
        print("ERROR: FreeCAD executable not found!")
        return False
    
    # Write to system temp dir to avoid triggering uvicorn --reload file watcher
    fd, script_path = tempfile.mkstemp(suffix='.py', prefix='freecad_tbolt_')
    os.close(fd)
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write(script_content)
    
    try:
        if use_gui:
            subprocess.Popen([freecad_exe, script_path])
            return True
        else:
            result = subprocess.run([freecad_exe, script_path], capture_output=True, text=True, timeout=300)
            
            print("--- Subprocess stdout ---")
            print(result.stdout)
            if result.stderr:
                print("--- Subprocess stderr ---")
                print(result.stderr)
            print(f"--- Subprocess return code: {result.returncode} ---")
            
            # FreeCADCmd often returns non-zero during cleanup in headless mode.
            # Assume success and let file-existence check validate.
            return True
    except subprocess.TimeoutExpired:
        print("Error: FreeCAD process timed out.")
        return False
    except Exception as e:
        print(f"Error executing FreeCAD script: {str(e)}")
        return False
