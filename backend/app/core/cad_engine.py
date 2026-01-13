"""
CAD Engine - DXF Generation Module
Generates 2D DXF drawings from configuration parameters.
"""
import ezdxf
from ezdxf import enums
from pathlib import Path
from typing import Dict, Any, Optional
import os


class DXFGenerator:
    """
    Generates DXF files for SKF Linear Guide configurations.
    """
    
    # Default export directory (relative to backend root)
    EXPORT_DIR = Path(__file__).parent.parent.parent / "exports"
    
    # Drawing constants
    LAYER_RAIL = "RAIL"
    LAYER_BLOCKS = "BLOCKS"
    LAYER_DIMENSIONS = "DIMENSIONS"
    LAYER_CENTERLINES = "CENTERLINES"
    
    # Colors (AutoCAD Color Index)
    COLOR_RAIL = 5       # Blue
    COLOR_BLOCKS = 1     # Red
    COLOR_DIMENSIONS = 7 # White/Black
    COLOR_CENTERLINES = 3 # Green
    
    def __init__(self):
        """Initialize the generator and ensure export directory exists."""
        self.EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    
    def generate_linear_guide(
        self,
        config_id: int,
        geometry_params: Dict[str, Any],
        application_params: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate a DXF file for a Linear Guide configuration.
        
        Args:
            config_id: The configuration ID (used in filename)
            geometry_params: Dict containing W (width), LS (length), etc.
            application_params: Dict containing NOB (num blocks), PN (part number), etc.
            
        Returns:
            str: The relative file path to the generated DXF file
        """
        # Extract parameters with defaults
        rail_width = float(geometry_params.get('W', 20))  # mm
        rail_length = float(geometry_params.get('LS', 500))  # mm
        num_blocks = int((application_params or {}).get('NOB', 2))
        part_number = (application_params or {}).get('PN', f'SKF-{config_id}')
        
        # Block dimensions (proportional to rail width)
        block_width = rail_width * 1.5  # Blocks are wider than rail
        block_length = rail_width * 2   # Blocks are longer than wide
        
        # Create DXF document
        doc = ezdxf.new('R2010')  # AutoCAD 2010 format for compatibility
        msp = doc.modelspace()
        
        # Setup layers
        self._setup_layers(doc)
        
        # Draw rail (centered at origin)
        rail_start_x = 0
        rail_start_y = -rail_width / 2
        self._draw_rectangle(
            msp, 
            rail_start_x, rail_start_y,
            rail_length, rail_width,
            layer=self.LAYER_RAIL
        )
        
        # Draw blocks evenly spaced along the rail
        if num_blocks > 0:
            # Calculate spacing
            total_block_space = num_blocks * block_length
            remaining_space = rail_length - total_block_space
            spacing = remaining_space / (num_blocks + 1)
            
            for i in range(num_blocks):
                block_x = spacing + i * (block_length + spacing)
                block_y = -block_width / 2
                self._draw_rectangle(
                    msp,
                    block_x, block_y,
                    block_length, block_width,
                    layer=self.LAYER_BLOCKS
                )
        
        # Draw centerline
        msp.add_line(
            (-rail_length * 0.1, 0),
            (rail_length * 1.1, 0),
            dxfattribs={'layer': self.LAYER_CENTERLINES, 'linetype': 'CENTER'}
        )
        
        # Add dimensions
        self._add_dimensions(msp, rail_length, rail_width, block_length, block_width, num_blocks)
        
        # Add title block / text
        msp.add_text(
            f"Part: {part_number}",
            dxfattribs={
                'layer': self.LAYER_DIMENSIONS,
                'height': rail_width * 0.3,
                'style': 'Standard'
            }
        ).set_placement((0, -rail_width * 2))
        
        msp.add_text(
            f"L={rail_length}mm  W={rail_width}mm  Blocks={num_blocks}",
            dxfattribs={
                'layer': self.LAYER_DIMENSIONS,
                'height': rail_width * 0.2,
                'style': 'Standard'
            }
        ).set_placement((0, -rail_width * 2.5))
        
        # Save file
        filename = f"skf_config_{config_id}.dxf"
        filepath = self.EXPORT_DIR / filename
        doc.saveas(filepath)
        
        # Return relative path for URL
        return f"/downloads/{filename}"
    
    def _setup_layers(self, doc: ezdxf.document.Drawing) -> None:
        """Create layers with appropriate colors and linetypes."""
        doc.layers.add(self.LAYER_RAIL, color=self.COLOR_RAIL)
        doc.layers.add(self.LAYER_BLOCKS, color=self.COLOR_BLOCKS)
        doc.layers.add(self.LAYER_DIMENSIONS, color=self.COLOR_DIMENSIONS)
        doc.layers.add(self.LAYER_CENTERLINES, color=self.COLOR_CENTERLINES)
        
        # Add CENTER linetype if not present
        if 'CENTER' not in doc.linetypes:
            doc.linetypes.add('CENTER', pattern='A,1.25,-.25,.25,-.25')
    
    def _draw_rectangle(
        self,
        msp,
        x: float,
        y: float,
        width: float,
        height: float,
        layer: str
    ) -> None:
        """Draw a rectangle using a closed polyline."""
        points = [
            (x, y),
            (x + width, y),
            (x + width, y + height),
            (x, y + height),
            (x, y)  # Close the rectangle
        ]
        msp.add_lwpolyline(points, dxfattribs={'layer': layer})
    
    def _add_dimensions(
        self,
        msp,
        rail_length: float,
        rail_width: float,
        block_length: float,
        block_width: float,
        num_blocks: int
    ) -> None:
        """Add dimension annotations to the drawing."""
        dim_offset = rail_width * 0.8
        
        # Rail length dimension (below)
        msp.add_linear_dim(
            base=(rail_length / 2, -rail_width / 2 - dim_offset),
            p1=(0, -rail_width / 2),
            p2=(rail_length, -rail_width / 2),
            dimstyle='Standard',
            override={'dimtxt': rail_width * 0.15}
        ).render()
        
        # Rail width dimension (left side)
        msp.add_linear_dim(
            base=(-dim_offset, 0),
            p1=(0, -rail_width / 2),
            p2=(0, rail_width / 2),
            angle=90,
            dimstyle='Standard',
            override={'dimtxt': rail_width * 0.15}
        ).render()


# Singleton instance for easy import
dxf_generator = DXFGenerator()
