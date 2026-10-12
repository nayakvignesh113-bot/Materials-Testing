/* Nomenclature for every experiment: [symbol, meaning, SI / practical unit]. Loaded after the experiment files. */
(function () {
  const N = (LAB.NOMEN = {});
  N.tensile = [
    ['P', 'Applied load (P_max maximum, P_f at fracture, P_y at yield)', 'N or kN'],
    ['P_eH, P_eL', 'Upper and lower yield loads', 'kN'],
    ['S₀', 'Original cross-sectional area of the gauge length', 'mm²'],
    ['S_u', 'Minimum cross-sectional area after fracture', 'mm²'],
    ['d₀, d̄₀', 'Original gauge diameter (single reading, mean)', 'mm'],
    ['d_u', 'Diameter at the neck after fracture', 'mm'],
    ['L₀', 'Original gauge length', 'mm'],
    ['L_u', 'Final gauge length after fracture', 'mm'],
    ['δ', 'Extension of the gauge length', 'mm'],
    ['δ_u', 'Extension at maximum load', 'mm'],
    ['σ', 'Engineering stress', 'MPa (N/mm²)'],
    ['ε', 'Engineering strain', '— (mm/mm)'],
    ['σ_t, ε_t', 'True stress, true (logarithmic) strain', 'MPa, —'],
    ['E', 'Modulus of elasticity (Young’s modulus)', 'GPa'],
    ['R_eH, R_eL', 'Upper and lower yield strength', 'MPa'],
    ['R_p0.2', '0.2% proof (offset yield) strength', 'MPa'],
    ['R_m', 'Ultimate tensile strength', 'MPa'],
    ['A', 'Percentage elongation after fracture', '%'],
    ['Z', 'Percentage reduction of area', '%'],
    ['K', 'Strength coefficient (Hollomon)', 'MPa'],
    ['n', 'Strain-hardening exponent', '—'],
    ['m', 'Strain-rate sensitivity exponent', '—'],
    ['ε̇', 'Strain rate', 's⁻¹'],
    ['R²', 'Coefficient of determination of the least-squares fit', '—']
  ];
  N.compression = [
    ['P, P_max', 'Compressive load, maximum load', 'kN'],
    ['P_y', 'Load at 0.2% offset yield', 'kN'],
    ['P_pl', 'Load at limit of proportionality', 'kN'],
    ['A₀', 'Original cross-sectional area', 'mm²'],
    ['d₀', 'Original diameter of cylindrical specimen', 'mm'],
    ['b, t', 'Width and thickness of prismatic (timber) specimen', 'mm'],
    ['h₀, h_f, h', 'Initial, final and current height', 'mm'],
    ['d_f', 'Maximum (bulge) diameter after test', 'mm'],
    ['d', 'Ideal diameter from volume constancy', 'mm'],
    ['δ', 'Compression (decrease in height)', 'mm'],
    ['σ_c', 'Ultimate compressive strength', 'MPa'],
    ['σ_t', 'Tensile strength (for σ_c/σ_t ratio)', 'MPa'],
    ['σ_y', 'Compressive yield strength (0.2% offset)', 'MPa'],
    ['σ_pl', 'Stress at limit of proportionality', 'MPa'],
    ['σ_f', 'Flow stress of the material', 'MPa'],
    ['p̄', 'Average platen pressure', 'MPa'],
    ['ε', 'Compressive strain', '—'],
    ['E', 'Modulus of elasticity in compression', 'GPa'],
    ['μ', 'Coefficient of friction at platens', '—'],
    ['θ', 'Angle of fracture plane to load axis', 'degree'],
    ['φ', 'Angle of internal friction (Coulomb–Mohr)', 'degree']
  ];
  N.shear = [
    ['P, P_max', 'Applied load, maximum load at shearing', 'N or kN'],
    ['A', 'Cross-sectional area of bar (one shear plane)', 'mm²'],
    ['d', 'Bar diameter', 'mm'],
    ['n', 'Number of shear planes (1 single, 2 double)', '—'],
    ['τ, τ_u', 'Shear stress, ultimate shear strength', 'MPa'],
    ['τ̄', 'Mean ultimate shear strength of the specimens', 'MPa'],
    ['τ_y', 'Shear yield stress', 'MPa'],
    ['σ_u', 'Ultimate tensile strength', 'MPa'],
    ['σ_y', 'Tensile yield strength', 'MPa'],
    ['s', 'Sample standard deviation', 'MPa'],
    ['CoV', 'Coefficient of variation (s/τ̄ × 100)', '%'],
    ['F', 'Punching force (application example)', 'N'],
    ['t', 'Sheet thickness (application example)', 'mm']
  ];
  N.torsion = [
    ['T', 'Applied torque', 'N·m (N·mm in calculations)'],
    ['T_lp', 'Torque at limit of proportionality', 'N·m'],
    ['T_max', 'Maximum torque', 'N·m'],
    ['T_p, T_y', 'Fully plastic torque, torque at first yield', 'N·m'],
    ['J', 'Polar moment of inertia of the section', 'mm⁴'],
    ['d, r', 'Specimen diameter, outer radius (r = d/2)', 'mm'],
    ['ρ', 'Radial distance from the axis', 'mm'],
    ['L', 'Gauge length', 'mm'],
    ['θ', 'Angle of twist over L', 'rad (degree in tables)'],
    ['θ_f', 'Total angle of twist at fracture', 'degree'],
    ['τ', 'Shear stress', 'MPa'],
    ['τ_lp, τ_y', 'Shear stress at limit of proportionality, shear yield stress', 'MPa'],
    ['τ_r', 'Modulus of rupture (elastic formula at T_max)', 'MPa'],
    ['γ, γ_f', 'Shear strain at surface, at fracture', 'rad'],
    ['G', 'Modulus of rigidity (shear modulus)', 'GPa'],
    ['E', 'Modulus of elasticity', 'GPa'],
    ['ν', 'Poisson’s ratio', '—']
  ];
  N.bending = [
    ['P', 'Applied load', 'N'],
    ['P_pl, P_max', 'Load at limit of proportionality, maximum load', 'N'],
    ['δ', 'Deflection at the load point', 'mm'],
    ['L', 'Span (simply supported) or length (cantilever)', 'mm'],
    ['b, h', 'Width and depth of the beam section', 'mm'],
    ['I', 'Second moment of area about the neutral axis', 'mm⁴'],
    ['y', 'Distance from the neutral axis (h/2 at outer fibre)', 'mm'],
    ['M, M_max', 'Bending moment, maximum bending moment', 'N·mm'],
    ['σ, σ_max', 'Bending stress, maximum (outer-fibre) stress', 'MPa'],
    ['R', 'Radius of curvature of the neutral axis', 'mm'],
    ['E', 'Young’s modulus', 'GPa'],
    ['k', 'Beam stiffness P/δ', 'N/mm'],
    ['MOR', 'Modulus of rupture', 'MPa'],
    ['f_pl', 'Fibre stress at limit of proportionality', 'MPa'],
    ['G, A, κ', 'Shear modulus, cross-sectional area and shear correction factor (Timoshenko shear-deflection term)', 'GPa, mm², —']
  ];
  N.impact = [
    ['E₀', 'Rated (maximum) energy of the pendulum', 'J'],
    ['W', 'Weight of the pendulum', 'N'],
    ['R', 'Distance from pivot to centre of percussion', 'm'],
    ['WR', 'Pendulum constant', 'J (N·m)'],
    ['α', 'Release (fall) angle of the pendulum', 'degree'],
    ['β', 'Rise angle after breaking the specimen', 'degree'],
    ['β₀', 'Rise angle in a free swing (no specimen)', 'degree'],
    ['E, KV', 'Energy absorbed by the specimen (KV for Charpy V-notch)', 'J'],
    ['loss', 'Friction and windage loss of the pendulum', 'J'],
    ['A_notch', 'Cross-sectional area below the notch', 'mm²'],
    ['I', 'Impact strength (energy per unit notched area)', 'J/mm²'],
    ['T', 'Test temperature', '°C'],
    ['T₀', 'Mid-energy transition temperature (DBTT)', '°C'],
    ['C', 'Width parameter of the transition (tanh fit)', '°C'],
    ['US, LS', 'Upper-shelf and lower-shelf energy', 'J'],
    ['FATT', '50% fracture-appearance transition temperature', '°C'],
    ['T₂₇J', 'Temperature at which KV = 27 J', '°C']
  ];
  N.fatigue = [
    ['W', 'Applied dead-weight load', 'N'],
    ['a', 'Moment arm (M = W·a)', 'mm'],
    ['M', 'Bending moment on the test section', 'N·mm'],
    ['d', 'Minimum diameter of the specimen', 'mm'],
    ['σ_a', 'Stress amplitude', 'MPa'],
    ['σ_m', 'Mean stress', 'MPa'],
    ['σ_max, σ_min', 'Maximum and minimum stress in a cycle', 'MPa'],
    ['R', 'Stress ratio σ_min/σ_max', '—'],
    ['N, N_f', 'Cycles to failure', 'cycles'],
    ['2N_f', 'Reversals to failure', 'reversals'],
    ['σ′_f', 'Fatigue strength coefficient (Basquin)', 'MPa'],
    ['b', 'Fatigue strength (Basquin) exponent', '—'],
    ['S_e, S′_e', 'Endurance limit (component, polished specimen)', 'MPa'],
    ['σ_u', 'Ultimate tensile strength', 'MPa'],
    ['k_a, k_b, k_c, k_d', 'Marin factors: surface, size, load, temperature', '—'],
    ['n_i, N_i', 'Cycles applied and cycles to failure at level i (Miner)', 'cycles']
  ];
  N.creep = [
    ['σ', 'Applied (engineering) stress', 'MPa'],
    ['W', 'Dead-weight load', 'kg'],
    ['d', 'Wire diameter', 'mm'],
    ['ε', 'Creep strain', '— or %'],
    ['ε̇, ε̇_ss, ε̇_min', 'Creep rate; steady-state (minimum) creep rate', 'h⁻¹ (s⁻¹)'],
    ['A', 'Material constant in the Norton–Arrhenius law', 'MPa⁻ⁿ h⁻¹'],
    ['n', 'Norton stress exponent', '—'],
    ['Q', 'Activation energy for creep', 'J/mol'],
    ['R', 'Universal gas constant (8.314)', 'J/(mol·K)'],
    ['T', 'Absolute test temperature', 'K'],
    ['T_m', 'Absolute melting temperature', 'K'],
    ['t, t_r', 'Time, time to rupture', 'h'],
    ['LMP', 'Larson–Miller parameter', 'K·(log h)'],
    ['C', 'Larson–Miller constant (≈ 20)', '—'],
    ['C_MG', 'Monkman–Grant constant', '—']
  ];
  N.brinell = [
    ['F', 'Test force', 'kgf (1 kgf = 9.80665 N)'],
    ['D', 'Ball diameter', 'mm'],
    ['d', 'Mean diameter of the impression', 'mm'],
    ['d₁, d₂', 'Two perpendicular impression diameters', 'mm'],
    ['h', 'Depth of the impression', 'mm'],
    ['k', 'Force–diameter ratio 0.102F/D² (F in N) = F/D² (F in kgf)', 'kgf/mm²'],
    ['HB, HBW', 'Brinell hardness (HBW: tungsten carbide ball)', 'kgf/mm² (reported unitless)'],
    ['HM', 'Meyer hardness (load / projected area)', 'kgf/mm²'],
    ['σ_u', 'Estimated ultimate tensile strength', 'MPa'],
    ['s', 'Standard deviation of the readings', 'HBW']
  ];
  N.rockwell = [
    ['F₀', 'Minor (preliminary) test force, 10 kgf', 'kgf'],
    ['F₁', 'Additional test force', 'kgf'],
    ['F', 'Total test force (F₀ + F₁): 60, 100 or 150', 'kgf'],
    ['e', 'Permanent increase in depth of penetration', 'mm'],
    ['s', 'Scale unit, 0.002 mm per Rockwell unit', 'mm'],
    ['N', 'Scale constant: 100 (diamond), 130 (ball)', '—'],
    ['HR', 'Rockwell hardness number (HRA, HRB, HRC)', '—'],
    ['HV', 'Equivalent Vickers hardness (ASTM E140)', 'kgf/mm²'],
    ['t', 'Specimen thickness', 'mm']
  ];
  N.vickers = [
    ['F', 'Test force', 'kgf'],
    ['d₁, d₂', 'Lengths of the two diagonals of the impression', 'µm (mm in formula)'],
    ['d', 'Mean diagonal', 'mm'],
    ['h', 'Depth of the impression (≈ d/7)', 'mm'],
    ['α', 'Face angle of the pyramid, 136°', 'degree'],
    ['HV', 'Vickers hardness number', 'kgf/mm² (reported unitless)'],
    ['a, n', 'Meyer law constant and Meyer index (F = a dⁿ)', '—'],
    ['ISE', 'Indentation size effect (relative increase in HV)', '%'],
    ['x', 'Distance from the surface (traverse)', 'mm'],
    ['ECD (CHD)', 'Effective case depth at 550 HV', 'mm']
  ];
  N.wear = [
    ['F_N', 'Normal load on the pin', 'N'],
    ['F_f', 'Friction (tangential) force', 'N'],
    ['μ', 'Coefficient of friction', '—'],
    ['D', 'Wear track diameter', 'mm (m in s)'],
    ['N', 'Disc speed', 'rpm (rev/s in s)'],
    ['v', 'Sliding velocity', 'm/s'],
    ['t', 'Sliding time', 's'],
    ['s', 'Sliding distance', 'm'],
    ['m₁, m₂', 'Pin mass before and after test', 'g'],
    ['Δm', 'Mass loss', 'g'],
    ['ρ', 'Density of the pin material', 'g/cm³'],
    ['V', 'Volume loss', 'mm³'],
    ['W', 'Wear rate (V/s)', 'mm³/m'],
    ['k', 'Specific wear rate', 'mm³/(N·m)'],
    ['H', 'Hardness of the softer surface (HV × 9.807)', 'N/mm²'],
    ['K', 'Archard wear coefficient', '—'],
    ['h', 'Linear wear (height loss) from LVDT', 'µm'],
    ['A_p', 'Pin cross-sectional area πd²/4', 'mm²']
  ];
  N.ultrasonic = [
    ['v', 'Longitudinal wave velocity in the material', 'm/s (mm/µs)'],
    ['t', 'Time of flight (round trip)', 'µs'],
    ['t₁, t₃, t_{n+1}', 'Times of the first, third and (n+1)th back-wall echoes', 'µs'],
    ['t_B, t_F', 'Back-wall and flaw echo times on the test block', 'µs'],
    ['T', 'Thickness of calibration or test block', 'mm'],
    ['d', 'Depth of reflector below the surface', 'mm'],
    ['n', 'Echo number (multiple back-wall echoes)', '—'],
    ['f', 'Probe frequency', 'MHz'],
    ['λ', 'Wavelength (v/f)', 'mm'],
    ['D', 'Probe crystal diameter', 'mm'],
    ['N', 'Near-field length', 'mm'],
    ['γ', 'Beam half-angle at −6 dB', 'degree'],
    ['A₁, A₂', 'Echo amplitudes', '% FSH'],
    ['ΔdB', 'Amplitude ratio in decibels', 'dB'],
    ['α', 'Attenuation coefficient', 'dB/mm'],
    ['Z', 'Acoustic impedance ρv', 'kg/(m²·s)'],
    ['x', 'Probe position along the scan', 'mm']
  ];
  N.mpi = [
    ['L', 'Length of the part', 'mm'],
    ['D', 'Diameter of the part', 'mm'],
    ['L/D', 'Length-to-diameter ratio', '—'],
    ['N', 'Number of coil turns', '—'],
    ['I', 'Magnetising current', 'A'],
    ['NI', 'Ampere-turns of the coil', 'A'],
    ['H', 'Tangential magnetic field strength at the surface', 'kA/m (Oe)'],
    ['θ', 'Angle between discontinuity and magnetic field', 'degree'],
    ['AC / HWDC', 'Alternating current / half-wave rectified direct current', '—']
  ];
  N.dpt = [
    ['Δp', 'Capillary pressure drawing penetrant into the opening', 'Pa'],
    ['γ', 'Surface tension of the penetrant', 'N/m'],
    ['θ', 'Contact angle between penetrant and surface', 'degree'],
    ['w', 'Width of the surface opening', 'm (µm)'],
    ['L', 'Length (major dimension) of an indication', 'mm'],
    ['W', 'Width of an indication', 'mm'],
    ['t_d', 'Penetrant dwell time', 'min'],
    ['E', 'Illuminance at the inspection surface', 'lux']
  ];
  N.specprep = [
    ['P-grade', 'FEPA grit designation of SiC paper (P220 … P2500)', '—'],
    ['d_a', 'Median abrasive particle size', 'µm'],
    ['t', 'Time on each grinding or polishing step', 'min'],
    ['F', 'Load on the specimen during grinding/polishing', 'N'],
    ['t_e', 'Etching time', 's'],
    ['T', 'Mounting temperature', '°C'],
    ['n', 'Wheel speed', 'rpm']
  ];
  N.microstructure = [
    ['C', 'Carbon content of the steel', 'wt%'],
    ['f_P', 'Fraction of pearlite by lever rule', '— or %'],
    ['f_Fe₃C', 'Fraction of pro-eutectoid cementite', '—'],
    ['P_P', 'Point fraction on pearlite (points on phase / total points)', '— or %'],
    ['P_α, P_T', 'Points on the phase, total grid points', 'count'],
    ['V_V', 'Volume fraction of a phase', '—'],
    ['n', 'Number of grid points per field', 'count'],
    ['M', 'Total magnification', '×'],
    ['M_objective, M_eyepiece', 'Magnification of objective and eyepiece', '×'],
    ['0.022, 0.77, 6.67', 'Carbon contents of ferrite, eutectoid and cementite', 'wt% C']
  ];
  N.grainsize = [
    ['G', 'ASTM grain size number', '—'],
    ['n', 'Grains per square inch at 100×', 'in⁻²'],
    ['N_i', 'Grain-boundary intercepts on test line i', 'count'],
    ['L_T', 'Total true length of test lines', 'µm (mm)'],
    ['M', 'Magnification', '×'],
    ['ℓ̄', 'Mean lineal intercept length', 'µm (mm in G equation)'],
    ['N_inside', 'Grains completely inside the test circle', 'count'],
    ['N_intercepted', 'Grains cut by the test circle', 'count'],
    ['A', 'True area of the test circle', 'mm²'],
    ['N_A', 'Number of grains per unit area at 1×', 'mm⁻²'],
    ['σ_y', 'Yield strength (Hall–Petch)', 'MPa'],
    ['σ₀', 'Friction stress (lattice resistance), 70 MPa for ferrite', 'MPa'],
    ['k', 'Hall–Petch coefficient, 0.74 for ferrite', 'MPa·m½'],
    ['d', 'Grain size used in Hall–Petch (taken as ℓ̄)', 'm']
  ];
  N.jominy = [
    ['J', 'Distance from the quenched end', 'mm'],
    ['J₅₀', 'Jominy distance to 50% martensite hardness', 'mm'],
    ['HRC', 'Rockwell C hardness', '—'],
    ['HRC₉₉, HRC₅₀', 'Hardness of 99% and 50% martensite (Hodge–Orehoski)', 'HRC'],
    ['C', 'Carbon content', 'wt%'],
    ['T(x,t)', 'Temperature at distance x and time t', '°C'],
    ['T_a', 'Austenitising temperature', '°C'],
    ['T_w', 'Quench water temperature', '°C'],
    ['α', 'Thermal diffusivity of steel', 'm²/s'],
    ['x', 'Distance from quenched end', 'm (mm)'],
    ['t', 'Time from start of quench', 's'],
    ['D_I', 'Grossmann ideal critical diameter', 'mm'],
    ['f_Mn, f_Cr, …', 'Grossmann multiplying factors for alloying elements', '—']
  ];
  N.heattreat = [
    ['Ac₁, Ac₃', 'Lower and upper critical temperatures on heating', '°C'],
    ['A₁', 'Eutectoid temperature (727 °C)', '°C'],
    ['M_s', 'Martensite start temperature', '°C'],
    ['P', 'Hollomon–Jaffe tempering parameter', '—'],
    ['T', 'Absolute tempering temperature', 'K'],
    ['t', 'Tempering time', 'h'],
    ['C', 'Hollomon–Jaffe constant (≈ 20)', '—'],
    ['HV', 'Vickers hardness (HV 10)', 'kgf/mm² (unitless)'],
    ['HRC', 'Rockwell C hardness', '—'],
    ['σ_u', 'Estimated tensile strength', 'MPa']
  ];
  N.xrd = [
    ['n', 'Order of reflection (integer)', '—'],
    ['λ', 'X-ray wavelength (Cu Kα₁ = 1.5406 Å)', 'Å'],
    ['d', 'Interplanar spacing', 'Å'],
    ['θ', 'Bragg angle (half the diffraction angle)', 'degree (rad in Scherrer)'],
    ['2θ', 'Diffraction angle', 'degree'],
    ['h, k, l', 'Miller indices of the reflecting planes', '—'],
    ['N', 'h² + k² + l²', '—'],
    ['a', 'Lattice parameter of the cubic cell', 'Å'],
    ['F_hkl', 'Structure factor', '—'],
    ['f', 'Atomic scattering factor', 'electrons'],
    ['β_obs, β_inst', 'Observed and instrumental FWHM', 'degree 2θ'],
    ['β', 'Sample broadening (corrected FWHM)', 'rad'],
    ['K', 'Scherrer shape constant (0.9)', '—'],
    ['L', 'Crystallite size', 'nm'],
    ['ε', 'Microstrain', '—'],
    ['I/I₀', 'Relative peak intensity', '%']
  ];
  N.sem = [
    ['E', 'X-ray photon energy', 'keV'],
    ['Z', 'Atomic number', '—'],
    ['σ', 'Screening constant (Moseley)', '—'],
    ['Kα, Kβ, Lα', 'Characteristic X-ray lines', '—'],
    ['N_i', 'Net (background-subtracted) Kα counts of element i', 'counts'],
    ['k_i', 'Sensitivity factor of element i (relative to Si)', '—'],
    ['C_i', 'Concentration of element i', 'wt%'],
    ['s', 'Striation spacing', 'µm'],
    ['da/dN', 'Fatigue crack growth rate', 'mm/cycle'],
    ['ΔK', 'Stress intensity factor range (Paris law)', 'MPa·√m'],
    ['M', 'Magnification', '×'],
    ['W', 'Field width (scanned width on the specimen)', 'µm'],
    ['W_screen', 'Width of the image on the display', 'mm'],
    ['WD', 'Working distance', 'mm'],
    ['kV', 'Accelerating voltage', 'kV']
  ];
})();
