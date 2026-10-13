/* Safety briefings (shown and acknowledged before Operate) and tools & consumables libraries (Theory tab).
   SAFETY[id] = { haz:[], ppe:[], rules:[], emerg:[] }      LIB[id] = { cols:[], rows:[[]], note } */
(function () {
  const S = (LAB.SAFETY = {}), L = (LAB.LIB = {});
  const UTM_EMERG = ['Press the red emergency stop on the UTM console; it cuts hydraulic pressure and crosshead motion.', 'Do not reach into the test space until the crosshead has stopped and load reads zero.', 'Report any injury, oil leak or abnormal noise to the laboratory in-charge before restarting.'];
  const LIB_COLS = ['Item', 'Specification', 'Purpose / note'];

  S.tensile = {
    haz: ['Stored elastic energy is released violently at fracture; fragments and grip wedges can be ejected.', 'Pinch points between the crosshead and grips.', 'High-pressure hydraulic oil in the actuator and hoses.', 'Sharp burrs on broken specimens.'],
    ppe: ['Safety glasses with side shields', 'Closed shoes', 'Cotton gloves for handling broken specimens (not while operating controls)'],
    rules: ['Close the transparent guard before loading.', 'Keep hands out of the test space while the crosshead moves.', 'Remove the extensometer before necking, as instructed by the software prompt.', 'Never exceed the selected load range; check the expected maximum load first.', 'Only one person operates the console at a time.'],
    emerg: UTM_EMERG };
  L.tensile = { cols: LIB_COLS, rows: [
    ['Round tensile specimen', 'd₀ 8–12.5 mm, proportional L₀ = 5.65√S₀ (IS 1608 Annex D)', 'Machined; surface Ra ≤ 1.6 µm in the parallel length'],
    ['Wedge grips', 'V-groove faces for 6–20 mm rounds', 'Self-tightening; check teeth for wear'],
    ['Clip-on extensometer', 'Gauge 50 mm, travel ±5 mm, Class 0.5 (ISO 9513)', 'Remove before necking'],
    ['Outside micrometer', '0–25 mm, LC 0.01 mm', 'Three readings along the gauge'],
    ['Vernier calliper', '0–150 mm, LC 0.02 mm', 'Final gauge length after fracture'],
    ['Centre punch and marking ink', '—', 'Gauge marks; light punch only']],
    note: 'Specimens are prepared to IS 1608 (Part 1) Annex D or ASTM E8 Figure 8.' };

  S.compression = {
    haz: ['Brittle specimens (cast iron) shatter and eject fragments at high speed.', 'Pinch points between platens.', 'Hydraulic oil under high pressure.'],
    ppe: ['Safety glasses or face shield', 'Closed shoes'],
    rules: ['Always close the transparent guard for brittle specimens.', 'Centre the specimen; off-centre loading can tilt the platen and eject the specimen.', 'Use the lowest load range that covers the expected maximum load.', 'Do not compress ductile metals beyond the planned height reduction.'],
    emerg: UTM_EMERG };
  L.compression = { cols: LIB_COLS, rows: [
    ['Cylindrical metal specimen', 'd = 20 mm, h/d = 1–2 (ASTM E9 short)', 'Ends faced flat and parallel within 0.02 mm'],
    ['Timber prism', '20 × 20 × 80 mm (∥ grain); 50 × 50 × 150 mm (⊥ grain), IS 1708', 'Conditioned to 12% moisture'],
    ['Spherically seated platen', 'Hardened, Ø 100 mm', 'Corrects small non-parallelism'],
    ['Compressometer', 'LC 0.001 mm', 'Elastic region only'],
    ['MoS₂ grease', 'Thin film', 'Reduces platen friction and barrelling']] };

  S.shear = {
    haz: ['Sheared pieces can be ejected from the fixture.', 'Sharp hardened blades.', 'Pinch points between ram and fixture.'],
    ppe: ['Safety glasses', 'Closed shoes', 'Gloves when handling blades'],
    rules: ['Inspect blades for chips before use.', 'Place the fixture centrally and keep hands clear when loading.', 'Keep the guard closed while loading.'],
    emerg: UTM_EMERG };
  L.shear = { cols: LIB_COLS, rows: [
    ['Round bar specimens', 'Ø 8, 10 or 12 mm × 80 mm', 'Three per material'],
    ['Double-shear fixture', 'Hardened blades, bore H7 for bar size', 'Clearance ≤ 0.05 mm'],
    ['Single-shear attachment', 'Hardened block and cutter', 'Introduces some bending'],
    ['Micrometer', '0–25 mm, LC 0.01 mm', 'Measure at each shear plane']] };

  S.torsion = {
    haz: ['Rotating chuck can catch loose clothing, hair or jewellery.', 'Stored torsional energy is released at fracture; ends can whip.', 'Sharp fracture edges.'],
    ppe: ['Safety glasses', 'Close-fitting clothing; tie back long hair; no rings or watches', 'Closed shoes'],
    rules: ['Close the guard before twisting.', 'Remove the troptometer before large plastic twist.', 'Never adjust the specimen while the motor is energised.', 'Twist slowly in the elastic range.'],
    emerg: ['Press emergency stop; the drive brake holds the chuck.', 'Release torque by reversing slowly only after the drive is stopped and reset.', 'Report injuries immediately.'] };
  L.torsion = { cols: LIB_COLS, rows: [
    ['Torsion specimen', 'Ø 8–12 mm, gauge 100–200 mm, hexagonal or flat-sided ends', 'Ends fit chuck jaws without slip'],
    ['Troptometer', 'Resolution 0.01°, gauge 100 mm', 'Elastic twist only'],
    ['Torsion machine', '500 N·m, angle encoder 0.1°', 'Calibrated torque cell'],
    ['Scriber and steel rule', '—', 'Longitudinal reference line']] };

  S.bending = {
    haz: ['Falling slotted weights and hanger.', 'Beam can slip off supports when overloaded.', 'Timber splinters at failure (UTM test).'],
    ppe: ['Safety shoes', 'Safety glasses for the timber test'],
    rules: ['Add and remove weights gently without impact.', 'Keep maximum stress below 60% of yield; check before adding weights.', 'Keep feet clear of the hanger.', 'Use the UTM guard for the timber failure test.'],
    emerg: ['Lift weights off before attempting to move a slipped beam.', 'For the UTM test press emergency stop.', 'Report injuries to the laboratory in-charge.'] };
  L.bending = { cols: LIB_COLS, rows: [
    ['Flat beam specimens', '25 × 6 mm, length 700 mm (MS, Al, brass)', 'Straight within 0.5 mm'],
    ['Timber beam', '25 × 25 × 400 mm teak, IS 1708-5', '12% moisture content'],
    ['Knife-edge supports', 'Hardened, span adjustable 300–600 mm', 'Allow free rotation'],
    ['Slotted weights and hanger', '0.5 kg steps', 'Include hanger mass'],
    ['Dial gauge on magnetic stand', '0–25 mm, LC 0.01 mm', 'Plunger at the load point']] };

  S.impact = {
    haz: ['Swinging pendulum can cause serious injury.', 'Broken specimen halves leave the anvils at high speed.', 'Cryogenic baths (dry ice, liquid nitrogen) cause cold burns; hot oil baths cause burns.'],
    ppe: ['Safety glasses', 'Cryogenic or heat-resistant gloves for conditioning baths', 'Closed shoes'],
    rules: ['Engage the pendulum safety latch whenever placing a specimen.', 'Stand outside the swing path and behind the guard before release.', 'Use centring tongs; never place a specimen by hand.', 'Strike within 5 s of removal from the bath.', 'Use the brake to stop the pendulum; never catch it by hand.'],
    emerg: ['Apply the pendulum brake and engage the latch.', 'For cold burns, warm the area slowly with lukewarm water; do not rub.', 'Report injuries immediately.'] };
  L.impact = { cols: LIB_COLS, rows: [
    ['Charpy V-notch specimen', '10 × 10 × 55 mm, 2 mm × 45°, root r 0.25 mm', 'IS 1757-1 / ASTM E23 Type A'],
    ['Izod V-notch specimen', '10 × 10 × 75 mm', 'IS 1598'],
    ['Pendulum tester', 'Charpy 300 J, Izod 168 J', 'Verified with reference specimens'],
    ['Notch gauge / shadowgraph', '—', 'Check notch geometry'],
    ['Conditioning bath', '−80 to +100 °C, ±1 °C', 'Ethanol + dry ice, LN₂, or oil'],
    ['Centring tongs', '—', 'Transfer within 5 s']] };

  S.fatigue = {
    haz: ['Rotating specimen and collets at 4500 rpm.', 'Specimen halves and weights drop at fracture.', 'Specimens become hot at high stress.'],
    ppe: ['Safety glasses', 'Close-fitting clothing; tie back hair', 'Safety shoes'],
    rules: ['Keep the guard closed while running.', 'Apply the load only as instructed for the machine (usually after reaching speed).', 'Never touch the rotating specimen.', 'Check run-out before loading.'],
    emerg: ['Press the motor stop; wait for rotation to cease.', 'Lift the load off before removing a broken specimen.', 'Report injuries immediately.'] };
  L.fatigue = { cols: LIB_COLS, rows: [
    ['Hourglass specimen', 'd_min 7.5 mm, R.R. Moore profile', 'Polished longitudinally, Ra ≤ 0.2 µm'],
    ['Rotating-beam machine', '4500 rpm, dead-weight loading', 'Moment arm per machine plate'],
    ['Revolution counter', 'Auto cut-off at fracture', 'Resolution 100 cycles'],
    ['Micrometer', 'LC 0.001 mm', 'Minimum diameter']] };

  S.creep = {
    haz: ['Lead and lead–tin solder are toxic by ingestion.', 'Hot bath or furnace surfaces.', 'Falling dead weights at rupture.'],
    ppe: ['Nitrile gloves when handling lead', 'Safety shoes', 'Heat-resistant gloves near the furnace'],
    rules: ['Wash hands after handling lead; no food or drink in the lab.', 'Apply weights gently without shock.', 'Place a catch tray under the weights.', 'Keep the temperature within ±1 °C.'],
    emerg: ['Switch off the heater at the mains.', 'For burns, cool with running water for 20 minutes.', 'Report lead ingestion or injury immediately.'] };
  L.creep = { cols: LIB_COLS, rows: [
    ['Wire specimens', 'Ø 2 mm, gauge 100 mm (Pb, Sn–Pb, Al 1100-O)', 'Straight, unkinked'],
    ['Lever creep frame', '3 stations, dead-weight', 'Constant load'],
    ['Bath or furnace', '±1 °C PID control', 'Type K thermocouple'],
    ['LVDT extensometers + logger', '0.001 mm resolution', 'Log every 30 s']] };

  S.brinell = {
    haz: ['High test force (up to 3000 kgf) between indenter and anvil.', 'Specimen can slip off a curved or unstable anvil.'],
    ppe: ['Safety glasses', 'Closed shoes'],
    rules: ['Use a flat, stable specimen on a matching anvil.', 'Keep fingers away from the indenter during loading.', 'Apply load smoothly; never jerk the handwheel.'],
    emerg: ['Release the load using the unloading lever.', 'Report damaged balls or anvils.'] };
  L.brinell = { cols: LIB_COLS, rows: [
    ['Tungsten carbide balls', 'Ø 10, 5, 2.5 mm', 'HBW up to 650'],
    ['Brinell microscope', '20×, LC 0.01 mm', 'Two perpendicular readings'],
    ['Flat and V-anvils', '—', 'Match specimen shape'],
    ['Test blocks', 'Certified HBW', 'Daily verification']] };

  S.rockwell = {
    haz: ['Diamond indenter can chip or shatter if misused.', 'Pinch point between specimen and indenter.'],
    ppe: ['Safety glasses'],
    rules: ['Never let the indenter touch the anvil without a specimen.', 'Do not use the diamond on soft materials below 20 HRC.', 'Keep specimens clean and seated firmly.'],
    emerg: ['Release the major load and lower the elevating screw.', 'Report a damaged indenter; do not continue testing.'] };
  L.rockwell = { cols: LIB_COLS, rows: [
    ['Diamond cone indenter', '120°, tip r 0.2 mm', 'Scales A, C, D'],
    ['Steel ball indenter', '1/16″ (1.5875 mm)', 'Scales B, F, G'],
    ['Standard test blocks', 'Certified HRC, HRB', 'Verify before use'],
    ['Anvils', 'Flat, V, spot', 'Match geometry']] };

  S.vickers = {
    haz: ['Diamond indenter is fragile and expensive.', 'Bright illumination close to the eyes.'],
    ppe: ['None beyond normal laboratory clothing'],
    rules: ['Focus with the objective, not the indenter, to avoid collisions.', 'Never strike the specimen with the turret when changing objectives.', 'Polished specimens: handle by the edges.'],
    emerg: ['Stop the loading cycle with the stop key.', 'Report any collision of objective or indenter with the specimen.'] };
  L.vickers = { cols: LIB_COLS, rows: [
    ['Diamond pyramid indenter', '136° square-based', 'Inspect tip regularly'],
    ['Filar micrometer eyepiece', 'Resolution 0.5 µm', 'Measure both diagonals'],
    ['Microhardness tester', '0.01–1 kgf', 'Traverses and thin layers'],
    ['Polished mounts', '1 µm finish, lightly etched for traverse', '—']] };

  S.wear = {
    haz: ['Rotating disc can catch fingers, gloves or hair.', 'Hot pin and disc after sliding.', 'Acetone is flammable.', 'Fine wear debris.'],
    ppe: ['Safety glasses', 'Nitrile gloves when cleaning with acetone', 'Close-fitting clothing'],
    rules: ['Never touch the disc while it rotates.', 'Mount the pin and load before starting.', 'Use acetone away from ignition sources.', 'Clean debris with a brush, not compressed air.'],
    emerg: ['Press the stop button; wait for the disc to stop.', 'For acetone splash in the eyes, flush with water for 15 minutes.', 'Report injuries immediately.'] };
  L.wear = { cols: LIB_COLS, rows: [
    ['Pin specimens', 'Ø 8 × 30 mm, flat ground end', 'Ra < 0.4 µm'],
    ['Counter-disc', 'EN31, 60–62 HRC, Ø 165 mm', 'Ra 0.2–0.4 µm'],
    ['Electronic balance', 'Readability 0.1 mg', 'Weigh before and after'],
    ['LVDT', 'Resolution 1 µm', 'Linear wear'],
    ['Load cell', '0.01 N resolution', 'Friction force'],
    ['Acetone + ultrasonic cleaner', '—', 'Clean before weighing']] };

  S.ultrasonic = {
    haz: ['Trip hazard from cables.', 'Couplant spills make the floor slippery.', 'Contact probes near hot parts.'],
    ppe: ['Gloves when handling couplant'],
    rules: ['Use only on surfaces below the probe’s temperature rating.', 'Wipe up couplant spills.', 'Switch off before connecting or disconnecting probes.'],
    emerg: ['Switch off the flaw detector at the mains.', 'Report damaged cables.'] };
  L.ultrasonic = { cols: LIB_COLS, rows: [
    ['Normal probe', '2–5 MHz, Ø 10 mm crystal', 'Longitudinal waves'],
    ['Angle probes', '45°, 60°, 70°', 'Weld inspection (not used here)'],
    ['Calibration block', 'V1 / IIW, 25 mm steel', 'Velocity and range'],
    ['Couplant', 'Glycerine or gel', 'Thin even film'],
    ['Flaw detector', 'A-scan, 0–10 MHz', 'Calibrate daily']] };

  S.mpi = {
    haz: ['High currents (up to 3000 A) can cause arc burns at contacts.', 'UV-A radiation can harm eyes and skin.', 'Particle bath is flammable (oil-based) and slippery.', 'Residual magnetism attracts tools.'],
    ppe: ['UV-blocking glasses for fluorescent inspection', 'Nitrile gloves', 'Apron'],
    rules: ['Ensure clean, tight head-stock contact before energising.', 'Do not look directly into the UV-A lamp.', 'Keep the bath away from ignition sources.', 'Demagnetise parts after inspection.'],
    emerg: ['Switch off the main power; do not touch the part during a shot.', 'For arc burns, cool and seek first aid.', 'Report bath spills.'] };
  L.mpi = { cols: LIB_COLS, rows: [
    ['Wet horizontal MPI bench', 'AC/HWDC, ≤ 3000 A, 5-turn coil', 'Head shot and coil shot'],
    ['Fluorescent particle bath', '0.1–0.4 mL/100 mL', 'Check with settling tube'],
    ['UV-A lamp', '365 nm, ≥ 1000 µW/cm²', 'Ambient light < 20 lux'],
    ['Pie gauge / QQI shims', '—', 'Field direction and adequacy'],
    ['Gaussmeter', 'Hall effect', 'Residual field after demagnetising']] };

  S.dpt = {
    haz: ['Aerosol cans are flammable and pressurised.', 'Solvent vapour irritates eyes and lungs.', 'Skin irritation from penetrant and remover.'],
    ppe: ['Nitrile gloves', 'Safety glasses', 'Use in a ventilated area or fume hood'],
    rules: ['No flames or hot surfaces nearby.', 'Never spray remover directly on the part.', 'Keep cans below 50 °C.', 'Dispose of used cloths in a closed metal bin.'],
    emerg: ['For eye contact, flush with water for 15 minutes.', 'Ventilate the area after a large spill.', 'Use a CO₂ or dry powder extinguisher for solvent fires.'] };
  L.dpt = { cols: LIB_COLS, rows: [
    ['Cleaner/remover', 'Solvent, same family', 'Pre-clean and excess removal'],
    ['Visible red penetrant', 'Type II, Method C, sensitivity 2', 'Dwell ≥ 5 min'],
    ['Non-aqueous developer', 'White, aerosol', 'Thin even coat'],
    ['Lint-free cloths', '—', 'Dry wipe then damp wipe'],
    ['Light meter', '≥ 1000 lux', 'Check before inspection']] };

  S.specprep = {
    haz: ['Abrasive cut-off wheel can shatter.', 'Etchants are corrosive; Keller’s reagent contains hydrofluoric acid.', 'Hot mounting press (170 °C).', 'Rotating grinding and polishing wheels.'],
    ppe: ['Safety glasses or face shield', 'Acid-resistant gloves and apron for etching', 'Lab coat'],
    rules: ['Use the cut-off machine only with its guard closed and coolant flowing.', 'Etch only in the fume hood; keep calcium gluconate gel available for HF.', 'Hold specimens firmly on wheels; never use gloves near rotating wheels.', 'Allow mounts to cool before handling.'],
    emerg: ['For acid on skin, rinse with water for 15 minutes; for HF apply calcium gluconate and get medical help.', 'Stop wheels with the switch, not by hand.', 'Report all chemical exposures.'] };
  L.specprep = { cols: LIB_COLS, rows: [
    ['Abrasive cut-off wheel', 'Al₂O₃ for steels, SiC for non-ferrous', 'With coolant'],
    ['Mounting resin', 'Phenolic (hot) / epoxy (cold)', '30 mm mounts'],
    ['SiC papers', 'P220, P400, P600, P800, P1200, P2500', 'Wet, 300 rpm'],
    ['Polishing suspensions', '6 µm, 1 µm diamond; 0.05 µm alumina', 'Napless then napped cloth'],
    ['Etchants', '2% Nital, Keller’s, alcoholic FeCl₃', 'ASTM E407']] };

  S.microstructure = {
    haz: ['Bright illumination.', 'Etched specimens may retain traces of acid.'],
    ppe: ['None beyond normal laboratory clothing'],
    rules: ['Focus away from the specimen with high-power objectives.', 'Handle specimens by the edges.', 'Turn the lamp down before switching off.'],
    emerg: ['Switch off the lamp if it overheats.', 'Report broken objectives or slides.'] };
  L.microstructure = { cols: LIB_COLS, rows: [
    ['Inverted metallurgical microscope', 'Objectives 10×, 20×, 50×', 'Köhler illumination'],
    ['Eyepiece reticle / camera', '10×, calibrated', 'Scale bar on images'],
    ['Point grid overlay', '48 or 64 points', 'ASTM E562'],
    ['Reference micrograph atlas', 'ASM Vol. 9', 'Comparison']] };

  S.grainsize = {
    haz: ['Furnace at up to 1100 °C.', 'Hot specimens after annealing.'],
    ppe: ['Heat-resistant gloves and face shield at the furnace', 'Tongs'],
    rules: ['Use tongs for furnace loading and unloading.', 'Allow specimens to cool before preparation.', 'Do not open the furnace door longer than necessary.'],
    emerg: ['Switch off the furnace at the isolator.', 'For burns, cool with running water for 20 minutes.'] };
  L.grainsize = { cols: LIB_COLS, rows: [
    ['Cold-rolled low-carbon steel', '0.05% C, 70% reduction', 'Annealed at 800–1100 °C'],
    ['Stage micrometer', '1 mm in 0.01 mm divisions', 'Magnification calibration'],
    ['Test line and circle overlay', 'Known true lengths', 'Heyn and Jeffries methods'],
    ['ASTM E112 comparison charts', 'Plates I–IV', 'Quick estimate']] };

  S.jominy = {
    haz: ['Bar at up to 900 °C.', 'Steam and hot water spray.', 'Furnace radiant heat.'],
    ppe: ['Face shield and heat-resistant gloves', 'Leather apron', 'Safety shoes'],
    rules: ['Use tongs; transfer within 5 s.', 'Set the jet before opening the furnace.', 'Stand to the side when the jet strikes the hot bar.', 'Grind flats with coolant.'],
    emerg: ['Close the water valve and switch off the furnace.', 'For burns, cool with running water for 20 minutes.'] };
  L.jominy = { cols: LIB_COLS, rows: [
    ['Jominy specimen', 'Ø 25 × 100 mm with collar', 'Normalised before test'],
    ['End-quench fixture', 'Orifice 12.5 mm, free jet 63.5 mm', 'Water 5–30 °C'],
    ['Furnace', 'To 1000 °C, charcoal pack', 'Prevents decarburisation'],
    ['Rockwell tester + Jominy fixture', 'HRC', 'Traverse along flats']] };

  S.heattreat = {
    haz: ['Furnaces up to 900 °C.', 'Quench oil can ignite if a hot part is not fully immersed.', 'Steam and spatter during water quench.'],
    ppe: ['Face shield, heat-resistant gloves and leather apron', 'Safety shoes'],
    rules: ['Fully immerse parts quickly in oil; keep the tank lid within reach.', 'Use long tongs and stand to the side of the tank.', 'Never quench into an unagitated or overheated tank.'],
    emerg: ['For an oil fire, close the tank lid; never use water.', 'Switch off furnaces at the isolator.', 'For burns, cool with running water for 20 minutes.'] };
  L.heattreat = { cols: LIB_COLS, rows: [
    ['Specimens', 'Ø 20 × 15 mm, numbered 1–7', 'Same heat of steel'],
    ['Muffle furnaces', 'To 1000 °C ± 5 °C', 'Hardening and tempering'],
    ['Quench tanks', 'Water 25 °C; quench oil 60 °C', 'Agitated'],
    ['Vickers tester', 'HV 10', 'Three readings each']] };

  S.xrd = {
    haz: ['Ionising X-radiation from the tube.', 'High voltage (40 kV).', 'Fine powders may be harmful if inhaled.'],
    ppe: ['Personal dosimeter', 'Gloves and mask when handling fine powders'],
    rules: ['Never defeat the door interlock.', 'Close the shutter before opening the enclosure.', 'Ramp voltage and current slowly.', 'Only trained users operate the instrument.'],
    emerg: ['Press the X-ray OFF / emergency stop.', 'Report any suspected exposure to the radiation safety officer.'] };
  L.xrd = { cols: LIB_COLS, rows: [
    ['X-ray tube', 'Cu target, 40 kV, 30 mA', 'Ni filter / Kα₂ stripping'],
    ['Sample holder', 'Zero-background Si', 'Back-loaded powder'],
    ['Detector', 'Scintillation or 1D strip', '—'],
    ['Standard', 'NIST SRM 640 silicon', 'Instrumental broadening']] };

  S.sem = {
    haz: ['High voltage (up to 30 kV).', 'Low-level X-rays generated in the chamber (shielded).', 'Liquid nitrogen for some EDS detectors.'],
    ppe: ['Powder-free gloves when handling stubs', 'Cryogenic gloves for liquid nitrogen'],
    rules: ['Vent the chamber only with the beam off.', 'Check specimen height before moving the stage to avoid hitting the detectors.', 'Never touch fracture surfaces.'],
    emerg: ['Switch off the high voltage.', 'Report vacuum faults to the facility in-charge.'] };
  L.sem = { cols: LIB_COLS, rows: [
    ['SEM', 'W or FEG source, 1–30 kV', 'SE and BSE detectors'],
    ['EDS detector', 'Silicon drift, 129 eV at Mn Kα', 'Standardless quantification'],
    ['Specimen stubs', 'Al, 12.5 mm', 'Carbon tape'],
    ['Sputter coater', 'Au or C', 'Only for non-conducting samples']] };
})();
