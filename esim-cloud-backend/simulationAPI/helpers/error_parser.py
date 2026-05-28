import re

def parse_ngspice_error(stderr_text: str) -> dict:
    """
    Parses ngspice stderr text and extracts friendly error summaries,
    hints, and specific error codes or keywords.

    Args:
        stderr_text (str): Raw stderr text from ngspice output.

    Returns:
        dict: A dictionary containing:
            - 'summary' (str): A short sentence describing what went wrong.
            - 'hints' (list of str): Actionable steps to fix the problem.
            - 'codes' (list of str): Specific error codes or keywords.
    """
    try:
        if not isinstance(stderr_text, str):
            stderr_text = str(stderr_text)
            
        lower_stderr = stderr_text.lower()
        
        # Pattern 1 — floating node
        if "floating node" in lower_stderr or "node is floating" in lower_stderr:
            match = re.search(r'(?:floating node|node is floating)\s+([^\s,;.]+)', stderr_text, re.IGNORECASE)
            node_name = match.group(1) if match else "unknown"
            return {
                "summary": f"Node {node_name} is floating.",
                "hints": ["Connect all component pins to a wire or to ground."],
                "codes": ["floating node"]
            }

        # Pattern 2 — unknown subcircuit
        if "unknown subcircuit" in lower_stderr or "could not find subcircuit" in lower_stderr:
            match = re.search(r'(?:unknown subcircuit|could not find subcircuit)\s+([^\s,;.]+)', stderr_text, re.IGNORECASE)
            subckt_name = match.group(1) if match else "unknown"
            return {
                "summary": f"Could not find subcircuit {subckt_name}.",
                "hints": ["Check that the component model file is included and the name matches exactly."],
                "codes": ["unknown subcircuit"]
            }

        # Pattern 3 — missing ground
        if "no ground node" in lower_stderr or "node 0 is not defined" in lower_stderr or "no dc path to ground" in lower_stderr or "missing ground" in lower_stderr:
            return {
                "summary": "The circuit has no ground connection.",
                "hints": ["Every circuit must have at least one ground symbol connected."],
                "codes": ["missing ground"]
            }

        # Pattern 4 — singular matrix
        if "singular matrix" in lower_stderr or "matrix is singular" in lower_stderr or "matrix singular" in lower_stderr:
            return {
                "summary": "The circuit has a mathematical inconsistency.",
                "hints": ["Check for voltage sources in a loop without resistance and for disconnected nodes."],
                "codes": ["singular matrix"]
            }
            
        # Pattern 5 — timestep too small
        if "timestep too small" in lower_stderr or "time step is too small" in lower_stderr or "internal timestep" in lower_stderr:
            return {
                "summary": "The simulation could not converge.",
                "hints": ["Increase the simulation step size or reduce the simulation end time."],
                "codes": ["timestep too small"]
            }
            
        # Pattern 6 — no such function
        if "no such function" in lower_stderr or "unknown function" in lower_stderr:
            match = re.search(r'(?:no such function|unknown function)\s+([^\s,;.]+)', stderr_text, re.IGNORECASE)
            func_name = match.group(1) if match else "unknown"
            return {
                "summary": f"Function {func_name} is not recognized.",
                "hints": ["Check the function name spelling and verify it is supported by ngspice."],
                "codes": ["no such function"]
            }

        # Pattern 7 — device not found
        if "device not found" in lower_stderr or "unknown device type" in lower_stderr or "no model provided" in lower_stderr:
            match = re.search(r'(?:device not found|unknown device type|no model provided)\s+([^\s,;.]+)', stderr_text, re.IGNORECASE)
            dev_name = match.group(1) if match else "unknown"
            return {
                "summary": f"Device {dev_name} not found.",
                "hints": ["Check that the component model is correctly defined in the netlist or model library."],
                "codes": ["device not found"]
            }

    except Exception:
        pass
        
    # Safe fallback
    return {
        "summary": "Simulation failed with an unknown error",
        "hints": ["Check all nodes are connected", "Check all component models are defined", "Verify netlist syntax"],
        "codes": []
    }
