import random
import math
import numpy as np

class QuantumSimulator:
    
    @staticmethod
    def simulate_bb84(num_bits: int = 100, eavesdrop: bool = False) -> dict:
        """
        Simulates the BB84 Quantum Key Distribution protocol.
        Alice sends qubits to Bob. If eavesdrop is True, Eve measures them first.
        """
        # Alice's raw bits
        alice_bits = [random.randint(0, 1) for _ in range(num_bits)]
        # Alice's bases: '+' (rectilinear) or 'x' (diagonal)
        alice_bases = [random.choice(['+', 'x']) for _ in range(num_bits)]
        
        # State representing polarization angle (in degrees)
        # +: 0 -> 0°, 1 -> 90°
        # x: 0 -> 45°, 1 -> 135°
        polarizations = []
        for bit, basis in zip(alice_bits, alice_bases):
            if basis == '+':
                polarizations.append(0 if bit == 0 else 90)
            else:
                polarizations.append(45 if bit == 0 else 135)
                
        # Bob's bases
        bob_bases = [random.choice(['+', 'x']) for _ in range(num_bits)]
        bob_bits = []
        eve_bases = []
        eve_bits = []
        
        if eavesdrop:
            eve_bases = [random.choice(['+', 'x']) for _ in range(num_bits)]
            for i in range(num_bits):
                # Eve intercept and measure
                alice_pol = polarizations[i]
                eve_basis = eve_bases[i]
                
                # Measuring Alice's state in Eve's basis
                if eve_basis == '+':
                    if alice_pol in [0, 90]:
                        measured_bit = 0 if alice_pol == 0 else 1
                    else: # diagonal, 50% chance of either
                        measured_bit = random.randint(0, 1)
                    # Eve prepares a new photon in her measurement basis
                    polarizations[i] = 0 if measured_bit == 0 else 90
                else: # basis == 'x'
                    if alice_pol in [45, 135]:
                        measured_bit = 0 if alice_pol == 45 else 1
                    else: # rectilinear, 50% chance
                        measured_bit = random.randint(0, 1)
                    polarizations[i] = 45 if measured_bit == 0 else 135
                eve_bits.append(measured_bit)
                
        # Bob measures the (possibly altered) photons
        for i in range(num_bits):
            pol = polarizations[i]
            bob_basis = bob_bases[i]
            if bob_basis == '+':
                if pol in [0, 90]:
                    measured_bit = 0 if pol == 0 else 1
                else:
                    measured_bit = random.randint(0, 1)
            else: # basis == 'x'
                if pol in [45, 135]:
                    measured_bit = 0 if pol == 45 else 1
                else:
                    measured_bit = random.randint(0, 1)
            bob_bits.append(measured_bit)
            
        # Sifting phase: Find indices where bases match
        matching_indices = [i for i in range(num_bits) if alice_bases[i] == bob_bases[i]]
        
        alice_sifted = [alice_bits[i] for i in matching_indices]
        bob_sifted = [bob_bits[i] for i in matching_indices]
        
        # Calculate QBER (Quantum Bit Error Rate) on a 20% sample
        sample_size = max(1, int(len(matching_indices) * 0.2))
        sample_indices = random.sample(matching_indices, sample_size) if len(matching_indices) > 0 else []
        
        errors = sum(1 for i in sample_indices if alice_bits[i] != bob_bits[i])
        qber = (errors / sample_size) if sample_size > 0 else 0.0
        
        # Determine if transmission is secure (QBER <= 11%)
        is_secure = qber <= 0.11
        final_key = ""
        if is_secure:
            # Drop the sample items to form the final shared secret key
            sifted_remaining = [bob_bits[i] for i in matching_indices if i not in sample_indices]
            final_key = "".join(str(b) for b in sifted_remaining)
            
        return {
            "num_bits": num_bits,
            "eavesdropped": eavesdrop,
            "alice_bases": alice_bases[:30], # Truncated sample for visualization
            "alice_bits": alice_bits[:30],
            "bob_bases": bob_bases[:30],
            "bob_bits": bob_bits[:30],
            "eve_bases": eve_bases[:30] if eavesdrop else [],
            "matching_indices": matching_indices[:30],
            "qber": round(qber * 100, 2),
            "is_secure": is_secure,
            "final_key_length": len(final_key),
            "final_key": final_key[:32] # Return preview
        }

    @staticmethod
    def simulate_b92(num_bits: int = 100, eavesdrop: bool = False) -> dict:
        """
        B92 protocol simulation. Alice encodes bits using non-orthogonal states:
        Bit 0 -> 0° rectilinear, Bit 1 -> 45° diagonal.
        Bob measures using orthogonal bases:
        Bases 0 -> 90° rectilinear (measures if Bit is 1),
        Bases 1 -> 135° diagonal (measures if Bit is 0).
        """
        alice_bits = [random.randint(0, 1) for _ in range(num_bits)]
        bob_bases = [random.choice([0, 1]) for _ in range(num_bits)]
        bob_results = []
        
        # Alice sends: 0° for bit 0, 45° for bit 1
        # Bob measures with: 90° for basis 0, 135° for basis 1
        for a_bit, b_basis in zip(alice_bits, bob_bases):
            # Projections
            # If Alice sends 0 (0°) and Bob measures 90° (basis 0) -> projection is cos(90-0) = 0 (no result)
            # If Alice sends 1 (45°) and Bob measures 90° (basis 0) -> cos(90-45)^2 = 0.5 (50% chance of registering a 1)
            # If Alice sends 0 (0°) and Bob measures 135° (basis 1) -> cos(135-0)^2 = 0.5 (50% chance of registering a 1)
            # If Alice sends 1 (45°) and Bob measures 135° (basis 1) -> cos(135-45) = 0 (no result)
            if a_bit == 0 and b_basis == 1:
                # Registered a click! Implies bit was 0
                bob_results.append((True, 0))
            elif a_bit == 1 and b_basis == 0:
                # Registered a click! Implies bit was 1
                bob_results.append((True, 1))
            else:
                # No click, discard
                bob_results.append((False, -1))
                
        # Filter clicks
        click_indices = [i for i, r in enumerate(bob_results) if r[0]]
        alice_clicks = [alice_bits[i] for i in click_indices]
        bob_clicks = [bob_results[i][1] for i in click_indices]
        
        # Calculate error rate on clicks
        errors = sum(1 for a, b in zip(alice_clicks, bob_clicks) if a != b)
        qber = errors / len(click_indices) if len(click_indices) > 0 else 0
        
        return {
            "num_bits": num_bits,
            "clicks_registered": len(click_indices),
            "alice_bits": alice_bits[:30],
            "bob_bases": bob_bases[:30],
            "click_indices": click_indices[:20],
            "qber": round(qber * 100, 2),
            "is_secure": qber < 0.11
        }

    @staticmethod
    def simulate_e91(num_bits: int = 100) -> dict:
        """
        E91 protocol using entangled Einstein-Podolsky-Rosen (EPR) pairs.
        Alice and Bob receive half of an entangled singlet state (entangled qubits).
        They measure in three randomly chosen bases (e.g. 0, 45, 90 degrees).
        If they measure in the same basis, they get perfectly correlated (or anti-correlated) values.
        If they measure in different bases, they verify Bell's inequality to detect Eve.
        """
        # Bases selections: 0=Rectilinear, 1=Diagonal, 2=Circular
        alice_bases = [random.choice([0, 1, 2]) for _ in range(num_bits)]
        bob_bases = [random.choice([0, 1, 2]) for _ in range(num_bits)]
        
        alice_results = []
        bob_results = []
        
        for ab, bb in zip(alice_bases, bob_bases):
            # Singlet state measurement correlation:
            # If same basis, Bob's result is opposite (anti-correlated) to Alice's.
            # (We invert Bob's output to establish matching key).
            a_val = random.randint(0, 1)
            
            if ab == bb:
                b_val = 1 - a_val  # Anti-correlated entangled measurement
            else:
                # Different basis measurement gives partial correlation depending on angle
                b_val = random.randint(0, 1)
            
            alice_results.append(a_val)
            bob_results.append(1 - b_val) # Bob flips measurement to align with Alice
            
        # Sifting
        matching_indices = [i for i in range(num_bits) if alice_bases[i] == bob_bases[i]]
        shared_key = [alice_results[i] for i in matching_indices]
        
        # Calculate Bell parameters (S value) simulation (should be ~ 2.82 for entangled, 2.0 for classical)
        # S = E(a1, b1) - E(a1, b3) + E(a2, b1) + E(a2, b3)
        bell_s = 2.82 if random.random() > 0.1 else 1.95 # Simulated Bell violation value
        
        return {
            "num_bits": num_bits,
            "matching_indices": matching_indices[:30],
            "alice_bases": alice_bases[:30],
            "bob_bases": bob_bases[:30],
            "bell_value": bell_s,
            "is_secure": bell_s > 2.0,
            "sifted_key_length": len(shared_key)
        }

    @staticmethod
    def simulate_grover(num_qubits: int = 4, target_state: int = 5) -> dict:
        """
        Simulates Grover's database search algorithm steps.
        N = 2^num_qubits items. Simulates iterations of the Oracle and Diffusion operators.
        """
        N = 2**num_qubits
        state_vector = np.ones(N) / math.sqrt(N)
        
        iterations = int(math.pi / 4 * math.sqrt(N))
        steps = []
        
        # Add initial state
        steps.append({
            "iteration": 0,
            "state_amplitudes": state_vector.tolist(),
            "target_amplitude": round(state_vector[target_state], 4)
        })
        
        current_state = state_vector.copy()
        
        for step in range(1, iterations + 1):
            # 1. Oracle: Flip the sign of the target state
            current_state[target_state] = -current_state[target_state]
            
            # 2. Diffusion: Reflected about the mean amplitude
            mean_amp = np.mean(current_state)
            current_state = 2 * mean_amp - current_state
            
            steps.append({
                "iteration": step,
                "state_amplitudes": current_state.tolist(),
                "target_amplitude": round(current_state[target_state], 4)
            })
            
        success_probability = current_state[target_state]**2
        
        return {
            "num_qubits": num_qubits,
            "num_items": N,
            "target_state": target_state,
            "required_iterations": iterations,
            "final_probabilities": (current_state**2).tolist(),
            "success_probability": round(success_probability * 100, 2),
            "steps": steps
        }

    @staticmethod
    def simulate_shor(number_to_factor: int = 15) -> dict:
        """
        Simulates Shor's quantum period finding algorithm steps for factoring numbers.
        Example: N = 15. Chooses coprime a = 7. Finds period r = 4.
        Factors: gcd(7^(4/2) - 1, 15) = 3; gcd(7^(4/2) + 1, 15) = 5.
        """
        if number_to_factor != 15:
            # We focus on the classic Shor example of N=15 for absolute clarity
            return {"error": "Only N=15 is supported for standard Shor simulation."}
            
        a = 7 # Chosen coprime to 15
        # f(x) = a^x mod N
        # We construct the period table
        x_vals = list(range(8))
        y_vals = [pow(a, x, number_to_factor) for x in x_vals]
        
        # Period r is the value where y repeats: y_0 = 1, y_4 = 1 -> r = 4
        r = 4
        # Calculate factors:
        val1 = pow(a, r//2, number_to_factor) - 1 # 7^2 - 1 = 48
        val2 = pow(a, r//2, number_to_factor) + 1 # 7^2 + 1 = 50
        
        factor1 = math.gcd(val1, number_to_factor) # gcd(48, 15) = 3
        factor2 = math.gcd(val2, number_to_factor) # gcd(50, 15) = 5
        
        return {
            "number_to_factor": number_to_factor,
            "chosen_a": a,
            "period_r": r,
            "values": [{"x": x, "y": y} for x, y in zip(x_vals, y_vals)],
            "factors_found": [factor1, factor2],
            "quantum_phase_finding": [0.0, 0.25, 0.5, 0.75], # quantum registry simulation peaks
            "quantum_steps": [
                "1. Initialize superposition of two registers",
                "2. Apply quantum modular exponentiation mapping |x>|0> -> |x>|a^x mod N>",
                "3. Measure the second register (value captured: 4)",
                "4. Perform Inverse Quantum Fourier Transform (IQFT) on first register",
                "5. Detect period peak (r = 4)",
                "6. Calculate non-trivial factors: gcd(7^2 - 1, 15) = 3 and gcd(7^2 + 1, 15) = 5"
            ]
        }

    @staticmethod
    def get_bloch_sphere_coords(theta: float, phi: float) -> dict:
        """
        Maps standard spherical coordinates of a qubit |psi> = cos(theta/2)|0> + e^(i*phi)*sin(theta/2)|1>
        to Cartesian coordinates (x, y, z) for 3D rendering.
        Angles expected in degrees.
        """
        theta_rad = math.radians(theta)
        phi_rad = math.radians(phi)
        
        # Bloch sphere cartesian mapping
        x = math.sin(theta_rad) * math.cos(phi_rad)
        y = math.sin(theta_rad) * math.sin(phi_rad)
        z = math.cos(theta_rad)
        
        return {
            "theta": theta,
            "phi": phi,
            "x": round(x, 4),
            "y": round(y, 4),
            "z": round(z, 4)
        }
