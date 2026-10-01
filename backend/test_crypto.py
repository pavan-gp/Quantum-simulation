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
    qkd_clean = QuantumSimulator.simulate_bb84(num_bits=100, eavesdrop=False)
    qkd_eaves = QuantumSimulator.simulate_bb84(num_bits=100, eavesdrop=True)
    
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
    
    scan_clear = ThreatDetector.scan_nlp_text(clear_text)
    scan_leak = ThreatDetector.scan_nlp_text(leak_text)
    
    assert scan_clear["is_safe"], "ERROR: Safe text flagged as threat!"
    assert not scan_leak["is_safe"], "ERROR: Critical coordinate/operation leak passed scan!"
    print("✓ Threat detection engine heuristics checked out.")
    print("====================================================")
    print("ALL TESTS COMPLETED SUCCESSFULLY // SYSTEM STABLE")
    print("====================================================")

if __name__ == "__main__":
    run_tests()
