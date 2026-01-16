import json
import struct
import os

def inspect_glb(file_path):
    print(f"Inspecting: {file_path}")
    
    if not os.path.exists(file_path):
        print("Error: File not found")
        return

    with open(file_path, 'rb') as f:
        # Read Header
        magic = f.read(4)
        if magic != b'glTF':
            print("Error: Not a valid GLB file")
            return
            
        version = struct.unpack('<I', f.read(4))[0]
        length = struct.unpack('<I', f.read(4))[0]
        
        print(f"GLB Version: {version}")
        print(f"Total File Size: {length} bytes")
        
        # Read first chunk (JSON)
        chunk_length = struct.unpack('<I', f.read(4))[0]
        chunk_type = f.read(4)
        
        if chunk_type != b'JSON':
            print("Error: First chunk is not JSON")
            return
            
        json_data = f.read(chunk_length)
        data = json.loads(json_data.decode('utf-8'))
        
        # Analyze structure
        nodes = data.get('nodes', [])
        meshes = data.get('meshes', [])
        scenes = data.get('scenes', [])
        
        print(f"\n--- Structure Summary ---")
        print(f"Total Nodes: {len(nodes)}")
        print(f"Total Meshes: {len(meshes)}")
        
        print(f"\n--- Node Hierarchy ---")
        # Find root nodes (nodes not referenced as children of other nodes)
        all_children = set()
        for node in nodes:
            if 'children' in node:
                all_children.update(node['children'])
                
        root_nodes = [i for i in range(len(nodes)) if i not in all_children]
        
        def print_tree(node_index, indent=""):
            node = nodes[node_index]
            name = node.get('name', f"Node_{node_index}")
            mesh_index = node.get('mesh')
            mesh_info = ""
            if mesh_index is not None:
                mesh_name = meshes[mesh_index].get('name', f"Mesh_{mesh_index}")
                mesh_info = f" [Mesh: {mesh_name}]"
                
            print(f"{indent}- {name}{mesh_info}")
            
            if 'children' in node:
                for child_index in node['children']:
                    print_tree(child_index, indent + "  ")

        for root in root_nodes:
            print_tree(root)

if __name__ == "__main__":
    # Adjusted path for the user's environment
    file_path = r"c:\Users\shashank\Desktop\SKF3\frontend\src\assets\model.glb"
    inspect_glb(file_path)
