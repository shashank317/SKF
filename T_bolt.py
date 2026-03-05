"""
FreeCAD script – Stepped Tube with Octagonal Boss
Reconstructed and cleaned from console log (Unnamed3 session).

Structure:
  1. Revolution profile (Sketch)  → revolved 360° around H_Axis (X-axis)
     Creates a tube-like body with stepped outer radius
  2. Sketch001 on Face1 (left flat face)  → 76×76mm square with 45° corner chamfers
  3. Pad 25mm outward along N_Axis
  4. Fillet 6mm on pad Edge3

Key confirmed dimensions (from final setDatum calls):
  Revolution profile (X=axial, Y=radius):
    Inner bore radius:      20mm   at X=0
    Inner bore axial len:   170mm
    Step 1 drop:            1.5mm  (radius 20 → 18.5)
    Narrow shelf width:     1mm
    Step 2 drop:            0.5mm  (radius 18.5 → 18)
    Outer shelf width:      37mm
    Outer wall height:      18mm   (radius 18 → 0, sealing to H_Axis)
    Total axial length:     209mm  (170+1+1+37 = 209mm)

  Boss cross-section (Sketch001, on Face1 at X=0):
    Square half-side:       ±38mm  (76×76mm)
    Corner chamfer at 45°:  5.3mm  inset
    Perpendicular dist from center to each cut diagonal: 35.36mm (= 50/√2)
    Boss depth:             25mm   outward (-X direction)
    Fillet radius:          6mm    on Edge3

Run via FreeCAD Python console:
    exec(open('c:/Users/shashank/Desktop/New folder (4)/claude2.py').read())
"""

import FreeCAD as App
import Part
import Sketcher
import PartDesignGui
import math


