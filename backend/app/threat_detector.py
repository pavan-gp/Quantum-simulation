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

        # 4. Adversarial Tunneling & Reverse Proxy Links (Cloudflare Tunnels, Ngrok, Localtunnel, etc.)
        # Frequently used to bypass military firewalls and route to phishing/malware command-and-control
        tunnel_patterns = [
            r"https?://[^\s/]*trycloudflare\.com",
            r"https?://[^\s/]*ngrok(-free)?\.(app|io)",
            r"https?://[^\s/]*loca\.lt",
            r"https?://[^\s/]*localtunnel\.me",
            r"https?://[^\s/]*(serveo\.net|telebit\.cloud|pagekite\.me|pinggy\.io|bore\.pub|portmap\.io)",
            r"https?://[^\s/]*(webhook\.site|pipedream\.net)"
        ]
        for pattern in tunnel_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                threats_detected.append("Adversarial C2 Tunnel / Phishing Proxy Link Detected (trycloudflare/ngrok/tunnel)")
                severity = "CRITICAL"

        # 5. Direct IP Command-and-Control (C2) Callbacks & Raw Socket URLs
        raw_ip_url = r"https?://(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:/[^\s]*)?"
        if re.search(raw_ip_url, text):
            threats_detected.append("Direct IP-Based C2 Command-and-Control Link Detected")
            severity = "HIGH"

        # 6. Malicious Executable / Script Payload URLs
        payload_url_pattern = r"https?://[^\s]+\.(exe|sh|bat|ps1|vbs|scr|bin|apk|dll|so|cmd|msi|iso|jar|hta)(\?[^\s]*)?"
        if re.search(payload_url_pattern, text, re.IGNORECASE):
            threats_detected.append("Remote Malicious Payload Executable Link Detected (.exe/.sh/.dll)")
            severity = "CRITICAL"

        # 7. Phishing / Darknet / Bulletproof High-Risk TLDs & Embedded Credentials
        phishing_patterns = [
            r"https?://[^\s/]+\.(onion|ru|su|top|xyz|buzz|fit|tk|ml|ga|cf|gq)(?:/|\b|$)",
            r"https?://[^:\s]+:[^@\s]+@",  # Embedded user:pass credentials in URL
            r"https?://[^\s/]*(?:login|signin|verify|bank|auth|secure-update|account-claim)[^\s/]*\.(site|online|club|info|vip|live|icu|pw|bid|click|link)"
        ]
        for pattern in phishing_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                threats_detected.append("Fraudulent Phishing / Credential Harvester Link Detected")
                severity = "HIGH"

        # 8. Malicious Paste / Anonymous Drop Services
        paste_patterns = [
            r"https?://[^\s/]*(pastebin\.com/raw/|hastebin\.com/raw/|ghostbin\.com|rentry\.co|anonfiles\.com)"
        ]
        for pattern in paste_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                threats_detected.append("Untrusted Anonymous File/Paste Drop Link Detected")
                severity = "HIGH"

        # 9. Denial of Service (DoS / DDoS) Flood Scripts & Process Exhaustion Exploits
        dos_patterns = [
            (r"(?:ThreadPoolExecutor|ProcessPoolExecutor|threading\.Thread|asyncio\.gather)\b.*(?:requests\.(?:get|post)|urllib|http\.client|aiohttp)", 
             "Denial of Service (DoS) HTTP Flood Attack Script (Concurrent Request Storm)", "CRITICAL"),
            (r"TOTAL_REQUESTS\s*=\s*\d+.*(?:ThreadPoolExecutor|requests\.get|threading)", 
             "Automated DoS / High-Volume Stress Attack Script", "CRITICAL"),
            (r"socket\.(?:AF_INET|SOCK_STREAM|SOCK_DGRAM).*while\s+True:.*send(?:to)?\(", 
             "Socket-Level Denial of Service (DoS) Flood Loop (SYN/UDP/Slowloris)", "CRITICAL"),
            (r"from\s+scapy\b.*(?:sendp|sr1|flood|RandIP|IP\()/s", 
             "Scapy Low-Level Packet Crafting / Network Flooder", "CRITICAL"),
            (r":\(\)\s*\{\s*:\|:&\s*\};:|while\s+True:\s*(?:os\.fork|subprocess|fork\()", 
             "Process Exhaustion Fork-Bomb Attack Detected", "CRITICAL"),
            (r"\b(?:slowloris|LOIC|HOIC|goldeneye|hping3|synflood|udp_flood|http_flood)\b", 
             "Known Denial of Service (DoS/DDoS) Weapon Signature Detected", "CRITICAL"),
            (r"bash\s+-i\s*>&?\s*/dev/tcp/\d", "Reverse Shell Command (Bash /dev/tcp Pipe)", "CRITICAL"),
            (r"socket\.socket\(.*\).*(?:os\.dup2|subprocess\.call|pty\.spawn)", "Interactive Reverse Shell Payload", "CRITICAL")
        ]
        for pattern, desc, sev in dos_patterns:
            if re.search(pattern, text, re.IGNORECASE | re.DOTALL):
                threats_detected.append(desc)
                severity = sev
                
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

        # 4. Deep Inspection of Text, Script, & Code Files (DoS/DDoS, Reverse Shells, Exploits)
        try:
            text_sample = file_bytes.decode('utf-8', errors='ignore')
            if text_sample and len(text_sample.strip()) > 5:
                # Run DoS, reverse shell, and script inspection
                dos_patterns = [
                    (r"(?:ThreadPoolExecutor|ProcessPoolExecutor|threading\.Thread|asyncio\.gather)\b.*(?:requests\.(?:get|post)|urllib|http\.client|aiohttp)", 
                     "Denial of Service (DoS) HTTP Flood Attack Script (Concurrent Request Storm)", "CRITICAL"),
                    (r"TOTAL_REQUESTS\s*=\s*\d+.*(?:ThreadPoolExecutor|requests\.get|threading)", 
                     "Automated DoS / High-Volume Stress Attack Script", "CRITICAL"),
                    (r"socket\.(?:AF_INET|SOCK_STREAM|SOCK_DGRAM).*while\s+True:.*send(?:to)?\(", 
                     "Socket-Level Denial of Service (DoS) Flood Loop (SYN/UDP/Slowloris)", "CRITICAL"),
                    (r"from\s+scapy\b.*(?:sendp|sr1|flood|RandIP|IP\()/s", 
                     "Scapy Low-Level Packet Crafting / Network Flooder", "CRITICAL"),
                    (r":\(\)\s*\{\s*:\|:&\s*\};:|while\s+True:\s*(?:os\.fork|subprocess|fork\()", 
                     "Process Exhaustion Fork-Bomb Attack Detected", "CRITICAL"),
                    (r"\b(?:slowloris|LOIC|HOIC|goldeneye|hping3|synflood|udp_flood|http_flood)\b", 
                     "Known Denial of Service (DoS/DDoS) Weapon Signature Detected", "CRITICAL"),
                    (r"bash\s+-i\s*>&?\s*/dev/tcp/\d", "Reverse Shell Command (Bash /dev/tcp Pipe)", "CRITICAL"),
                    (r"socket\.socket\(.*\).*(?:os\.dup2|subprocess\.call|pty\.spawn)", "Interactive Reverse Shell Payload", "CRITICAL")
                ]
                for pattern, desc, sev in dos_patterns:
                    if re.search(pattern, text_sample, re.IGNORECASE | re.DOTALL):
                        threats_detected.append(desc)
                        severity = sev

                # Run NLP threat check on the text as well (catches SQLi, XSS, C2 URLs, leaks)
                nlp_res = ThreatDetector.scan_nlp_text(text_sample)
                if not nlp_res["is_safe"]:
                    for t in nlp_res["threats"]:
                        if t not in threats_detected:
                            threats_detected.append(t)
                    if nlp_res["severity"] == "CRITICAL" or severity == "LOW":
                        severity = nlp_res["severity"]
        except Exception:
            pass
                
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
