"""Script to generate realistic synthetic medical test images for automated testing.

Generates:
1. sample_prescription.jpg - Medical Prescription Slip
2. sample_lab_report.jpg   - CBC Pathology Lab Report
3. sample_xray.jpg         - Chest Radiograph (PA View)
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = Path(__file__).resolve().parent / "samples"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def create_prescription_sample():
    """Create a realistic medical doctor prescription slip."""
    img = Image.new("RGB", (900, 1200), color=(253, 252, 248))
    draw = ImageDraw.Draw(img)

    # Doctor Header
    draw.rectangle([(20, 20), (880, 160)], fill=(240, 245, 255), outline=(180, 200, 230), width=2)
    draw.text((40, 35), "DR. SUBRATA MUKHERJEE, MD (General Medicine)", fill=(20, 40, 90))
    draw.text((40, 65), "Senior Consultant Physician | Reg. No: WB-MC-49210", fill=(70, 70, 70))
    draw.text((40, 95), "Aarogya Health Clinic & Diagnostic Centre, Kolkata", fill=(80, 80, 80))
    draw.text((40, 125), "Ph: +91 98300 12345 | Email: subrata.clinic@aarogya.in", fill=(100, 100, 100))

    # Patient Details Strip
    draw.line([(30, 190), (870, 190)], fill=(180, 180, 180), width=2)
    draw.text((40, 205), "Patient Name: Rahul Barman", fill=(30, 30, 30))
    draw.text((380, 205), "Age / Sex: 36 Y / Male", fill=(30, 30, 30))
    draw.text((620, 205), "Date: 11-Oct-2026", fill=(30, 30, 30))
    draw.text((40, 235), "Patient ID: AV-8921", fill=(30, 30, 30))
    draw.text((380, 235), "BP: 124/82 mmHg | Pulse: 86 bpm", fill=(30, 30, 30))
    draw.text((620, 235), "Temp: 101.4 °F", fill=(180, 40, 40))
    draw.line([(30, 270), (870, 270)], fill=(180, 180, 180), width=2)

    # Clinical Presentation
    draw.text((40, 290), "Clinical Diagnosis / Chief Complaints:", fill=(40, 40, 40))
    draw.text((50, 320), "• High fever with chills since 3 days (101.4 F)", fill=(60, 60, 60))
    draw.text((50, 345), "• Severe productive cough and throat pain", fill=(60, 60, 60))
    draw.text((50, 370), "• Body ache and fatigue. Provisional Dx: Acute Bronchial Infection / URTI", fill=(20, 30, 80))

    # Rx Symbol & Medications
    draw.text((40, 420), "Rx (Medications Prescribed):", fill=(20, 40, 100))
    draw.line([(40, 450), (860, 450)], fill=(200, 200, 200), width=1)

    meds = [
        ("1. Tab. AMOXICILLIN-CLAVULANATE 625 mg", "1 tablet Twice Daily (BD) after food for 5 days"),
        ("2. Tab. PARACETAMOL 650 mg (Dolo / Calpol)", "1 tablet Thrice Daily (TDS) SOS after meals for 3 days"),
        ("3. Cap. PANTOPRAZOLE 40 mg (Pan-D)", "1 capsule Once Daily (OD) morning 30 min before food x 5 days"),
        ("4. Syp. AMBROXOL + LEVOSALBUTAMOL (Cough)", "10 ml Thrice Daily (TDS) after food x 5 days"),
        ("5. Tab. VITAMIN C 500 mg (Chewable)", "1 tablet Once Daily (OD) after lunch x 15 days"),
    ]

    y = 470
    for med_name, instructions in meds:
        draw.text((50, y), med_name, fill=(10, 20, 60))
        draw.text((70, y + 26), f"--> {instructions}", fill=(40, 70, 40))
        y += 70
        draw.line([(50, y - 10), (850, y - 10)], fill=(230, 230, 230), width=1)

    # Advice & Follow-up
    y += 20
    draw.text((40, y), "General Instructions & Lifestyle Advice:", fill=(40, 40, 40))
    draw.text((50, y + 30), "• Drink plenty of warm water, oral rehydration fluids", fill=(60, 60, 60))
    draw.text((50, y + 55), "• Steam inhalation twice daily", fill=(60, 60, 60))
    draw.text((50, y + 80), "• Rest adequately. Avoid cold food and beverages", fill=(60, 60, 60))
    draw.text((50, y + 105), "• RED FLAGS: Visit emergency if persistent breathlessness or chest pain occurs", fill=(180, 30, 30))

    # Footer
    draw.text((550, 1100), "Dr. S. Mukherjee", fill=(20, 30, 80))
    draw.text((550, 1125), "MBBS, MD (Med)", fill=(60, 60, 60))
    draw.line([(530, 1090), (750, 1090)], fill=(100, 100, 100), width=1)

    filepath = OUTPUT_DIR / "sample_prescription.jpg"
    img.save(filepath, "JPEG", quality=90)
    print(f"Generated: {filepath}")
    return filepath


def create_lab_report_sample():
    """Create a realistic pathology laboratory diagnostic report (Complete Blood Count)."""
    img = Image.new("RGB", (900, 1200), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Diagnostic Center Header
    draw.rectangle([(20, 20), (880, 140)], fill=(245, 248, 250), outline=(200, 220, 230), width=2)
    draw.text((40, 35), "APEX CLINICAL DIAGNOSTICS & PATHOLOGY LAB", fill=(10, 50, 100))
    draw.text((40, 65), "NABL Accredited Laboratory | ISO 15189:2012 Certified", fill=(60, 110, 60))
    draw.text((40, 95), "Central Boulevard, Sector 5, Salt Lake, Kolkata | Emergency Helpline: 1800-419-8921", fill=(80, 80, 80))

    # Patient & Specimen Info Strip
    draw.rectangle([(30, 160), (870, 250)], fill=(250, 250, 250), outline=(220, 220, 220), width=1)
    draw.text((45, 175), "Patient: Rahul Barman", fill=(20, 20, 20))
    draw.text((320, 175), "Age/Sex: 36 Y / Male", fill=(20, 20, 20))
    draw.text((580, 175), "Patient ID: AV-8921", fill=(20, 20, 20))
    draw.text((45, 210), "Referred By: Dr. Subrata Mukherjee", fill=(60, 60, 60))
    draw.text((320, 210), "Collected: 11-Oct-2026 08:30 AM", fill=(60, 60, 60))
    draw.text((580, 210), "Reported: 11-Oct-2026 01:15 PM", fill=(60, 60, 60))

    # Panel Title
    draw.rectangle([(30, 270), (870, 310)], fill=(30, 70, 120))
    draw.text((45, 282), "DEPARTMENT OF HEMATOLOGY - COMPLETE BLOOD COUNT (CBC)", fill=(255, 255, 255))

    # Table Header
    draw.rectangle([(30, 320), (870, 355)], fill=(235, 240, 248))
    draw.text((45, 330), "TEST DESCRIPTION", fill=(30, 30, 30))
    draw.text((340, 330), "RESULT", fill=(30, 30, 30))
    draw.text((480, 330), "UNIT", fill=(30, 30, 30))
    draw.text((600, 330), "REFERENCE INTERVAL", fill=(30, 30, 30))
    draw.text((780, 330), "STATUS", fill=(30, 30, 30))
    draw.line([(30, 355), (870, 355)], fill=(180, 180, 180), width=1)

    # CBC Test Parameters
    rows = [
        ("Hemoglobin (Hb)", "9.2", "g/dL", "13.0 - 17.0", "LOW", (200, 30, 30)),
        ("Total Leukocyte Count (TLC/WBC)", "13,400", "/cumm", "4,000 - 11,000", "HIGH", (200, 30, 30)),
        ("RBC Count", "3.8", "mil/cumm", "4.5 - 5.5", "LOW", (200, 30, 30)),
        ("Platelet Count", "225,000", "/cumm", "150,000 - 450,000", "NORMAL", (20, 130, 40)),
        ("Packed Cell Volume (PCV)", "31.2", "%", "40.0 - 50.0", "LOW", (200, 30, 30)),
        ("Neutrophils", "79", "%", "40 - 70", "HIGH", (200, 30, 30)),
        ("Lymphocytes", "16", "%", "20 - 45", "LOW", (200, 30, 30)),
        ("Monocytes", "4", "%", "2 - 8", "NORMAL", (20, 130, 40)),
        ("Eosinophils", "1", "%", "1 - 6", "NORMAL", (20, 130, 40)),
        ("Basophils", "0", "%", "0 - 1", "NORMAL", (20, 130, 40)),
        ("Erythrocyte Sedimentation Rate (ESR)", "36", "mm/hr", "0 - 15", "HIGH", (200, 30, 30)),
    ]

    y = 370
    for name, val, unit, ref, flag, color in rows:
        draw.text((45, y), name, fill=(30, 30, 30))
        draw.text((340, y), val, fill=color)
        draw.text((480, y), unit, fill=(80, 80, 80))
        draw.text((600, y), ref, fill=(80, 80, 80))
        draw.text((780, y), flag, fill=color)
        y += 38
        draw.line([(30, y - 8), (870, y - 8)], fill=(240, 240, 240), width=1)

    # Pathologist Impression Box
    y += 30
    draw.rectangle([(30, y), (870, y + 170)], fill=(253, 248, 242), outline=(230, 200, 160), width=1)
    draw.text((45, y + 15), "PATHOLOGIST CLINICAL INTERPRETATION:", fill=(140, 50, 10))
    draw.text((45, y + 45), "1. Microcytic Mild Anemia noted with Hemoglobin 9.2 g/dL and reduced RBC indices.", fill=(40, 40, 40))
    draw.text((45, y + 75), "2. Neutrophilic Leukocytosis (WBC 13,400 with 79% Neutrophils) indicative of", fill=(40, 40, 40))
    draw.text((65, y + 100), "active bacterial / systemic inflammatory infection.", fill=(40, 40, 40))
    draw.text((45, y + 130), "3. Elevated ESR (36 mm/hr) correlates with acute inflammatory response.", fill=(40, 40, 40))

    # Doctor signature
    draw.text((580, 1100), "Dr. Anirban Roy, MD", fill=(10, 40, 80))
    draw.text((580, 1125), "Consultant Pathologist, Reg # 61204", fill=(60, 60, 60))
    draw.line([(560, 1090), (780, 1090)], fill=(120, 120, 120), width=1)

    filepath = OUTPUT_DIR / "sample_lab_report.jpg"
    img.save(filepath, "JPEG", quality=90)
    print(f"Generated: {filepath}")
    return filepath


def create_xray_sample():
    """Create a realistic Chest X-Ray radiograph visual simulation."""
    # Radiographs have a dark/black background with graded bone and soft tissue opacities
    img = Image.new("RGB", (900, 1050), color=(12, 12, 14))
    draw = ImageDraw.Draw(img)

    # Radiographic Overlay Metadata (Hospital stamping)
    draw.text((30, 25), "APEX MEDICAL IMAGING & RADIOLOGY", fill=(210, 210, 210))
    draw.text((30, 50), "CHEST PA VIEW (ERECT)", fill=(180, 180, 180))
    draw.text((30, 75), "Pt: Rahul Barman | Age: 36/M | ID: AV-8921", fill=(190, 190, 190))
    draw.text((780, 25), "R", fill=(240, 240, 240))  # Anatomical Right marker
    draw.text((700, 50), "11-OCT-2026", fill=(180, 180, 180))

    # Thoracic ribcage and spine outline (semi-radiopaque shades of gray)
    # Spine center column
    draw.rectangle([(425, 120), (475, 900)], fill=(75, 75, 80), outline=(95, 95, 100))
    for vert_y in range(130, 890, 45):
        draw.rectangle([(420, vert_y), (480, vert_y + 35)], fill=(110, 110, 115))

    # Clavicles (Collar bones)
    draw.arc([(180, 150), (450, 240)], start=160, end=350, fill=(160, 160, 165), width=14)
    draw.arc([(450, 150), (720, 240)], start=190, end=380, fill=(160, 160, 165), width=14)

    # Left & Right Ribs (posterior and anterior arcs)
    for r_idx, ry in enumerate(range(240, 780, 60)):
        # Right ribs
        draw.arc([(80, ry - 30), (450, ry + 120)], start=150, end=340, fill=(100 + r_idx * 5, 100, 105), width=10)
        # Left ribs
        draw.arc([(450, ry - 30), (820, ry + 120)], start=200, end=390, fill=(100 + r_idx * 5, 100, 105), width=10)

    # Lung Fields (Radiolucent dark lung zones)
    # Right Lung
    draw.pieslice([(120, 210), (410, 800)], start=140, end=340, fill=(24, 26, 30))
    # Left Lung
    draw.pieslice([(490, 210), (780, 800)], start=200, end=400, fill=(24, 26, 30))

    # Cardiac Silhouette (Heart shadow shifted to the left)
    draw.pieslice([(340, 480), (590, 790)], start=30, end=240, fill=(80, 82, 88))
    # Aortic Knob
    draw.pieslice([(400, 310), (480, 410)], start=180, end=360, fill=(90, 92, 98))

    # Right lower zone mild reticular haze (simulating mild bronchopneumonia / infection)
    draw.pieslice([(220, 560), (390, 740)], start=40, end=210, fill=(50, 52, 58))
    draw.text((230, 620), "[Infiltrate]", fill=(120, 120, 130))

    # Diaphragm & Costophrenic Angles
    draw.arc([(100, 720), (440, 950)], start=190, end=350, fill=(120, 120, 125), width=8)
    draw.arc([(460, 740), (800, 970)], start=190, end=350, fill=(120, 120, 125), width=8)

    # Bottom Radiology Stamp & Annotation
    draw.line([(30, 960), (870, 960)], fill=(70, 70, 70), width=1)
    draw.text((40, 975), "DIAGNOSTIC REPORT SUMMARY:", fill=(230, 230, 230))
    draw.text((40, 1000), "Bilateral lung fields show mild right lower lobe peribronchial thickening / infiltrate.", fill=(180, 180, 185))
    draw.text((40, 1022), "Cardiac silhouette normal in size. Both costophrenic angles are clear. No pneumothorax.", fill=(180, 180, 185))

    filepath = OUTPUT_DIR / "sample_xray.jpg"
    img.save(filepath, "JPEG", quality=90)
    print(f"Generated: {filepath}")
    return filepath


if __name__ == "__main__":
    rx_path = create_prescription_sample()
    lab_path = create_lab_report_sample()
    xray_path = create_xray_sample()
    print("Successfully generated all sample medical images:")
    print("1.", rx_path)
    print("2.", lab_path)
    print("3.", xray_path)
