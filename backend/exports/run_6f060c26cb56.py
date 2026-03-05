
import json
import sys
sys.path.insert(0, r"C:/Users/shashank/Desktop/projects/SKF3/backend/scripts")

# Read config
with open(r"C:/Users/shashank/Desktop/projects/SKF3/backend/exports/config_6f060c26cb56.json") as f:
    params = json.load(f)

print("Config loaded:", params)

# Run the parametric script
from parametric_tbolt import create_tbolt
create_tbolt(params)

# Cleanup
import os
try:
    os.remove(r"C:/Users/shashank/Desktop/projects/SKF3/backend/exports/config_6f060c26cb56.json")
    os.remove(r"C:/Users/shashank/Desktop/projects/SKF3/backend/exports/run_6f060c26cb56.py")
except:
    pass
