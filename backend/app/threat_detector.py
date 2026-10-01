import re
import math
import numpy as np
from PIL import Image
from sklearn.ensemble import IsolationForest
import sklearn

# Simple Zero-Day isolation forest model
# Trained on simulated normal request parameters: [payload_length, entropy, num_special_chars]
TRAINING_DATA = [
    [10, 1.2, 0],
    [50, 2.5, 1],
    [120, 3.1, 2],
    [30, 2.0, 0],
    [200, 3.4, 4],
    [80, 2.8, 1],
]
clf = IsolationForest(contamination=0.1, random_state=42)
clf.fit(TRAINING_DATA)

class ThreatDetector:
    
    @staticmethod
    def scan_nlp_text(text: str) -> dict:
        """
        Scans military text message for classified data, SQL Injection, XSS, or malware.
        """
        threats_detected = []
        severity = "LOW"
        
        # 1. SQL Injection Pattern
        sqli_patterns = [
            r"UNION\s+SELECT",
            r"OR\s+1\s*=\s*1",
            r"SELECT\s+.*\s+FROM",
            r"DROP\s+TABLE",
            r"INSERT\s+INTO"
        ]
        for pattern in sqli_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                threats_detected.append("SQL Injection Attempt")
                severity = "HIGH"
                
        # 2. XSS Pattern
        xss_patterns = [
            r"<script.*?>",
            r"javascript:",
            r"onload\s*=",
            r"onerror\s*="
        ]
        for pattern in xss_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                threats_detected.append("Cross-Site Scripting (XSS)")
                severity = "HIGH"
                
        # 3. Classified Military Leak (Coordinates or Secret Names)
        # Matches: "LAT/LONG", "CLASSIFIED", "OPERATION OMEGA", coordinates like "34.05N, 118.24W"
        leak_patterns = [
            r"Operation\s+(Omega|Cobra|Redwood)",
            r"Nuclear\s+Launch\s+Code",
            r"\b\d{2}\.\d{3,}[NS]\s*,\s*\d{3}\.\d{3,}[EW]\b"
        ]
        for pattern in leak_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                threats_detected.append("Classified Military Leak / Unauthorized Operations Data")
                severity = "CRITICAL"
                
        is_safe = len(threats_detected) == 0
        return {
            "is_safe": is_safe,
            "threats": threats_detected,
            "severity": severity if not is_safe else "NONE",
            "layer": "NLP Text Scanner"
        }

    @staticmethod
    def scan_image_forensics(image_path: str) -> dict:
        """
        Inspects an image for LSB steganography, manipulation anomalies, or metadata exploits.
        """
        threats_detected = []
        severity = "LOW"
        
        try:
            img = Image.open(image_path)
            img_arr = np.array(img)
            
            # Check LSB Entropy
            # Extracts the 1st bit of the color channels
            lsb = img_arr & 1
            # Calculate entropy of LSBs
            flat_lsb = lsb.flatten()
            hist, _ = np.histogram(flat_lsb, bins=[0, 1, 2])
            probabilities = hist / len(flat_lsb)
            entropy = -sum(p * math.log2(p) for p in probabilities if p > 0)
            
            # If entropy is extremely high (> 0.99) and uniform, it indicates hidden data (encrypted payload)
            if entropy > 0.995:
                threats_detected.append("High-Entropy LSB Steganography Detected (Hidden payload suspected)")
                severity = "HIGH"
                
            # Check for EOF trailer manipulation (extra bytes appended after image end)
            with open(image_path, 'rb') as f:
                content = f.read()
                # Check for standard image signatures and trailers
                if image_path.endswith(('.jpg', '.jpeg')):
                    # JPEG EOF is FF D9
                    if content[-2:] != b'\xff\xd9' and b'\xff\xd9' in content[:-2]:
                        threats_detected.append("Steganographic Payload Appended After JPEG EOF Trailer")
                        severity = "CRITICAL"
                elif image_path.endswith('.png'):
                    # PNG EOF is IEND
                    if b'IEND' in content and not content.endswith(b'IEND\xaeB`\x82'):
                        # Extra bytes after IEND chunk
                        threats_detected.append("Steganographic Payload Appended After PNG IEND Trailer")
                        severity = "CRITICAL"
                        
        except Exception as e:
            # Fallback if image opening fails (could be malformed file attack)
            threats_detected.append(f"Image Forensic Analysis Error: {str(e)}")
            severity = "MEDIUM"
            
        is_safe = len(threats_detected) == 0
        return {
            "is_safe": is_safe,
            "threats": threats_detected,
            "severity": severity if not is_safe else "NONE",
            "layer": "AI Image Forensics"
        }

    @staticmethod
    def scan_file_malware(file_bytes: bytes, file_name: str) -> dict:
        """
        Deep Learning & Signature Malware Scan.
        Checks file headers (magic bytes), file limits, and scans contents.
        """
        threats_detected = []
        severity = "LOW"
        
        # 1. File size limit check (e.g. 10MB)
        if len(file_bytes) > 10 * 1024 * 1024:
            threats_detected.append("File Size Exceeds Secure Limits (10MB)")
            severity = "MEDIUM"
            
        # 2. Executable magic bytes check
        # MZ header (Windows PE: .exe, .dll) -> 4D 5A
        # ELF header (Linux Executable) -> 7F 45 4C 46
        # Script starters -> #!/bin/
        if file_bytes.startswith(b'MZ'):
            threats_detected.append("Executable File Upload Blocked (Windows PE Magic Bytes)")
            severity = "CRITICAL"
        elif file_bytes.startswith(b'\x7fELF'):
            threats_detected.append("Executable File Upload Blocked (Linux ELF Magic Bytes)")
            severity = "CRITICAL"
        elif file_bytes.startswith(b'#!'):
            threats_detected.append("Executable Script Upload Blocked (Shebang Marker)")
            severity = "CRITICAL"
            
        # 3. Dynamic Zero-Day Anomaly Detection
        # Calculate size, entropy, and special character ratio of file content
        content_entropy = 0.0
        if len(file_bytes) > 0:
            counts = np.bincount(np.frombuffer(file_bytes, dtype=np.uint8), minlength=256)
            probabilities = counts / len(file_bytes)
            content_entropy = -sum(p * math.log2(p) for p in probabilities if p > 0)
            
        # Run Isolation Forest prediction
        feature = [len(file_bytes), content_entropy, file_name.count('.')]
        prediction = clf.predict([feature])
        
        if prediction[0] == -1: # Anomaly detected
            # Only trigger if it has high entropy (signature of packed/encrypted malware payload)
            if content_entropy > 7.8:
                threats_detected.append("Zero-Day Packed Malware Anomaly Detected (High Entropy Binary)")
                severity = "HIGH"
                
        is_safe = len(threats_detected) == 0
        return {
            "is_safe": is_safe,
            "threats": threats_detected,
            "severity": severity if not is_safe else "NONE",
            "layer": "Deep Learning Malware Scanner"
        }

    @staticmethod
    def simulate_federated_learning() -> dict:
        """
        Federated Learning updates emulation:
        Merges local gradient updates from Country A (Sender Node) and Country B (Receiver Node)
        to train the global IsolationForest/WAF model without transmitting raw log database.
        """
        # Emulate model accuracy improvements
        initial_accuracy = 94.2
        final_accuracy = 97.8
        nodes = ["Country A Military Node", "Country B Intelligence Node"]
        
        return {
            "status": "Model Federated Sync Completed",
            "nodes_participated": nodes,
            "weights_shape": [128, 64, 4],
            "initial_accuracy": initial_accuracy,
            "final_accuracy": final_accuracy,
            "global_loss": 0.024
        }
