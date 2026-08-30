import os
import sys

root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, "backend")
sdk_dir = os.path.join(root_dir, "sdk")

# Ensure backend package (sentinel.core, sentinel.database, etc.) is primary
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

if sdk_dir not in sys.path:
    sys.path.append(sdk_dir)
