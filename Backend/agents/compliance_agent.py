import os
import json

# Get the absolute path to the current file (compliance_agent.py)
current_dir = os.path.dirname(os.path.abspath(__file__))

# Move up to the Backend directory
backend_dir = os.path.dirname(current_dir)

# Move up to the project root (OOC25)
project_root = os.path.dirname(backend_dir)

# Construct the path to data/compliance_data.json
json_path = os.path.join(project_root, "data", "compliance_data.json")

# Load the JSON
with open(json_path, "r") as f:
    profile = json.load(f)

def check_compliance(analysis):
    compliance_report = []
    for chunk in analysis["chunks"]:
        if "ISO" in chunk and not profile.get("certifications", {}).get("ISO"):
            compliance_report.append("Missing ISO Certification")
    return compliance_report
