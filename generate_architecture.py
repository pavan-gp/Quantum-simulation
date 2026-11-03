import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def create_system_architecture():
    fig = plt.figure(figsize=(14, 10.5), dpi=300)
    ax = fig.add_subplot(111)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Color palette - Academic High-Contrast & Professional
    c_tier_border = '#64748B'
    c_tier_bg = '#F8FAFC'
    c_arrow = '#0F172A'
    c_accent_pqc = '#EEF2FF'     # Indigo tint
    c_accent_threat = '#FEF2F2'  # Rose tint
    c_accent_auth = '#FFFBEB'    # Amber tint
    c_accent_client = '#F0F9FF'  # Sky tint
    c_accent_db = '#ECFDF5'      # Emerald tint
    c_accent_core = '#FAF5FF'    # Purple tint

    # Title Header (matching university thesis & IEEE report style)
    ax.text(50, 97.6, "SYSTEM ARCHITECTURE SPECIFICATION", 
            fontsize=16, fontweight='bold', fontfamily='Arial', ha='center', va='center', color='#0F172A')
    ax.text(50, 95.3, "Post-Quantum Secure Military Communication Portal (SHIELD)", 
            fontsize=11.5, fontstyle='italic', fontfamily='Arial', ha='center', va='center', color='#334155')
    
    # Header divider
    ax.plot([4, 96], [93.8, 93.8], color='#CBD5E1', lw=1.2)

    # Function to draw rounded card
    def draw_card(x, y, w, h, title, subtitle="", items=None, bg='#FFFFFF', border='#1E293B', lw=1.2, radius=1.0):
        rect = patches.FancyBboxPatch((x, y), w, h,
                                      boxstyle=f"round,pad=0.2,rounding_size={radius}",
                                      ec=border, fc=bg, lw=lw, zorder=3)
        ax.add_patch(rect)
        
        if subtitle or items:
            ax.text(x + w/2, y + h - 1.8, title, fontsize=9.5, fontweight='bold', 
                    fontfamily='Arial', ha='center', va='center', color='#0F172A', zorder=4)
        else:
            ax.text(x + w/2, y + h/2, title, fontsize=9.5, fontweight='bold', 
                    fontfamily='Arial', ha='center', va='center', color='#0F172A', zorder=4)
            
        if subtitle:
            ax.text(x + w/2, y + h - 3.4, subtitle, fontsize=8, fontstyle='italic',
                    fontfamily='Arial', ha='center', va='center', color='#334155', zorder=4)
            
        if items:
            start_y = y + h - (5.0 if subtitle else 3.5)
            step = 1.6
            for idx, item in enumerate(items):
                ax.text(x + 1.2, start_y - idx*step, f"• {item}", fontsize=7.8,
                        fontfamily='Arial', ha='left', va='center', color='#1E293B', zorder=4)

    # Function to draw database cylinder with safe text bounds
    def draw_cylinder(x, y, w, h, title, sub="", items=None, bg='#ECFDF5', border='#047857'):
        cyl_body = patches.Rectangle((x, y), w, h - 1.2, ec=border, fc=bg, lw=1.2, zorder=3)
        ax.add_patch(cyl_body)
        
        top_el = patches.Ellipse((x + w/2, y + h - 1.2), w, 2.2, ec=border, fc=bg, lw=1.2, zorder=4)
        ax.add_patch(top_el)
        
        bot_el = patches.Ellipse((x + w/2, y), w, 2.2, ec=border, fc=bg, lw=1.2, zorder=2)
        ax.add_patch(bot_el)
        
        mask = patches.Rectangle((x + 0.1, y), w - 0.2, h - 1.3, fc=bg, ec='none', zorder=3)
        ax.add_patch(mask)
        
        # Title at upper portion of cylinder
        ax.text(x + w/2, y + h - 3.2, title, fontsize=9.5, fontweight='bold',
                fontfamily='Arial', ha='center', va='center', color='#064E3B', zorder=5)
        if sub:
            ax.text(x + w/2, y + h - 4.7, sub, fontsize=8, fontstyle='italic',
                    fontfamily='Arial', ha='center', va='center', color='#047857', zorder=5)
            
        if items:
            start_y = y + h - 6.2
            for idx, item in enumerate(items):
                ax.text(x + w/2, start_y - idx*1.5, f"• {item}", fontsize=7.8,
                        fontfamily='Arial', ha='center', va='center', color='#065F46', zorder=5)

    # Tier drawing helper with non-overlapping tag banner
    def draw_tier(x, y, w, h, label, tag):
        tier_rect = patches.FancyBboxPatch((x, y), w, h,
                                           boxstyle="round,pad=0.2,rounding_size=1.2",
                                           ec=c_tier_border, fc=c_tier_bg, lw=1.0, ls='--', zorder=1)
        ax.add_patch(tier_rect)
        # Small pill tag in top left
        tag_w = 42
        tag_rect = patches.FancyBboxPatch((x + 1.2, y + h - 1.8), tag_w, 2.0,
                                          boxstyle="round,pad=0.1,rounding_size=0.5",
                                          fc='#334155', ec='none', zorder=2)
        ax.add_patch(tag_rect)
        ax.text(x + 2.0, y + h - 0.8, f"{tag}: {label}", fontsize=8.2, fontweight='bold',
                fontfamily='Arial', ha='left', va='center', color='#FFFFFF', zorder=3)

    # ===================== TIER 1: CLIENT & PRESENTATION LAYER =====================
    draw_tier(4, 78.5, 92, 13.5, "PRESENTATION & CLIENT LAYER (EDGE NODES)", "TIER 1")
    
    draw_card(6.5, 80.0, 19, 9.5, "Army Node A (Sender)", "Tactical Command Terminal", 
              ["Secure Dispatcher UI", "Coordinates Encoder", "Attachment Ingestion"],
              bg=c_accent_client, border='#0284C7')
    
    draw_card(28.5, 80.0, 20.5, 9.5, "React Tactical Portal", "Vite + Tailwind v3 SPA",
              ["Interactive Quantum Lab", "3D Bloch Sphere Visualizer", "Real-Time WSS Channel"],
              bg='#FFFFFF', border='#0284C7')

    draw_card(52.0, 80.0, 20.5, 9.5, "Mobile Verification App", "React Native & Expo Unit",
              ["Biometrics Authenticator", "Blockchain Receipt Audit", "Offline Key Vault"],
              bg='#FFFFFF', border='#0284C7')

    draw_card(75.5, 80.0, 18.5, 9.5, "Army Node B (Receiver)", "Operational Node Terminal",
              ["Encrypted Influx Monitor", "Signature Verifier", "Decrypted Payload View"],
              bg=c_accent_client, border='#0284C7')

    # ===================== TIER 2: AUTHENTICATION & ACCESS CONTROL LAYER =====================
    draw_tier(4, 62.5, 92, 13.5, "ACCESS CONTROL & ZERO-KNOWLEDGE AUTHENTICATION", "TIER 2")

    draw_card(6.5, 64.0, 20.5, 9.5, "Fiat-Shamir ZKP Engine", "Zero-Knowledge Authentication",
              ["No Password in Transit", "Quadratic Residue Challenge", "Modular Arithmetic Verify"],
              bg=c_accent_auth, border='#D97706')

    draw_card(29.5, 64.0, 20.5, 9.5, "Keystroke Behavioral", "Dynamic Biometrics Analyzer",
              ["Hold Time (HT) Calculation", "Flight Time (FT) Analysis", "Typing Cadence Profiler"],
              bg=c_accent_auth, border='#D97706')

    draw_card(52.5, 64.0, 19.5, 9.5, "API Shield & Rate Limiter", "SlowAPI / WAF Middleware",
              ["Token Bucket Limiting", "CORS Policy Enforcement", "IP Blacklist Interceptor"],
              bg='#FFFFFF', border='#D97706')

    draw_card(74.5, 64.0, 19.5, 9.5, "JWT Security Authority", "Session Token Management",
              ["Short-lived Access Tokens", "Rotating Refresh Tokens", "Cryptographic HMAC SHA-256"],
              bg='#FFFFFF', border='#D97706')

    # ===================== TIER 3: MULTI-STAGE THREAT DETECTION LAYER =====================
    draw_tier(4, 46.5, 92, 13.5, "PRE-TRANSMISSION AI/ML THREAT INSPECTION ENGINE", "TIER 3")

    draw_card(6.5, 48.0, 20.5, 9.5, "NLP Content Sanitizer", "Payload & Command Filter",
              ["SQLi & XSS Script Scrubbing", "Military Coordinate Leak Guard", "Regex Blacklist Matching"],
              bg=c_accent_threat, border='#DC2626')

    draw_card(29.5, 48.0, 20.5, 9.5, "Steganography Scanner", "AI Image Forensics",
              ["Shannon Entropy Evaluation", "Bitplane Noise Variance", "Hidden LSB Extraction"],
              bg=c_accent_threat, border='#DC2626')

    draw_card(52.5, 48.0, 19.5, 9.5, "Binary Malware Scanner", "Executable Integrity Filter",
              ["Magic Bytes Verification", "Trailer Signature Inspection", "PE / ELF Header Validator"],
              bg=c_accent_threat, border='#DC2626')

    draw_card(74.5, 48.0, 19.5, 9.5, "Isolation Forest Detector", "Zero-Day Anomaly Detection",
              ["Multi-Feature Anomaly Score", "Unsupervised Contamination Cut", "Outlier Payload Quarantine"],
              bg='#FFFFFF', border='#DC2626')

    # ===================== TIER 4: QUANTUM & POST-QUANTUM CRYPTOGRAPHY =====================
    draw_tier(4, 30.5, 92, 13.5, "QUANTUM & POST-QUANTUM CRYPTOGRAPHIC (PQC) ENGINE", "TIER 4")

    draw_card(6.5, 32.0, 20.5, 9.5, "BB84 QKD Simulator", "Quantum Key Distribution",
              ["Photon Polarization Bases (+/x)", "Eavesdropper Interception Sim", "QBER Check (11% Alarm Limit)"],
              bg=c_accent_pqc, border='#4F46E5')

    draw_card(29.5, 32.0, 20.5, 9.5, "Crystals-Kyber-768", "Post-Quantum KEM (NIST Standard)",
              ["Module-LWE Hardness Problem", "Public Key Encapsulation", "Constant-Time Decapsulation"],
              bg=c_accent_pqc, border='#4F46E5')

    draw_card(52.5, 32.0, 19.5, 9.5, "Crystals-Dilithium-IV", "PQC Digital Signature Scheme",
              ["Module Learning With Errors", "Non-Repudiation Signing", "Quantum-Resistant Verify"],
              bg=c_accent_pqc, border='#4F46E5')

    draw_card(74.5, 32.0, 19.5, 9.5, "Hybrid AES-256-GCM", "Transit Symmetric Encryption",
              ["SHA-3 Derived Session Keys", "Galois Counter Mode (GCM)", "Authenticated 128-bit Tag"],
              bg='#FFFFFF', border='#4F46E5')

    # ===================== TIER 5: APPLICATION & PERSISTENCE LAYER =====================
    draw_tier(4, 9.5, 92, 18.5, "APPLICATION CORE & PERSISTENT DISTRIBUTED LEDGER", "TIER 5")

    # FastAPI Core
    draw_card(6.5, 11.0, 23.0, 14.8, "FastAPI ASGI Backend Core", "High-Throughput Python Gateway",
              ["RESTful Microservices & Routers",
               "Bidirectional WebSocket Channels",
               "Real-time Threat Broadcast",
               "Red-Team Intrusion Simulator",
               "Automated ReportLab PDF Exporter"],
              bg=c_accent_core, border='#7E22CE')

    # Database 1: Relational SQLite
    draw_cylinder(34.0, 11.0, 18.5, 14.8, "Relational Database", "SQLite / SQLAlchemy ORM",
                  items=["User Profiles & ZKP Secrets", "Encrypted Message Store", "Dynamic IP Blacklists", "Audit & Honeypot Logs"],
                  bg=c_accent_db, border='#059669')

    # Database 2: Blockchain Ledger
    draw_cylinder(57.0, 11.0, 18.5, 14.8, "Blockchain Ledger", "Proof-of-Work Distributed Audit",
                  items=["SHA-256 Block Chaining", "Immutable Transaction Logs", "Proof-of-Work Mining", "Tamper-Proof Verification"],
                  bg=c_accent_db, border='#059669')

    # Red Team
    draw_card(80.0, 11.0, 14.5, 14.8, "Red-Team Suite", "Diagnostics & Attacks",
              ["10 Attack Vectors",
               "Eavesdrop Probe",
               "MitM Simulation",
               "Forensic PDF Logs",
               "Security Audits"],
              bg='#FFFFFF', border='#7E22CE')

    # Flow arrows connecting tiers cleanly (routed through non-banner gaps)
    def draw_down_arrow(x, y_start, y_end, label="", label_pos='right'):
        arrow = patches.FancyArrowPatch((x, y_start), (x, y_end),
                                        arrowstyle='-|>', mutation_scale=12,
                                        color=c_arrow, lw=1.3, zorder=5)
        ax.add_patch(arrow)
        if label:
            lx = x + 0.8 if label_pos == 'right' else x - 0.8
            ha = 'left' if label_pos == 'right' else 'right'
            ax.text(lx, (y_start + y_end)/2, label, fontsize=7.8, fontweight='medium',
                    fontfamily='Arial', va='center', ha=ha, color='#0F172A', zorder=6)

    def draw_up_arrow(x, y_start, y_end, label=""):
        arrow = patches.FancyArrowPatch((x, y_start), (x, y_end),
                                        arrowstyle='-|>', mutation_scale=12,
                                        color=c_arrow, lw=1.3, zorder=5)
        ax.add_patch(arrow)
        if label:
            ax.text(x + 0.8, (y_start + y_end)/2, label, fontsize=7.8, fontweight='medium',
                    fontfamily='Arial', va='center', ha='left', color='#0F172A', zorder=6)

    def draw_bidirectional_arrow(x, y_start, y_end, label=""):
        arrow = patches.FancyArrowPatch((x, y_start), (x, y_end),
                                        arrowstyle='<|-|>', mutation_scale=12,
                                        color=c_arrow, lw=1.3, zorder=5)
        ax.add_patch(arrow)
        if label:
            ax.text(x + 0.8, (y_start + y_end)/2, label, fontsize=7.8, fontweight='medium',
                    fontfamily='Arial', va='center', ha='left', color='#0F172A', zorder=6)

    # Connections between Tier 1 & Tier 2
    draw_down_arrow(16.0, 80.0, 73.5, "Auth Challenge", label_pos='right')
    draw_down_arrow(39.0, 80.0, 73.5, "HTTP / WS Requests", label_pos='right')
    draw_up_arrow(84.5, 73.5, 80.0, "Verified Delivery")

    # Connections between Tier 2 & Tier 3
    draw_down_arrow(16.0, 64.0, 57.5, "Validated Tokens", label_pos='right')
    draw_down_arrow(39.0, 64.0, 57.5, "Raw Transmissions", label_pos='right')
    draw_up_arrow(84.5, 57.5, 64.0, "Session Sync")

    # Connections between Tier 3 & Tier 4
    draw_down_arrow(16.0, 48.0, 41.5, "Sanitized Payload", label_pos='right')
    draw_down_arrow(39.0, 48.0, 41.5, "Inspected Attachments", label_pos='right')
    draw_up_arrow(84.5, 41.5, 48.0, "Signature Validation")

    # Connections between Tier 4 & Tier 5
    draw_down_arrow(16.0, 32.0, 25.8, "QKD Sifted Keys", label_pos='right')
    draw_down_arrow(39.0, 32.0, 25.8, "PQC Ciphertext", label_pos='right')
    draw_bidirectional_arrow(66.0, 32.0, 25.8, "Ledger Commit")
    draw_up_arrow(84.5, 25.8, 32.0, "Decapsulate Key")

    # Figure Caption at bottom (Standard Academic Major Project / IEEE Format)
    ax.text(50, 4.2, "Figure 4.1: System Architecture of Post-Quantum Military Communication Portal (SHIELD)", 
            fontsize=12.5, fontweight='bold', fontfamily='Arial', ha='center', va='center', color='#0F172A')
    ax.text(50, 2.2, "(A Multi-Tiered Defense-Grade Architecture combining ZKP, Threat Filtration, PQC & Distributed Ledger)",
            fontsize=9.5, fontstyle='italic', fontfamily='Arial', ha='center', va='center', color='#475569')

    plt.tight_layout()
    output_path = "/Users/pavan/Downloads/major project/system_architecture.jpg"
    plt.savefig(output_path, format='jpeg', dpi=300, facecolor='#FFFFFF', edgecolor='none')
    plt.close()
    print(f"Generated refined {output_path}")

create_system_architecture()
