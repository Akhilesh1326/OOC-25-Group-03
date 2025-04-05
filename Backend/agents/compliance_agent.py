import json

with open("data/company_profile.json") as f:
    profile = json.load(f)

def check_compliance(analysis):
    compliance_report = []
    for chunk in analysis["chunks"]:
        if "ISO" in chunk and not profile.get("certifications", {}).get("ISO"):
            compliance_report.append("Missing ISO Certification")
    return compliance_report