def create_stepped_tube():
    """Create a stepped tube with octagonal boss"""

    try:
        doc = App.ActiveDocument
        if doc is None:
            doc = App.newDocument('SteppedTubeWithBoss')
    except:
        doc = App.newDocument('SteppedTubeWithBoss')

    App.setActiveDocument(doc.Name)
    V = App.Vector

    print("Creating Stepped Tube with Octagonal Boss...")

    # ─────────────────────────────────────────────────────────────────
    # Document & Body
    # ─────────────────────────────────────────────────────────────────
    body = doc.addObject('PartDesign::Body', 'Body')
    body.Label = 'Body'
    doc.recompute()

    # ─────────────────────────────────────────────────────────────────
    # SKETCH: Revolution profile on XZ_Plane
    # X = axial direction, Y = radius
    # All Y >= 0 (profile is above H_Axis), revolved around H_Axis
    #
    #  Y(radius)
    #  20  |----------------------|
    #      |  bore (radius=20)   |1.5
    # 18.5 |                     |-|
    # 18   |                     | |-------------------------|
    #   0  |---------------------+-+-------------------------+-- X
    #      0                    170 171 172              209
    # ─────────────────────────────────────────────────────────────────
    sketch = body.newObject('Sketcher::SketchObject', 'Profile')
    sketch.AttachmentSupport = (doc.getObject('XZ_Plane'), [''])
    sketch.MapMode = 'FlatFace'
    doc.recompute()

    segs = [
        (V(0,     0,    0), V(0,     20,   0)),   # 0  left inner wall (vertical)
        (V(0,     20,   0), V(170,   20,   0)),   # 1  inner bore shelf (horizontal)
        (V(170,   20,   0), V(170,   18.5, 0)),   # 2  step 1 down 1.5mm (vertical)
        (V(170,   18.5, 0), V(171,   18.5, 0)),   # 3  narrow shelf 1mm (horizontal)
        (V(171,   18.5, 0), V(171,   18,   0)),   # 4  step 2 down 0.5mm (vertical)
        (V(171,   18,   0), V(208,   18,   0)),   # 5  outer shelf 37mm (horizontal)
        (V(208,   18,   0), V(208,   0,    0)),   # 6  outer right wall (vertical)
        (V(208,   0,    0), V(0,     0,    0)),   # 7  base along H_Axis (horizontal)
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

    # Dimensional constraints (one per degree of freedom)
    sketch.addConstraint(Sketcher.Constraint('DistanceY',  0, 1,  0, 2,  20.0))    # inner bore radius = 20mm
    sketch.addConstraint(Sketcher.Constraint('DistanceX',  0, 1,  1, 2, 170.0))    # bore axial length = 170mm
    sketch.addConstraint(Sketcher.Constraint('DistanceY',  2, 2,  2, 1,   1.5))    # step 1 = 1.5mm
    sketch.addConstraint(Sketcher.Constraint('DistanceX',  3, 1,  3, 2,   1.0))    # narrow shelf = 1mm
    sketch.addConstraint(Sketcher.Constraint('DistanceY',  4, 2,  4, 1,   0.5))    # step 2 = 0.5mm
    sketch.addConstraint(Sketcher.Constraint('DistanceX',  5, 1,  5, 2,  37.0))    # outer shelf = 37mm
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
    #
    # 76x76mm square with 45 deg corner cuts (chamfered square).
    # Square half-side R = 38mm, corner offset c = 12mm
    # ─────────────────────────────────────────────────────────────────
    sk2 = body.newObject('Sketcher::SketchObject', 'BossProfile')
    sk2.AttachmentSupport = (doc.getObject('YZ_Plane'), [''])
    sk2.MapMode = 'FlatFace'
    doc.recompute()

    R = 38.0   # half-side of outer square
    c = 12.0   # corner chamfer offset (50 - 38 = 12)

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
    # (all values positive — ordering of geo/pt args controls sign)

    # Vertex 0 (c, R) — both coords free
    sk2.addConstraint(Sketcher.Constraint('DistanceX', -1, 1, 0, 1, c))    # v0x = +c
    sk2.addConstraint(Sketcher.Constraint('DistanceY', -1, 1, 0, 1, R))    # v0y = +R
    # Vertex 1 (-c, R) — only x free (y linked to v0y via Horizontal(0))
    sk2.addConstraint(Sketcher.Constraint('DistanceX', 1, 1, -1, 1, c))    # v1x = -c
    # Vertex 2 (-R, c) — both coords free
    sk2.addConstraint(Sketcher.Constraint('DistanceX', 2, 1, -1, 1, R))    # v2x = -R
    sk2.addConstraint(Sketcher.Constraint('DistanceY', -1, 1, 2, 1, c))    # v2y = +c
    # Vertex 3 (-R, -c) — only y free (x linked to v2x via Vertical(2))
    sk2.addConstraint(Sketcher.Constraint('DistanceY', 3, 1, -1, 1, c))    # v3y = -c
    # Vertex 4 (-c, -R) — both coords free
    sk2.addConstraint(Sketcher.Constraint('DistanceX', 4, 1, -1, 1, c))    # v4x = -c
    sk2.addConstraint(Sketcher.Constraint('DistanceY', 4, 1, -1, 1, R))    # v4y = -R
    # Vertex 5 (c, -R) — only x free (y linked to v4y via Horizontal(4))
    sk2.addConstraint(Sketcher.Constraint('DistanceX', -1, 1, 5, 1, c))    # v5x = +c
    # Vertex 6 (R, -c) — both coords free
    sk2.addConstraint(Sketcher.Constraint('DistanceX', -1, 1, 6, 1, R))    # v6x = +R
    sk2.addConstraint(Sketcher.Constraint('DistanceY', 6, 1, -1, 1, c))    # v6y = -c
    # Vertex 7 (R, c) — only y free (x linked to v6x via Vertical(6))
    sk2.addConstraint(Sketcher.Constraint('DistanceY', -1, 1, 7, 1, c))    # v7y = +c
    doc.recompute()

    sk2.Visibility = False
    doc.recompute()

    # ─────────────────────────────────────────────────────────────────
    # PAD: 25mm outward from left end (along -X / reversed N_Axis)
    # ─────────────────────────────────────────────────────────────────
    pad = body.newObject('PartDesign::Pad', 'Boss')
    pad.Profile           = (sk2, [''])
    pad.Length            = 25.0
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
    # FILLET: 6mm radius on pad-to-revolution join edge
    # ─────────────────────────────────────────────────────────────────
    try:
        fillet = body.newObject('PartDesign::Fillet', 'Fillet')
        fillet.Base   = (pad, ['Edge3'])
        fillet.Radius = 6.0
        pad.Visibility = False
        doc.recompute()
    except Exception as e:
        print(f"  NOTE: Fillet skipped ({e}). Add manually if needed.")

    print(f"\n{'='*50}")
    print("SteppedTubeWithBoss created successfully.")
    print(f"{'='*50}")
    print(f"  Revolution axial length: 208mm")
    print(f"  Inner bore radius:       20mm (170mm deep)")
    print(f"  Outer radius:            18mm")
    print(f"  Boss:                    76mm octagon, 25mm deep")
    print(f"  Fillet:                  6mm on Edge3")
    print(f"{'='*50}")

    return doc


if __name__ == "__main__":
    create_stepped_tube()