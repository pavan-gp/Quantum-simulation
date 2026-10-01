# Post-Quantum Secure Military Communication Portal (SHIELD)

A defense-grade secure communication portal establishing an encrypted channel between **Army Node A (Country 1)** and **Army Node B (Country 2)**. The system implements a hybrid post-quantum cryptographic (PQC) and classical pipeline, incorporating AI/ML threat detection filters and immutable distributed ledger audit logging.

---

## 🛡️ Core Feature Architecture

1. **Hybrid Cryptography**:
   - **Crystals-Kyber-768**: Modular Lattice-based Key Encapsulation (LWE problem).
   - **Crystals-Dilithium-IV**: Post-quantum digital signature verification algorithm.
   - **BB84 QKD Simulation**: Software-simulated quantum photon polarization state exchanges with automated Eavesdropping Quantum Bit Error Rate (QBER) detection ($11\%$ alarm threshold).
   - **AES-256-GCM Block Cipher**: Encrypts transit payloads using hybrid SHA-3 keys.
2. **AI/ML Threat Inspection Layer**:
   - **NLP text parser**: Sanitizes input chat blocks to intercept SQLi and XSS scripts, blocking operation code coordinate leaks.
   - **AI Image Forensics**: Evaluates pixel steganography entropy values and trailer signatures.
   - **Deep Learning Malware Scanner**: Uses binary file magic headers scanning and Isolation Forest zero-day anomaly detectors.
3. **Web Portal Controls**:
   - **Landing Node map**: Visualizes communication channels on coordinates.
   - **Keystroke Behavioral Biometrics**: Captures hold and flight times during log in.
   - **Zero Knowledge Proof (ZKP) Auth**: Passwordless log in using the Fiat-Shamir protocol.
   - **Interactive Quantum Lab**: 3D Bloch Sphere controls, Shor cycle factorings, and Grover quantum search amplitudes graphs.
   - **Red-Team Intruder Simulator**: Injects 10 classical/quantum threat vectors, blacklists source IPs, and downloads ReportLab PDF diagnostic reports.

---

## 📂 Project Structure

```
major-project/
├── backend/                  # FastAPI Python Server
│   ├── app/
│   │   ├── main.py           # API Endpoints, WSS socket channels, WAF router middleware
│   │   ├── auth.py           # JWT tokens, Fiat-Shamir ZKP, Keystroke biometrics calculations
│   │   ├── database.py       # SQLAlchemy SQLite schema models (Users, messages, blacklist)
│   │   ├── blockchain.py     # PoW mining ledger transaction audits
│   │   ├── quantum.py        # BB84, B92, E91 protocols, Grover search, Shor period finders
│   │   ├── pqc.py            # Crystals-Kyber, Crystals-Dilithium, SHA3, AES-GCM ciphers
│   │   ├── threat_detector.py# NLP keywords, image entropy, magic bytes, Isolation Forests
│   │   └── pdf_generator.py  # ReportLab blocked threat PDF layout exporter
│   ├── requirements.txt      # Stable python dependencies
│   ├── Dockerfile
│   └── test_crypto.py        # Cryptographic unit test validator
├── frontend/                 # React SPA (Vite, Tailwind v3)
│   ├── src/
│   │   ├── components/       # WorldMap grid, BlochSphere 3D SVG, ParticleBackground, Stepper
│   │   ├── pages/            # Landing, Login, Sender, Receiver, Lab, Attack Sim, Logs
│   │   ├── App.jsx           # Router config & WebSockets listeners
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── nginx.conf            # Reverse proxy redirections for api and ws sockets
│   └── Dockerfile
├── mobile/                   # React Native + Expo companion mockup app
│   ├── App.js                # Biometrics logins & blockchain receipt verification
│   └── package.json
├── docker-compose.yml        # Orchestration maps
└── README.md                 # Main setup manual
```

---

## ⚡ Deployment & Running

### Run inside Docker (Recommended)
Launch the container nodes on Apple Silicon / macOS:

```bash
docker-compose up --build
```

- **React Web Portal**: Access [http://localhost:3000](http://localhost:3000)
- **FastAPI REST API Docs**: Access [http://localhost:8000/docs](http://localhost:8000/docs)


