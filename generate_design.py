import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def create_system_design():
    # High resolution 300 DPI canvas
    fig = plt.figure(figsize=(15, 11), dpi=300)
    ax = fig.add_subplot(111)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Palette - Academic Project Report Style
    c_bg = '#FFFFFF'
    c_box_border = '#1E293B'
    c_arrow = '#0F172A'
    c_blue_tint = '#F0F9FF'
    c_amber_tint = '#FFFBEB'
    c_rose_tint = '#FEF2F2'
    c_indigo_tint = '#EEF2FF'
    c_emerald_tint = '#ECFDF5'
    c_purple_tint = '#FAF5FF'
    c_slate_tint = '#F8FAFC'

    # Title Header (Academic Thesis Format)
    ax.text(50, 97.6, "SYSTEM DESIGN & OPERATIONAL DATA PIPELINE", 
            fontsize=16, fontweight='bold', fontfamily='Arial', ha='center', va='center', color='#0F172A')
    ax.text(50, 95.3, "Post-Quantum Secure Military Communication Portal (SHIELD)", 
            fontsize=11.5, fontstyle='italic', fontfamily='Arial', ha='center', va='center', color='#334155')
    
    # Header divider rule
    ax.plot([4, 96], [93.8, 93.8], color='#CBD5E1', lw=1.2)

    # Function to draw rounded card
    def draw_card(x, y, w, h, title, subtitle="", items=None, bg='#FFFFFF', border='#1E293B', lw=1.2, radius=0.8):
        rect = patches.FancyBboxPatch((x, y), w, h,
                                      boxstyle=f"round,pad=0.2,rounding_size={radius}",
                                      ec=border, fc=bg, lw=lw, zorder=3)
        ax.add_patch(rect)
        
        if subtitle or items:
            ax.text(x + w/2, y + h - 1.6, title, fontsize=9.0, fontweight='bold', 
                    fontfamily='Arial', ha='center', va='center', color='#0F172A', zorder=4)
        else:
            ax.text(x + w/2, y + h/2, title, fontsize=9.0, fontweight='bold', 
                    fontfamily='Arial', ha='center', va='center', color='#0F172A', zorder=4)
            
        if subtitle:
            ax.text(x + w/2, y + h - 3.1, subtitle, fontsize=7.8, fontstyle='italic',
                    fontfamily='Arial', ha='center', va='center', color='#334155', zorder=4)
            
        if items:
            start_y = y + h - (4.6 if subtitle else 3.2)
            step = 1.45
            for idx, item in enumerate(items):
                ax.text(x + 1.0, start_y - idx*step, f"• {item}", fontsize=7.5,
                        fontfamily='Arial', ha='left', va='center', color='#1E293B', zorder=4)

    # Function to draw container box
    def draw_container(x, y, w, h, title, bg='#F8FAFC', border='#64748B', ls='--'):
        rect = patches.FancyBboxPatch((x, y), w, h,
                                      boxstyle="round,pad=0.2,rounding_size=1.0",
                                      ec=border, fc=bg, lw=1.1, ls=ls, zorder=1)
        ax.add_patch(rect)
        # Small header badge
        badge_w = len(title) * 0.72 + 3.0
        badge = patches.FancyBboxPatch((x + 1.2, y + h - 1.8), badge_w, 1.8,
                                       boxstyle="round,pad=0.1,rounding_size=0.4",
                                       fc='#334155', ec='none', zorder=2)
        ax.add_patch(badge)
        ax.text(x + 2.0, y + h - 0.9, title, fontsize=8.0, fontweight='bold',
                fontfamily='Arial', ha='left', va='center', color='#FFFFFF', zorder=3)

    # Function to draw Decision Diamond
    def draw_diamond(cx, cy, w, h, text, bg='#FEF3C7', border='#D97706'):
        pts = [(cx, cy + h/2), (cx + w/2, cy), (cx, cy - h/2), (cx - w/2, cy)]
        poly = patches.Polygon(pts, closed=True, ec=border, fc=bg, lw=1.2, zorder=4)
        ax.add_patch(poly)
        ax.text(cx, cy, text, fontsize=8.0, fontweight='bold',
                fontfamily='Arial', ha='center', va='center', color='#92400E', zorder=5)

    # Function to draw cylinder
    def draw_cylinder(x, y, w, h, title, sub="", items=None, bg='#ECFDF5', border='#047857'):
        cyl_body = patches.Rectangle((x, y), w, h - 1.2, ec=border, fc=bg, lw=1.2, zorder=3)
        ax.add_patch(cyl_body)
        top_el = patches.Ellipse((x + w/2, y + h - 1.2), w, 2.0, ec=border, fc=bg, lw=1.2, zorder=4)
        ax.add_patch(top_el)
        bot_el = patches.Ellipse((x + w/2, y), w, 2.0, ec=border, fc=bg, lw=1.2, zorder=2)
        ax.add_patch(bot_el)
        mask = patches.Rectangle((x + 0.1, y), w - 0.2, h - 1.3, fc=bg, ec='none', zorder=3)
        ax.add_patch(mask)
        
        ax.text(x + w/2, y + h - 2.8, title, fontsize=9.0, fontweight='bold',
                fontfamily='Arial', ha='center', va='center', color='#064E3B', zorder=5)
        if sub:
            ax.text(x + w/2, y + h - 4.2, sub, fontsize=7.5, fontstyle='italic',
                    fontfamily='Arial', ha='center', va='center', color='#047857', zorder=5)
        if items:
            start_y = y + h - 5.6
            for idx, item in enumerate(items):
                ax.text(x + w/2, start_y - idx*1.4, f"• {item}", fontsize=7.2,
                        fontfamily='Arial', ha='center', va='center', color='#065F46', zorder=5)

    # Arrow helpers
    def arrow(p1, p2, label="", label_pos='top', color='#0F172A', lw=1.3, ls='-'):
        a = patches.FancyArrowPatch(p1, p2, arrowstyle='-|>', mutation_scale=11,
                                    color=color, lw=lw, linestyle=ls, zorder=6)
        ax.add_patch(a)
        if label:
            mx, my = (p1[0] + p2[0])/2, (p1[1] + p2[1])/2
            dy = 0.9 if label_pos == 'top' else -0.9
            dx = 0.9 if label_pos == 'right' else (-0.9 if label_pos == 'left' else 0)
            ha = 'center'
            if label_pos in ['left', 'right']:
                ha = 'left' if label_pos == 'right' else 'right'
                dy = 0
            ax.text(mx + dx, my + dy, label, fontsize=7.5, fontweight='bold',
                    fontfamily='Arial', ha=ha, va='center', color='#0F172A', zorder=7)

    # ==================== PHASE 1: INPUT & AUTHENTICATION ====================
    draw_container(3.5, 59.0, 27.5, 33.0, "STAGE 1: DISPATCH & AUTHENTICATION")
    
    # Sender Node
    draw_card(5.5, 78.5, 23.5, 11.5, "Army Node A (Sender)", "Tactical Source Dispatcher",
              ["Plaintext Tactical Dispatch", "Target Military Grid Coordinates", "Image / Document Attachment"],
              bg=c_blue_tint, border='#0284C7')

    # ZKP Auth Block
    draw_card(5.5, 61.0, 23.5, 12.0, "Zero-Knowledge Auth Module", "Fiat-Shamir & Keystroke Dynamics",
              ["Keystroke Hold/Flight Time Check", "Modular Arithmetic: y = r + c*x mod q", "Non-Interactive ZKP Proof"],
              bg=c_amber_tint, border='#D97706')

    # Auth Decision Diamond
    draw_diamond(40.0, 67.0, 11.0, 8.0, "Valid\nAuth?", bg='#FEF3C7', border='#D97706')

    # Honeypot / Trap Box (for Failed Auth)
    draw_card(34.0, 80.0, 12.5, 9.5, "Honeypot Trap", "Incident Response",
              ["Log Failed Attempt", "Capture Fingerprint", "Add to IP Blacklist"],
              bg='#FEF2F2', border='#DC2626')

    # Arrows for Phase 1
    arrow((17.2, 78.5), (17.2, 73.0), "Submit Dispatch")
    arrow((29.0, 67.0), (34.5, 67.0), "Verify")
    arrow((40.0, 71.0), (40.0, 80.0), "Invalid", label_pos='right')
    
    # ==================== PHASE 2: AI/ML THREAT INSPECTION ====================
    draw_container(49.0, 52.0, 47.5, 40.0, "STAGE 2: PRE-TRANSMISSION THREAT INSPECTION ENGINE")

    # Threat Inspection Sub-modules
    draw_card(51.0, 78.5, 20.5, 11.5, "NLP Content Sanitizer", "Text / Command Filter",
              ["SQL Injection (SQLi) Filter", "Cross-Site Scripting (XSS)", "Operational Coordinate Guard"],
              bg=c_rose_tint, border='#DC2626')

    draw_card(73.5, 78.5, 21.0, 11.5, "Steganography Analyzer", "Pixel & Entropy Forensics",
              ["Shannon Entropy Calculation", "LSB Hidden Payload Extraction", "Bitplane Variance Profiler"],
              bg=c_rose_tint, border='#DC2626')

    draw_card(51.0, 64.0, 20.5, 11.5, "Binary Malware Scanner", "Executable Integrity",
              ["Magic Byte Header Scan", "Trailer Signature Inspection", "PE/ELF Format Verification"],
              bg=c_rose_tint, border='#DC2626')

    draw_card(73.5, 64.0, 21.0, 11.5, "Isolation Forest Classifier", "Zero-Day Anomaly Detection",
              ["Unsupervised Outlier Scoring", "Payload Contamination Limit", "Heuristic Behavioral Scan"],
              bg=c_rose_tint, border='#DC2626')

    # Threat Decision Diamond
    draw_diamond(73.0, 56.5, 13.0, 7.5, "Threat\nDetected?", bg='#FEE2E2', border='#DC2626')

    # Red-Team Threat Alert & PDF Incident Generator
    draw_card(84.0, 53.0, 11.5, 8.0, "Quarantine Alert", "Automated PDF Report",
              ["Red-Team Alert", "ReportLab Exporter", "Block Transmission"],
              bg='#FEF2F2', border='#991B1B')

    # Arrows for Phase 2
    arrow((45.5, 67.0), (51.0, 67.0), "Valid Token", label_pos='top')
    arrow((45.5, 67.0), (51.0, 84.0), "", label_pos='top')
    arrow((71.5, 78.5), (73.0, 60.2), "Scan")
    arrow((61.2, 64.0), (66.5, 57.0), "Features")
    arrow((84.0, 64.0), (79.5, 57.0), "Score")
    arrow((79.5, 56.5), (84.0, 56.5), "Malicious", label_pos='top')

    # ==================== PHASE 3: QUANTUM & POST-QUANTUM CRYPTO ====================
    draw_container(3.5, 20.0, 48.0, 36.5, "STAGE 3: HYBRID POST-QUANTUM CRYPTOGRAPHY & QKD")

    draw_card(5.5, 39.5, 20.5, 14.5, "BB84 QKD Simulator", "Quantum Key Distribution",
              ["Photon Polarization (|0>, |1>, |+>, |->)",
               "Random Basis Conjugation (+, x)",
               "Sifting & Key Reconciliation",
               "QBER Check (Threshold <= 11%)",
               "Eavesdropper (Eve) Interception Alert"],
              bg=c_indigo_tint, border='#4F46E5')

    draw_card(28.5, 39.5, 21.0, 14.5, "Crystals-Kyber-768", "NIST PQC KEM Standard",
              ["Module-LWE Math Hardness",
               "Receiver Public Key Ingestion",
               "Shared Secret K Encapsulation",
               "Ciphertext Envelope Generation",
               "Constant-Time Cryptographic Primitives"],
              bg=c_indigo_tint, border='#4F46E5')

    draw_card(5.5, 22.0, 20.5, 15.0, "Crystals-Dilithium-IV", "PQC Digital Signature Scheme",
              ["Module Learning With Errors (MLWE)",
               "Node A Private Key Signing",
               "Message Digest Integrity Seal",
               "Non-Repudiation Guarantee",
               "Quantum-Resistant Authentication"],
              bg=c_indigo_tint, border='#4F46E5')

    draw_card(28.5, 22.0, 21.0, 15.0, "Hybrid AES-256-GCM Engine", "Transit Symmetric Encryption",
              ["SHA-3 Derived Hybrid Transit Key",
               "96-bit Cryptographic Nonce",
               "Galois Counter Mode (GCM) Cipher",
               "128-bit Authentication Tag",
               "Authenticated Encryption with AAD"],
              bg=c_indigo_tint, border='#4F46E5')

    # Clean Payload arrow into Cryptographic Engine
    arrow((73.0, 52.8), (49.5, 45.0), "Clean Payload", label_pos='left')

    # ==================== PHASE 4: SECURE TRANSIT ====================
    draw_card(54.0, 34.5, 14.0, 11.0, "Secure Transit Medium", "WSS / TLS 1.3 Gateway",
              ["Encrypted WebSocket Channel", "FastAPI ASGI Middleware", "WAF & DoS Protection", "Payload in Transit"],
              bg='#FFFFFF', border='#0284C7')

    # Arrow from PQC to Transit
    arrow((49.5, 40.0), (54.0, 40.0), "PQC Envelope", label_pos='top')

    # ==================== PHASE 5: RECEIVER TERMINAL (NODE B) ====================
    draw_container(71.0, 19.0, 25.5, 32.0, "STAGE 4: RECEIVER DECAPSULATION")

    draw_card(73.0, 34.5, 21.5, 14.5, "Node B Security Engine", "Verification & Decryption",
              ["1. Dilithium Signature Verification",
               "   (Validate Node A Authenticity)",
               "2. Kyber-768 Decapsulation",
               "   (Recover Secret K with PrivKey)",
               "3. AES-256-GCM Decryption",
               "   (Verify 128-bit Auth Tag)"],
              bg=c_purple_tint, border='#7E22CE')

    draw_card(73.0, 21.0, 21.5, 11.5, "Army Node B (Receiver)", "Operational Command Display",
              ["Verified Plaintext Intel Display", "Target Coordinates Map Plot", "Forensic Decryption Log"],
              bg=c_blue_tint, border='#0284C7')

    # Transit to Receiver
    arrow((68.0, 40.0), (73.0, 40.0), "Ciphertext", label_pos='top')
    arrow((83.7, 34.5), (83.7, 32.5), "Plaintext")

    # ==================== PHASE 6: AUDIT, PERSISTENCE & LEDGER ====================
    draw_container(3.5, 5.0, 93.0, 12.5, "STAGE 5: DISTRIBUTED AUDIT, PERSISTENCE & LEDGER COMMIT")

    # SQLite
    draw_cylinder(10.0, 5.8, 22.0, 10.5, "Relational Database", "SQLite / SQLAlchemy ORM",
                  items=["User Profiles & ZKP Secrets", "Encrypted Message Vault", "Dynamic Blacklist & Honeypots"],
                  bg=c_emerald_tint, border='#047857')

    # Blockchain
    draw_cylinder(42.0, 5.8, 24.0, 10.5, "Blockchain Audit Ledger", "Proof-of-Work Distributed Chain",
                  items=["SHA-256 Cryptographic Block Hash", "Immutable Audit Transaction Ledger", "Zero-Tampering Verification"],
                  bg=c_emerald_tint, border='#047857')

    # Delivery Receipt & Feedback loop
    draw_card(74.0, 6.0, 20.0, 10.0, "Delivery Acknowledgment", "Cryptographic Receipt",
              ["Generate Delivery Receipt", "Sign Receipt with Node B Key", "Audit Status: CONFIRMED"],
              bg='#FFFFFF', border='#047857')

    # Connecting into Databases
    arrow((20.0, 22.0), (20.0, 16.3), "Store Metadata", label_pos='left')
    arrow((39.0, 22.0), (54.0, 16.3), "Mine PoW Block", label_pos='right')
    arrow((83.7, 21.0), (84.0, 16.0), "Confirm Delivery", label_pos='right')

    # Feedback Loop arrow back to Sender Node A
    # Route around left margin
    ax.annotate("", xy=(5.5, 84.0), xytext=(5.5, 10.0),
                arrowprops=dict(arrowstyle="->", color="#059669", lw=1.3, linestyle="--",
                                connectionstyle="angle,angleA=-180,angleB=180,rad=8"))
    ax.text(2.0, 50.0, "Cryptographic Delivery Receipt (Ack Feedback Loop)", 
            fontsize=7.8, fontweight='bold', fontfamily='Arial', ha='center', va='center', 
            rotation=90, color='#065F46')

    # Figure Caption at bottom
    ax.text(50, 2.2, "Figure 5.1: System Design and Functional Data Pipeline of SHIELD Portal", 
            fontsize=12.5, fontweight='bold', fontfamily='Arial', ha='center', va='center', color='#0F172A')
    ax.text(50, 0.6, "(Illustrating End-to-End Operational Flow: Authentication, Threat Filter, Hybrid PQC, Transit, and Blockchain Audit)",
            fontsize=9.0, fontstyle='italic', fontfamily='Arial', ha='center', va='center', color='#475569')

    plt.tight_layout()
    output_path = "/Users/pavan/Downloads/major project/system_design.jpg"
    plt.savefig(output_path, format='jpeg', dpi=300, facecolor='#FFFFFF', edgecolor='none')
    plt.close()
    print(f"Generated {output_path}")

create_system_design()
