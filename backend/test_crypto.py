import sys
import os

# Include app directory in sys path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from app.pqc import CrystalsKyberSim, CrystalsDilithiumSim, HybridCryptoPipeline
from app.quantum import QuantumSimulator
from app.threat_detector import ThreatDetector

def run_tests():
    print("====================================================")
    print("SHIELD CRYPTOGRAPHIC PILELINE PARITY TESTS")
    print("====================================================")

    # 1. Test Kyber Key Encapsulation
    print("[TEST 1/5] Crystals-Kyber-768 Encapsulation...")
    pub, priv = CrystalsKyberSim.generate_keypair()
    ct, shared_enc = CrystalsKyberSim.encapsulate(pub)
    shared_dec = CrystalsKyberSim.decapsulate(ct, priv, pub["raw"])
    
    assert shared_enc == shared_dec, "ERROR: Kyber decapsulated key mismatch!"
    print("✓ Kyber key encapsulation check passed.")

    # 2. Test Dilithium Signatures
    print("[TEST 2/5] Crystals-Dilithium-IV Signatures...")
    pub_d, priv_d = CrystalsDilithiumSim.generate_keypair()
    message = b"classified-military-directive-40192"
    signature = CrystalsDilithiumSim.sign(message, priv_d)
    is_valid = CrystalsDilithiumSim.verify(message, signature, pub_d)
    
    assert is_valid, "ERROR: Dilithium signature validation failed!"
    print("✓ Dilithium signature validation check passed.")

    # 3. Test QKD BB84 Key exchange
    print("[TEST 3/5] Quantum Key Distribution (BB84)...")
    qkd_clean = QuantumSimulator.simulate_bb84(num_bits=200, eavesdrop=False)
    qkd_eaves = QuantumSimulator.simulate_bb84(num_bits=200, eavesdrop=True)
    
    print(f"  - Sifted clean channel QBER: {qkd_clean['qber']}% (Secure: {qkd_clean['is_secure']})")
    print(f"  - Sifted eavesdropped QBER: {qkd_eaves['qber']}% (Secure: {qkd_eaves['is_secure']})")
    
    assert qkd_clean['is_secure'], "ERROR: Safe channel marked insecure!"
    assert not qkd_eaves['is_secure'], "ERROR: Eavesdropped channel marked secure!"
    print("✓ BB84 simulation checks passed.")

    # 4. Test Hybrid Key Assembly & AES-256 GCM Encryption
    print("[TEST 4/5] Hybrid SHA-3 Assembly & AES-256-GCM...")
    qrng_seed = os.urandom(32)
    qkd_key = qkd_clean["final_key"]
    shared_kem_key = shared_enc
    
    hybrid_key = HybridCryptoPipeline.generate_hybrid_key(qrng_seed, qkd_key, shared_kem_key)
    
    plaintext = "TOP_SECRET: Coordinates 45N 120E payload"
    enc, iv, tag = HybridCryptoPipeline.encrypt_aes_gcm(plaintext, hybrid_key)
    dec = HybridCryptoPipeline.decrypt_aes_gcm(enc, hybrid_key, iv, tag)
    
    assert plaintext == dec, "ERROR: AES decryption mismatch!"
    print("✓ Hybrid key assembly and GCM encryption checks passed.")

    # 5. Test NLP threat scanner heuristics
    print("[TEST 5/5] NLP/WAF Threat Detection engine...")
    clear_text = "Deploy normal security patrol elements to standard coordinates."
    leak_text = "Operation Omega nuclear launch code coordinates 34.05N, 118.24W"
    tunnel_link_text = "Check internal intel at https://matching-multiple-bandwidth-generations.trycloudflare.com"
    raw_ip_link_text = "Callback payload at http://194.26.29.112:8080/c2"
    malware_link_text = "Download military patch: https://update-defense.site/payload.exe"
    
    scan_clear = ThreatDetector.scan_nlp_text(clear_text)
    scan_leak = ThreatDetector.scan_nlp_text(leak_text)
    scan_tunnel = ThreatDetector.scan_nlp_text(tunnel_link_text)
    scan_raw_ip = ThreatDetector.scan_nlp_text(raw_ip_link_text)
    scan_malware = ThreatDetector.scan_nlp_text(malware_link_text)
    
    assert scan_clear["is_safe"], "ERROR: Safe text flagged as threat!"
    assert not scan_leak["is_safe"], "ERROR: Critical coordinate/operation leak passed scan!"
    assert not scan_tunnel["is_safe"], "ERROR: Trycloudflare fraud tunnel passed scan!"
    assert not scan_raw_ip["is_safe"], "ERROR: Raw IP C2 callback passed scan!"
    # Test DoS Flood Attack Script (as both text and document file)
    dos_script = """
import time
import requests
from concurrent.futures import ThreadPoolExecutor

URL = "http://127.0.0.1:8000/"
TOTAL_REQUESTS = 100
MAX_WORKERS = 5

def send_request(_):
    response = requests.get(URL, timeout=5)
    return response.status_code

if __name__ == "__main__":
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        results = list(pool.map(send_request, range(TOTAL_REQUESTS)))
"""
    scan_dos_text = ThreatDetector.scan_nlp_text(dos_script)
    scan_dos_file = ThreatDetector.scan_file_malware(dos_script.encode("utf-8"), "testing")
    
    assert not scan_dos_text["is_safe"], "ERROR: DoS attack script text passed scan!"
    assert not scan_dos_file["is_safe"], "ERROR: DoS attack script file passed scan!"
    print("✓ Threat detection engine heuristics checked out (including fraud tunnel, malicious links, and DoS scripts).")
    print("====================================================")
    print("ALL TESTS COMPLETED SUCCESSFULLY // SYSTEM STABLE")
    print("====================================================")

if __name__ == "__main__":
    run_tests()
