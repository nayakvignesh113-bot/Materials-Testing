/* Narrated explainers with concept checks (Theory tab).
   EXPL[id].scenes = [{ title, lines: [[narration, cue]], q: {q, o, a, why} }]
   Cue: {s:k} animates set-up step k (earlier steps shown complete); {r:[a,b]} plays the test from fraction a to b;
        null keeps the previous picture. Audio: audio/<id>/x<scene>_<line>.mp3 and audio/<id>/xq<scene>.mp3.
   Concept checks are written to differ from the pre-test and post-test questions. */
(function () {
  const X = (LAB.EXPL = {});
  X.tensile = { scenes: [
    { title: 'Preparing the specimen', lines: [
      ['A tensile test tells us how strong, how stiff and how ductile a metal is, all from one round bar pulled until it breaks.', { s: 0 }],
      ['First the diameter is measured with a micrometer at three places. The smallest cross-section carries the highest stress, so the average must be accurate.', { s: 0 }],
      ['Two light punch marks define the gauge length. In the Indian standard it is five point six five times the square root of the area, so that bars of any size give comparable elongation.', { s: 1 }],
      ['The bar goes into wedge grips that bite harder as the pull increases, and the extensometer is clipped across the gauge marks.', { s: 4 }]],
      q: { q: 'Why is the gauge length made proportional to the square root of the cross-sectional area?', o: ['So that the specimen fits the grips', 'So that elongation results from different specimen sizes can be compared', 'So that the load cell is not overloaded', 'So that the specimen breaks in the middle'], a: 1, why: 'Necking adds a fixed local extension that depends on the diameter. Scaling the gauge length with the size keeps the percentage elongation comparable between large and small bars.' } },
    { title: 'Elastic stretch and yielding', lines: [
      ['The crosshead now moves at a steady speed. At first load rises in a straight line with extension. Remove the load here and the bar returns to its original length.', { r: [0, 0.07] }],
      ['The slope of this straight part, converted to stress and strain, is the modulus of elasticity. For steel it is about two hundred gigapascals.', { r: [0.07, 0.1] }],
      ['Mild steel then shows a sudden drop in load: the upper and lower yield points. A band of plastic flow runs along the bar while the load stays almost constant.', { r: [0.1, 0.2] }]],
      q: { q: 'During the nearly flat portion just after the load drop in mild steel, what is happening in the specimen?', o: ['The specimen is still elastic', 'A band of plastic deformation is spreading along the gauge length', 'The extensometer is slipping', 'The neck is forming'], a: 1, why: 'Dislocations break free from carbon and nitrogen atmospheres and a Lüders band sweeps along the bar at almost constant load before uniform strain hardening begins.' } },
    { title: 'Hardening, necking and fracture', lines: [
      ['Beyond yield the metal strain-hardens: it gets stronger as it stretches, so the load keeps rising, but more slowly.', { r: [0.2, 0.55] }],
      ['At the maximum load the hardening can no longer make up for the shrinking area. A neck forms and all further stretching happens there.', { r: [0.55, 0.85] }],
      ['The load falls until the bar breaks in a cup-and-cone fracture. The broken halves are fitted together to measure the final length and the neck diameter.', { r: [0.85, 1] }]],
      q: { q: 'What does the maximum load on the curve correspond to?', o: ['The yield strength', 'The start of necking, which gives the ultimate tensile strength', 'The fracture stress', 'The proportional limit'], a: 1, why: 'Maximum load divided by the original area is the ultimate tensile strength. It marks the onset of necking, where strain hardening is overtaken by the loss of area.' } }
  ] };
  X.compression = { scenes: [
    { title: 'Setting up a short specimen', lines: [
      ['In a compression test a short specimen is squeezed between two flat platens. We measure its height and diameter with a vernier calliper.', { s: 0 }],
      ['The specimen is kept short, with height about one to two times the diameter, so that it crushes or flows instead of buckling sideways like a long column.', { s: 0 }],
      ['The platens are cleaned. Any friction at these faces will restrain the ends of a ductile specimen, so for some tests they are lubricated.', { s: 1 }],
      ['The specimen sits centrally on the lower platen. For brittle cast iron a guard is closed, because the pieces can fly out at fracture.', { s: 3 }]],
      q: { q: 'Why is a safety guard essential when compressing grey cast iron?', o: ['Cast iron is magnetic', 'It fails suddenly and fragments can be ejected', 'It produces toxic fumes', 'It heats up strongly'], a: 1, why: 'Brittle materials store elastic energy and release it at fracture, throwing fragments outwards. Ductile metals simply flatten and barrel.' } },
    { title: 'Loading', lines: [
      ['The upper platen comes down at a steady rate. Load rises linearly at first, and the compressometer gives the elastic modulus.', { r: [0, 0.3] }],
      ['A brittle material keeps carrying load with only tiny deformation, then cracks suddenly along an inclined plane.', { r: [0.3, 0.8] }],
      ['A ductile metal would instead yield and keep flowing, so its test is stopped at a set reduction in height rather than at fracture.', { r: [0.8, 1] }]],
      q: { q: 'Why is a ductile metal compression test usually stopped at a fixed height reduction?', o: ['Because the load cell is too small', 'Because it does not fracture; it keeps flattening', 'Because the platens wear out', 'Because barrelling makes the specimen hotter'], a: 1, why: 'A ductile cylinder spreads and barrels indefinitely without breaking, so there is no fracture point to end the test.' } },
    { title: 'Reading the result', lines: [
      ['For cast iron, the maximum load divided by the original area gives the compressive strength, three to four times its tensile strength.', null],
      ['The fracture plane runs at about forty five to fifty five degrees to the load, showing that shear, aided by internal friction, controls failure.', null],
      ['For timber the direction matters: along the grain the fibres act as columns, across the grain the cells collapse gradually.', null]],
      q: { q: 'Graphite flakes weaken cast iron in tension. Why do they matter much less in compression?', o: ['They dissolve under pressure', 'Compressive stress closes the flakes so they cannot open as cracks', 'They are harder than iron', 'They align with the load'], a: 1, why: 'Flakes act as sharp cracks only when tension opens them. In compression their faces are pressed together and the matrix carries the load.' } }
  ] };
  X.shear = { scenes: [
    { title: 'The shear fixture', lines: [
      ['Pins, rivets and keys fail by being sliced across their section. The shear test reproduces this with a round bar in a fixture.', { s: 0 }],
      ['The diameter is measured at the planes where the bar will be cut, because the shear area is calculated from it.', { s: 0 }],
      ['In double shear the bar passes through two outer blocks and a central blade. Pushing the blade down cuts the bar on two planes at once.', { s: 1 }]],
      q: { q: 'In double shear, the maximum load is divided by which area to get the shear strength?', o: ['The area of one cross-section', 'Twice the cross-sectional area', 'The curved surface area of the bar', 'Half the cross-sectional area'], a: 1, why: 'The bar is cut on two planes, so two cross-sections share the load. τ = P / (2 × πd²/4).' } },
    { title: 'Shearing three specimens', lines: [
      ['The central blade is pushed down at a slow, steady rate. At first the bar bears against the blade edges and bends slightly.', { r: [0, 0.15] }],
      ['Then plastic shearing spreads across the section until the bar separates. The machine records the maximum load.', { r: [0.15, 0.33] }],
      ['Three bars are tested, because each result scatters with small differences in diameter, hardness and fixture clearance.', { r: [0.33, 1] }]],
      q: { q: 'Why are three specimens tested and reported with a standard deviation?', o: ['To use up spare material', 'To estimate the scatter and give a reliable mean', 'Because the standard requires an odd number', 'To check the load cell'], a: 1, why: 'Individual results vary. The mean of three, with its standard deviation, shows both the strength and how repeatable the test was.' } },
    { title: 'What the number means', lines: [
      ['For ductile metals the shear strength is typically sixty to eighty percent of the tensile strength.', null],
      ['Yield criteria predict half or about fifty eight percent at first yield. The measured ratio is higher because the metal work-hardens before it separates.', null]],
      q: { q: 'A designer has only tensile data for a pin material. A reasonable estimate of its ultimate shear strength is', o: ['Twice the tensile strength', 'About 0.6 to 0.8 of the tensile strength', 'Equal to the hardness', 'One tenth of the tensile strength'], a: 1, why: 'Measured τ/σu ratios for ductile metals fall in this range, which is why it is a common design rule.' } }
  ] };
  X.torsion = { scenes: [
    { title: 'Preparing the bar', lines: [
      ['Shafts, axles and springs carry torque. The torsion test twists a round bar and records torque against the angle of twist.', { s: 0 }],
      ['A straight line is scribed along the bar. As the bar twists, this line turns into a helix, which shows the shear strain at the surface.', { s: 1 }],
      ['Both ends are clamped in chucks, and a troptometer is fixed over a known gauge length to measure the small elastic twist.', { s: 3 }]],
      q: { q: 'What does the scribed straight line turn into as the bar is twisted?', o: ['A circle', 'A helix whose angle shows the surface shear strain', 'A wavy line showing vibration', 'It stays straight'], a: 1, why: 'Each cross-section rotates more than the one before it, so the line winds round the bar. The helix angle equals the shear strain γ = rθ/L.' } },
    { title: 'Elastic and plastic twisting', lines: [
      ['Torque first rises in proportion to twist. From this slope and the polar moment of inertia we get the modulus of rigidity.', { r: [0, 0.12] }],
      ['Shear stress is highest at the surface, so the outer fibres yield first while the core stays elastic. The curve bends over.', { r: [0.12, 0.45] }],
      ['As twisting continues the plastic zone spreads inwards. There is no necking in torsion, so the bar can be twisted through many turns.', { r: [0.45, 0.95] }]],
      q: { q: 'Where does yielding begin in a solid round bar under torque?', o: ['At the centre', 'At the outer surface', 'Uniformly across the section', 'At the chuck faces'], a: 1, why: 'Shear stress is proportional to radius, τ = Tρ/J, so it reaches the yield stress first at the surface.' } },
    { title: 'Fracture tells the material', lines: [
      ['A ductile steel bar finally breaks on a flat plane across the axis, the plane of maximum shear stress.', { r: [0.95, 1] }],
      ['A brittle cast iron bar instead breaks on a forty five degree helix, normal to the maximum tensile stress. You can see the same with a piece of chalk.', null]],
      q: { q: 'A twisted specimen breaks on a 45° helical surface. What does that tell you?', o: ['The material failed in shear and is ductile', 'The material failed by tension and is brittle', 'The machine was misaligned', 'The specimen was too long'], a: 1, why: 'In pure shear the principal tensile stress acts at 45°. Brittle materials fail normal to it, producing the helix.' } }
  ] };
  X.bending = { scenes: [
    { title: 'Setting up the beam', lines: [
      ['A beam under load bends: its top fibres shorten and its bottom fibres stretch. Measuring the deflection lets us find Young’s modulus.', { s: 0 }],
      ['The width and especially the depth are measured carefully, because stiffness depends on the cube of the depth.', { s: 0 }],
      ['The beam rests on knife edges a known span apart, and a load hanger is placed exactly at mid-span.', { s: 3 }],
      ['A dial gauge touches the beam at the load point and is set to zero.', { s: 4 }]],
      q: { q: 'If you rotated a rectangular beam so that its depth doubled and its width halved, how would its stiffness change?', o: ['It would halve', 'It would stay the same', 'It would become four times greater', 'It would double'], a: 2, why: 'I = bh³/12. Halving b and doubling h multiplies I by ½ × 8 = 4, so deflection under the same load is a quarter.' } },
    { title: 'Loading and unloading', lines: [
      ['Weights are added in equal steps. After each step the dial is read once the needle settles.', { r: [0, 0.5] }],
      ['Then the weights are removed in the same steps. If the readings return along the same line and the dial goes back to zero, the beam stayed elastic.', { r: [0.5, 1] }]],
      q: { q: 'Why are readings also taken while unloading?', o: ['To double the number of data points', 'To confirm the beam behaved elastically and to reveal support friction', 'Because loading readings are inaccurate', 'To measure the yield point'], a: 1, why: 'Matching loading and unloading readings show reversible, elastic behaviour; a gap shows friction, settlement or yielding.' } },
    { title: 'Getting Young’s modulus', lines: [
      ['For a central load on a simple span, deflection equals P L cubed over forty eight E I. Rearranging gives E from the slope of load against deflection.', null],
      ['A cantilever deflects sixteen times more for the same load and length, because the formula has three instead of forty eight in the denominator.', null]],
      q: { q: 'Doubling the span of a simply supported beam under the same central load multiplies the deflection by', o: ['2', '4', '8', '16'], a: 2, why: 'Deflection is proportional to L³, so 2³ = 8.' } }
  ] };
  X.impact = { scenes: [
    { title: 'Before the swing', lines: [
      ['The impact test measures the energy a notched bar absorbs when it is broken by a swinging pendulum at high speed.', { s: 0 }],
      ['The notch is checked with a gauge, because its depth and root radius strongly affect the result.', { s: 0 }],
      ['First the pendulum is released with no specimen. It does not quite rise to its starting height. That small loss is friction and air drag, and it is subtracted later.', { s: 1 }],
      ['For a Charpy temperature sweep each bar is soaked in a bath at its test temperature, then placed on the anvils within five seconds.', { s: 3 }]],
      q: { q: 'What is the free swing without a specimen used for?', o: ['To warm up the bearings', 'To measure the energy lost to friction and air resistance', 'To check the notch', 'To calibrate the thermometer'], a: 1, why: 'The free-swing rise angle β₀ gives the friction loss, so the specimen energy is WR(cos β − cos β₀).' } },
    { title: 'Breaking the bars', lines: [
      ['The pendulum is released. At the bottom of its swing it strikes the bar behind the notch and carries on upwards.', { r: [0, 0.07] }],
      ['The more energy the bar absorbs, the lower the pendulum rises on the far side. The dial converts the rise angle into joules.', { r: [0.07, 0.14] }],
      ['Bars tested at low temperature break with little energy and a bright, flat surface. Warmer bars absorb much more and break with a dull, fibrous surface.', { r: [0.14, 1] }]],
      q: { q: 'A pendulum rises almost to its release height after striking a bar. What does that mean?', o: ['The bar absorbed a lot of energy', 'The bar absorbed very little energy and was brittle', 'The pendulum was not released properly', 'The bar was not notched'], a: 1, why: 'Energy absorbed is the loss of pendulum potential energy. A high rise means little energy was used to break the bar.' } },
    { title: 'The transition curve', lines: [
      ['Plotting energy against temperature gives an S-shaped curve with an upper shelf, a lower shelf and a transition region between them.', null],
      ['Ferritic steels show this transition; aluminium, copper and austenitic stainless steel do not. Engineers choose steels whose transition lies well below the service temperature.', null]],
      q: { q: 'A ship steel has a transition temperature of +10 °C. What does this mean for service in winter seas at 0 °C?', o: ['No concern, it is close to 10 °C', 'It may fracture in a brittle manner, so a tougher steel is needed', 'It will become more ductile', 'It will creep'], a: 1, why: 'Below its transition temperature the steel absorbs little energy and can crack catastrophically, as in the Liberty ship failures.' } }
  ] };
  X.fatigue = { scenes: [
    { title: 'Setting up the rotating beam', lines: [
      ['Most machine parts that fail in service fail by fatigue: repeated stress well below the static strength.', { s: 0 }],
      ['The hourglass specimen is measured at its narrowest point, where the stress is highest, and mounted in collets.', { s: 1 }],
      ['A dead weight hangs from the specimen, so it acts as a beam under a constant bending moment.', { s: 2 }]],
      q: { q: 'Why is the specimen given an hourglass shape?', o: ['To make it lighter', 'To make sure the highest stress and failure occur in a known, polished region', 'To fit the collets', 'To reduce vibration'], a: 1, why: 'The minimum section carries the maximum bending stress, so the crack starts there rather than at the grips.' } },
    { title: 'Cycling to failure', lines: [
      ['The motor turns the specimen at four thousand five hundred revolutions per minute. Each point on the surface goes from tension to compression and back in every turn.', { r: [0, 0.06] }],
      ['A tiny crack starts at the surface, grows a little each cycle, and finally the remaining section snaps. The counter stops at fracture.', { r: [0.06, 0.25] }],
      ['Lower loads give longer lives. Below a certain stress, steel specimens survive ten million cycles: these are run-outs.', { r: [0.25, 1] }]],
      q: { q: 'In a rotating-beam test, how often does a surface point go through a full stress cycle?', o: ['Once per minute', 'Once per revolution', 'Only when the load is changed', 'Twice per revolution'], a: 1, why: 'As the bar rotates under constant bending, each surface point passes through the tension and compression sides once per turn: R = −1.' } },
    { title: 'The S–N curve', lines: [
      ['Stress amplitude is plotted against cycles to failure on a logarithmic scale. The sloping part follows Basquin’s law.', null],
      ['For steels the curve flattens into an endurance limit, about half the tensile strength. Aluminium alloys keep falling, so designers quote strength at a stated life.', null]],
      q: { q: 'An aluminium bracket must last 10⁹ cycles. What can you say about its fatigue design?', o: ['Use the endurance limit; it lasts forever below it', 'Aluminium has no true endurance limit, so a strength for that specific life must be used', 'Fatigue does not affect aluminium', 'Use the yield strength'], a: 1, why: 'Non-ferrous alloys show a continuously falling S–N curve, so there is no stress below which life is infinite.' } }
  ] };
  X.creep = { scenes: [
    { title: 'Constant load at temperature', lines: [
      ['Creep is slow, continuing deformation under a constant load at high temperature. It limits turbine blades, boiler tubes and solder joints.', { s: 0 }],
      ['Lead melts at only three hundred and twenty seven degrees, so room temperature is already half its absolute melting point. It creeps within an hour.', { s: 1 }],
      ['Three wires are soaked at the test temperature, then dead weights are hung gently to give three different stresses.', { s: 3 }]],
      q: { q: 'Why can lead be creep-tested in a teaching lab at room temperature?', o: ['Lead is very soft', 'Room temperature is already about half of lead’s absolute melting temperature', 'Lead has no elastic region', 'Lead is a liquid'], a: 1, why: 'Creep becomes significant above about 0.4 T_m in kelvin. For lead, 298 K / 600 K ≈ 0.5.' } },
    { title: 'Three stages of creep', lines: [
      ['After the instantaneous stretch, the strain rate falls: this is primary creep, as the metal work-hardens.', { r: [0, 0.2] }],
      ['Then hardening and recovery balance and the rate stays steady. This secondary, minimum creep rate is what designers use.', { r: [0.2, 0.7] }],
      ['Finally the wire necks and internal cavities grow. The rate accelerates in tertiary creep until rupture.', { r: [0.7, 1] }]],
      q: { q: 'Which creep stage gives the value used for design?', o: ['Primary', 'Secondary, at the minimum steady rate', 'Tertiary', 'The instantaneous strain'], a: 1, why: 'The steady-state rate is reproducible and governs most of the service life.' } },
    { title: 'Stress dependence', lines: [
      ['Higher stress gives a much faster minimum creep rate. On log–log axes the rate rises in a straight line with stress; the slope is the Norton exponent.', null],
      ['An exponent of four to eight tells us that dislocations are climbing past obstacles. Rupture times at different temperatures can be combined using the Larson–Miller parameter.', null]],
      q: { q: 'If the Norton exponent is 5, what happens to the minimum creep rate when stress is increased by 20%?', o: ['It rises by 20%', 'It roughly doubles to 2.5 times', 'It falls', 'It rises by 5%'], a: 1, why: '1.2⁵ ≈ 2.49. Creep is very sensitive to stress.' } }
  ] };
  X.brinell = { scenes: [
    { title: 'Ball and load', lines: [
      ['Hardness is resistance to permanent indentation. In the Brinell test a hard ball is pressed into the surface.', { s: 0 }],
      ['The surface is ground flat and clean so that the impression is round and its edge is easy to see.', { s: 0 }],
      ['The ball diameter and load are chosen from a force–diameter ratio: thirty for steel, ten for copper alloys, five for soft metals.', { s: 1 }]],
      q: { q: 'Why is a lower force–diameter ratio used for soft copper than for steel?', o: ['Copper is lighter', 'With the steel ratio the impression in soft copper would be too large to be valid', 'Copper damages the ball', 'To save time'], a: 1, why: 'The impression diameter must lie between 0.24 and 0.6 of the ball diameter. A soft metal under the steel load would exceed 0.6D.' } },
    { title: 'Making the impression', lines: [
      ['The specimen is raised to touch the ball, the full load is applied smoothly and held for ten to fifteen seconds.', { r: [0, 0.3] }],
      ['After unloading, the impression diameter is measured in two directions with a microscope, and the process is repeated at fresh positions.', { r: [0.3, 1] }]],
      q: { q: 'Why is the load held for a dwell time instead of being removed at once?', o: ['To let the machine cool', 'To let plastic flow under the ball finish so the impression size is stable', 'To heat the specimen', 'To reduce friction'], a: 1, why: 'Metals keep flowing for a short time under load. A fixed dwell makes results repeatable.' } },
    { title: 'From diameter to hardness', lines: [
      ['Brinell hardness is the load divided by the curved area of the impression. A smaller impression means a harder metal.', null],
      ['For steels, the tensile strength in megapascals is roughly three point four five times the Brinell number, which is why hardness is such a useful quality check.', null]],
      q: { q: 'Two steel parts read 150 HB and 300 HB. Roughly what tensile strengths would you expect?', o: ['150 and 300 MPa', 'About 520 and 1035 MPa', 'About 50 and 100 MPa', 'Hardness cannot indicate strength'], a: 1, why: 'σu ≈ 3.45 × HB for steels gives about 518 and 1035 MPa.' } }
  ] };
  X.rockwell = { scenes: [
    { title: 'A depth-based test', lines: [
      ['The Rockwell test reads hardness directly from a dial, by measuring how deep the indenter sinks.', { s: 0 }],
      ['The machine is first checked on a certified test block of known hardness.', { s: 0 }],
      ['A minor load of ten kilograms seats the indenter and sets the zero, so surface roughness and machine slack do not affect the reading.', { s: 2 }]],
      q: { q: 'What is the main purpose of the minor load?', o: ['To harden the surface', 'To give a reference depth that excludes surface roughness and machine slack', 'To measure elastic recovery', 'To heat the specimen'], a: 1, why: 'Depth is measured from the position under the minor load, not from the untouched surface.' } },
    { title: 'Major load and reading', lines: [
      ['The major load pushes the indenter deeper. After a short dwell it is removed, leaving the minor load on.', { r: [0, 0.4] }],
      ['The elastic part of the deformation springs back. The permanent extra depth is what the dial shows: every two micrometres is one Rockwell unit.', { r: [0.4, 1] }]],
      q: { q: 'A deeper permanent indentation on the same scale gives', o: ['A higher Rockwell number', 'A lower Rockwell number', 'The same number', 'An invalid test'], a: 1, why: 'HR = N − e/0.002. More depth e means a softer material and a smaller number.' } },
    { title: 'Choosing the scale', lines: [
      ['Hardened steel uses the C scale with a diamond cone. Soft steel, brass and aluminium use the B scale with a small steel ball.', null],
      ['A reading below twenty or above the scale limit means the wrong scale was chosen, and the test must be repeated.', null]],
      q: { q: 'A brass part reads 112 on the B scale. What should you do?', o: ['Report 112 HRB', 'Change to a harder scale such as C or A, because the reading is above the B limit', 'Use a larger ball', 'Ignore it'], a: 1, why: 'HRB is valid only up to 100. Above that the ball may flatten and sensitivity is lost.' } }
  ] };
  X.vickers = { scenes: [
    { title: 'Diamond pyramid', lines: [
      ['The Vickers test uses a square-based diamond pyramid. Because the pyramid is self-similar, impressions at every load are the same shape.', { s: 0 }],
      ['The specimen must be polished, because the impression may be only a few tens of micrometres across.', { s: 1 }],
      ['A load is chosen, from a few grams for thin layers to thirty kilograms for bulk metal.', { s: 2 }]],
      q: { q: 'Why can one Vickers scale cover everything from lead to tungsten carbide?', o: ['The load is always the same', 'The diamond does not deform and impressions are geometrically similar at all loads', 'It measures depth, not area', 'It uses several indenters'], a: 1, why: 'A rigid self-similar indenter gives the same shape at every size, so HV does not depend on load in principle.' } },
    { title: 'Indent and measure', lines: [
      ['The diamond is pressed in for ten to fifteen seconds, then the objective swings back over the mark.', { r: [0, 0.4] }],
      ['Both diagonals are measured with a filar eyepiece and averaged. Hardness is one point eight five four four times the load over the diagonal squared.', { r: [0.4, 1] }]],
      q: { q: 'The two diagonals of an impression differ by 10%. What is the most likely cause?', o: ['The material is very hard', 'The specimen surface is tilted relative to the indenter', 'The load was too high', 'Normal behaviour'], a: 1, why: 'A tilted surface distorts the square. Standards reject impressions with large asymmetry.' } },
    { title: 'Small loads and case depth', lines: [
      ['At very small loads many metals appear harder: the indentation size effect. That is why the load is always quoted with the result.', null],
      ['A row of micro-indentations from the surface inwards maps how hardness falls through a carburised case. The depth where it reaches five hundred and fifty is the effective case depth.', null]],
      q: { q: 'Why is the load always quoted with a Vickers result, for example HV 0.5 or HV 10?', o: ['For record keeping only', 'Because at low loads measured hardness can be higher, so results are comparable only at stated loads', 'Because HV changes with temperature', 'It is not needed'], a: 1, why: 'The indentation size effect makes micro-loads read higher than macro-loads for many metals.' } }
  ] };
  X.wear = { scenes: [
    { title: 'Pin, disc and load', lines: [
      ['Wear is the gradual loss of material from sliding surfaces. In the pin-on-disc test a stationary pin rubs on a rotating hardened disc.', { s: 0 }],
      ['The pin is cleaned and weighed to a tenth of a milligram, because the mass loss may be only a few milligrams.', { s: 0 }],
      ['It is clamped square to the disc, a dead weight sets the normal load, and the disc speed is set for the chosen sliding velocity.', { s: 3 }]],
      q: { q: 'Why must the pin face be square to the disc?', o: ['To look neat', 'So that the load spreads over the whole face instead of a single edge', 'To reduce noise', 'To increase friction'], a: 1, why: 'Edge contact concentrates stress and gives high, unrepresentative early wear.' } },
    { title: 'Running-in and steady sliding', lines: [
      ['When sliding starts, the friction coefficient rises to a peak as surface roughness is flattened and debris forms.', { r: [0, 0.3] }],
      ['After this running-in, oxide and transfer layers stabilise and friction settles to a steady value, while the pin shortens at a steady rate.', { r: [0.3, 1] }]],
      q: { q: 'Why should the steady-state friction coefficient be taken from the later part of the test?', o: ['The early data are always wrong', 'Running-in changes the surfaces at first; the later value represents stable sliding', 'Friction is zero at the start', 'To save time'], a: 1, why: 'Running-in is a transient. The steady region reflects the behaviour of the conformed, layered contact.' } },
    { title: 'Archard’s law', lines: [
      ['Mass loss divided by density gives the volume worn. Divide that by load and sliding distance and you get the specific wear rate.', null],
      ['Archard’s law says wear volume rises with load and distance and falls with hardness. Hard particles such as silicon carbide in aluminium reduce wear several times.', null]],
      q: { q: 'Doubling the normal load at the same sliding distance, in the mild wear regime, will roughly', o: ['Halve the wear volume', 'Double the wear volume', 'Leave it unchanged', 'Increase it eight times'], a: 1, why: 'Archard: V = K F s / H, so V is proportional to load as long as the wear regime does not change.' } }
  ] };
  X.ultrasonic = { scenes: [
    { title: 'Probe and couplant', lines: [
      ['Ultrasonic testing sends short pulses of high-frequency sound into a part and listens for echoes from inside.', { s: 0 }],
      ['A normal probe sends a longitudinal wave straight down. The surface is cleaned and a film of couplant is spread on it.', { s: 2 }],
      ['Without couplant, a thin air gap would reflect almost all the sound before it entered the steel.', { s: 3 }]],
      q: { q: 'Why does even a thin air gap block ultrasound?', o: ['Air absorbs all frequencies', 'The acoustic impedance of air is so different from steel that nearly all the sound reflects', 'Air conducts electricity', 'Air vibrates at a different frequency'], a: 1, why: 'Reflection depends on the impedance mismatch; air-to-steel is enormous, so almost nothing is transmitted.' } },
    { title: 'Calibration and scanning', lines: [
      ['On a calibration block of known thickness, back-wall echoes appear at equal intervals. Their spacing gives the sound velocity.', { r: [0, 0.12] }],
      ['The probe is then moved across the test block. Where a flaw lies under the probe, an extra echo appears before the back wall.', { r: [0.12, 0.55] }],
      ['The flaw also shadows the back wall, so the back-wall echo drops while the flaw echo is high.', { r: [0.55, 1] }]],
      q: { q: 'Why is the velocity found from the spacing between back-wall echoes and not from the first echo alone?', o: ['The first echo is too small', 'Fixed delays in the probe and couplant cancel out in the spacing', 'Only the spacing is shown on screen', 'It is faster'], a: 1, why: 'Each echo carries the same fixed delay; subtracting times removes it.' } },
    { title: 'Depth and size', lines: [
      ['Depth equals velocity times the echo time divided by two, because the sound goes down and back.', null],
      ['To size a flaw, move the probe until its echo falls to half of its maximum on each side. Those two points mark the flaw edges: the six decibel drop method.', null]],
      q: { q: 'At the 6 dB drop position, where is the beam axis relative to the flaw?', o: ['Over the flaw centre', 'Over the flaw edge', 'Far outside the flaw', 'Under the probe crystal edge'], a: 1, why: 'When half the beam hits the flaw, the echo amplitude is halved, which is −6 dB.' } }
  ] };
  X.mpi = { scenes: [
    { title: 'Preparing the shaft', lines: [
      ['Magnetic particle inspection finds cracks at or just below the surface of iron and steel parts.', { s: 0 }],
      ['The shaft is cleaned, and the concentration of the particle bath is checked in a settling tube.', { s: 1 }],
      ['The shaft is clamped between the head-stocks, and the field is checked with a pie gauge before inspection.', { s: 3 }]],
      q: { q: 'Why is a pie gauge used before inspection?', o: ['To measure the shaft diameter', 'To confirm the field is strong enough and in the expected direction', 'To demagnetise the part', 'To check the UV lamp'], a: 1, why: 'Its artificial slots show indications only when the surface field is adequate and correctly oriented.' } },
    { title: 'Two directions of field', lines: [
      ['A coil gives a field along the shaft. Cracks running across the shaft cut the flux lines, force flux out into the air, and gather particles.', { r: [0, 0.45] }],
      ['Current passed through the shaft gives a field around it, which reveals cracks running along the shaft.', { r: [0.45, 1] }]],
      q: { q: 'With only a coil shot, which crack is most likely to be missed?', o: ['A transverse fatigue crack at a fillet', 'A longitudinal seam along the shaft', 'A crack at 60° to the axis', 'None'], a: 1, why: 'A longitudinal seam lies parallel to the coil’s field, so it produces almost no leakage.' } },
    { title: 'Reading indications', lines: [
      ['Under ultraviolet light, fluorescent particles glow as sharp green lines over cracks.', null],
      ['Particles also gather at keyways and section changes when the current is too high. These are non-relevant indications and must not be confused with cracks.', null]],
      q: { q: 'An indication follows the edge of a keyway and appears only at high current. It is', o: ['A relevant crack', 'A non-relevant indication from geometry', 'Corrosion', 'A false indication from dirt'], a: 1, why: 'Sharp section changes force flux out even without a defect, especially when the part is over-magnetised.' } }
  ] };
  X.dpt = { scenes: [
    { title: 'Before applying penetrant', lines: [
      ['Dye penetrant testing shows cracks and pores that are open to the surface, on almost any non-porous material.', { s: 0 }],
      ['The surface must be between ten and fifty two degrees and lit with at least a thousand lux.', { s: 1 }],
      ['Cleaner, penetrant and developer must come from the same family, so that they work together.', { s: 2 }]],
      q: { q: 'Why can penetrant testing be used on aluminium and austenitic stainless steel while magnetic particle testing cannot?', o: ['Penetrant is magnetic', 'It relies on capillary action, not magnetism', 'Those metals are harder', 'It uses X-rays'], a: 1, why: 'Only the surface opening and capillary flow matter, so non-magnetic materials can be tested.' } },
    { title: 'The six steps', lines: [
      ['After cleaning, red penetrant covers the weld and is left for the dwell time while capillary action draws it into openings.', { r: [0, 0.3] }],
      ['The excess is wiped off with a dry cloth, then a cloth lightly dampened with remover. Spraying remover directly would wash penetrant out of shallow flaws.', { r: [0.3, 0.42] }],
      ['A thin white developer draws the trapped penetrant back out, and red indications bleed through.', { r: [0.42, 1] }]],
      q: { q: 'What is the role of the white developer?', o: ['To seal the cracks', 'To draw penetrant out of flaws and give a contrasting background', 'To clean the surface', 'To dry the part'], a: 1, why: 'Developer acts like blotting paper and spreads the indication so it can be seen.' } },
    { title: 'Judging indications', lines: [
      ['An indication three or more times as long as it is wide is linear, like a crack. Shorter, rounder ones come from pores.', null],
      ['Under the pressure-vessel code, any relevant linear indication rejects the weld, as do large or aligned pores.', null]],
      q: { q: 'An indication is 5 mm long and 2 mm wide. How is it classified?', o: ['Linear', 'Rounded', 'Non-relevant', 'False'], a: 1, why: '5 < 3 × 2, so it is rounded.' } }
  ] };
  X.specprep = { scenes: [
    { title: 'Cutting without damage', lines: [
      ['To see a microstructure, we need a flat, scratch-free surface that shows the true material, not damage from cutting.', { s: 0 }],
      ['The piece is cut with an abrasive wheel under flooding coolant, because heat could temper or recrystallise the surface.', { s: 1 }],
      ['Small specimens are mounted in resin so they can be held flat during grinding.', { s: 2 }]],
      q: { q: 'Why is coolant flooded over the cut?', o: ['To wash away chips only', 'To stop heat from altering the microstructure near the cut', 'To reduce noise', 'To lubricate the motor'], a: 1, why: 'Frictional heat can temper martensite or recrystallise cold-worked metal, falsifying what you see.' } },
    { title: 'Grinding and polishing', lines: [
      ['Silicon carbide papers are used from coarse to fine. At each step the specimen is turned ninety degrees, so you can see when the old scratches have gone.', { r: [0, 0.6] }],
      ['Diamond or alumina polishing then removes the finest scratches, leaving a mirror surface.', { r: [0.6, 0.85] }]],
      q: { q: 'What goes wrong if you jump from a coarse paper straight to a very fine one?', o: ['Nothing, it saves time', 'Deep scratches from the coarse paper survive into the polished surface', 'The specimen overheats', 'The mount cracks'], a: 1, why: 'Fine abrasive removes metal slowly, so deep damage is not removed in reasonable time.' } },
    { title: 'Etching', lines: [
      ['Finally the surface is etched. Grain boundaries and different phases dissolve at different rates and become visible.', { r: [0.85, 1] }],
      ['Each alloy needs its own etchant and time: nital for steel, Keller’s reagent for aluminium, ferric chloride for brass. Too long darkens and stains the surface.', null]],
      q: { q: 'Why do grain boundaries appear as dark lines after etching?', o: ['They contain carbon', 'They dissolve faster, forming grooves that scatter light away from the objective', 'They are coloured by the etchant', 'They are higher than the grains'], a: 1, why: 'High-energy boundaries are attacked first; the grooves do not reflect light back into the microscope.' } }
  ] };
  X.microstructure = { scenes: [
    { title: 'Using the microscope', lines: [
      ['Metals are opaque, so the metallurgical microscope shines light onto the polished, etched surface and collects the reflection.', { s: 0 }],
      ['The specimen is placed face down on the stage, and we start with the low-power objective to find a representative area.', { s: 2 }]],
      q: { q: 'Why do flat areas of an etched specimen look bright and boundaries look dark?', o: ['Flat areas reflect light back into the objective; grooves scatter it away', 'Boundaries absorb all light', 'The etchant colours the grains', 'The camera adjusts the colour'], a: 0, why: 'Reflected-light contrast comes from how much light returns into the objective.' } },
    { title: 'Focusing in', lines: [
      ['The fine focus brings the structure into view. Light grains are ferrite. Dark, striped colonies are pearlite: alternating plates of ferrite and cementite.', { r: [0, 0.7] }],
      ['At higher magnification the pearlite plates can be resolved; at low magnification they merge into dark patches.', { r: [0.7, 1] }]],
      q: { q: 'At low magnification pearlite looks dark, but at high magnification it shows stripes. Why?', o: ['The etchant changes with magnification', 'Its plates are too fine to resolve at low magnification', 'Pearlite changes phase', 'Lighting changes'], a: 1, why: 'Lamellar spacing is often below one micrometre, so the plates blur into a dark average at low power.' } },
    { title: 'Counting phases', lines: [
      ['The fraction of pearlite in a slowly cooled steel rises with carbon content, following the lever rule.', null],
      ['By laying a grid of points over the image and counting points on pearlite, we estimate its fraction and from that the carbon content.', null]],
      q: { q: 'A slowly cooled plain carbon steel shows about 75% pearlite. Its carbon content is about', o: ['0.2%', '0.4%', '0.6%', '1.2%'], a: 2, why: 'C ≈ 0.022 + 0.748 × 0.75 ≈ 0.58%.' } }
  ] };
  X.grainsize = { scenes: [
    { title: 'Calibration and annealing', lines: [
      ['Grain size controls strength and toughness. Before measuring, the magnification is calibrated with a stage micrometer.', { s: 0 }],
      ['Cold-rolled steel is annealed. New grains form and then grow, faster at higher temperatures.', { s: 1 }]],
      q: { q: 'Why is a stage micrometer used before measuring grain size?', o: ['To focus the microscope', 'To know the true length per division at the specimen, since every length depends on it', 'To etch the specimen', 'To count grains automatically'], a: 1, why: 'An error in magnification gives the same error in every intercept length.' } },
    { title: 'Counting intercepts', lines: [
      ['Test lines of known length are laid across the image, and every crossing with a grain boundary is counted.', { r: [0.6, 0.85] }],
      ['The total line length divided by the number of crossings is the mean intercept length, which converts to the A S T M grain size number.', { r: [0.85, 1] }]],
      q: { q: 'A larger ASTM grain size number means', o: ['Coarser grains', 'Finer grains', 'More twins', 'Larger test lines'], a: 1, why: 'G is defined so that grains per area double for each unit increase.' } },
    { title: 'Why grain size matters', lines: [
      ['Grains can also be counted inside a circle of known area. Both methods should agree within about half a grain size number.', null],
      ['Finer grains raise yield strength according to the Hall–Petch relation, and they also improve toughness.', null]],
      q: { q: 'Which strengthening method improves both strength and low-temperature toughness of steel?', o: ['Cold work', 'Grain refinement', 'Adding carbon', 'Coarsening the grains'], a: 1, why: 'Boundaries block slip and also deflect cleavage cracks, so finer grains help both.' } }
  ] };
  X.jominy = { scenes: [
    { title: 'Getting ready', lines: [
      ['Hardenability is how deep a steel can be hardened by quenching. The Jominy test measures it with one bar.', { s: 0 }],
      ['The water jet height and temperature are checked, because they set the cooling rate.', { s: 1 }],
      ['The bar is heated into the austenite range for thirty minutes.', { s: 2 }]],
      q: { q: 'Why must the water jet height be fixed by the standard?', o: ['To save water', 'It sets the cooling rate at the quenched end, so results are comparable between labs', 'To keep the bar upright', 'To prevent rust'], a: 1, why: 'A different jet changes heat extraction and moves the whole curve.' } },
    { title: 'End quench', lines: [
      ['The bar is moved to the fixture within five seconds and water sprays only on the bottom end.', { r: [0, 0.2] }],
      ['The quenched end cools in seconds. Further up, cooling is slower and slower; the top cools almost like air.', { r: [0.2, 0.7] }]],
      q: { q: 'Why does one Jominy bar represent many different quench rates?', o: ['It is made of several steels', 'Cooling rate falls continuously with distance from the quenched end', 'The water temperature changes', 'It is quenched several times'], a: 1, why: 'Heat flows to the water end, so each position has its own cooling history.' } },
    { title: 'Reading the curve', lines: [
      ['Hardness is measured along ground flats. Near the quenched end it is martensite and hard; further away it falls.', { r: [0.7, 1] }],
      ['Carbon sets the maximum hardness. Alloying elements such as chromium and molybdenum keep the curve high much further along.', null]],
      q: { q: 'Two steels have the same carbon but one has chromium and molybdenum. How do their Jominy curves differ?', o: ['The alloy steel is softer at the end', 'Same hardness at the quenched end, but the alloy steel stays hard further along', 'The plain steel stays hard longer', 'They are identical'], a: 1, why: 'Carbon controls martensite hardness; alloying delays transformation and raises hardenability.' } }
  ] };
  X.heattreat = { scenes: [
    { title: 'Same steel, different cooling', lines: [
      ['Seven specimens of the same steel are numbered and heated together above the upper critical temperature.', { s: 0 }],
      ['At this temperature the steel is austenite, with all carbon dissolved.', { s: 2 }],
      ['What happens next depends only on how fast each one cools.', { s: 3 }]],
      q: { q: 'Why are all seven specimens heated together to the same temperature?', o: ['To save electricity', 'So that the only variable between them is the cooling route', 'Because the furnace is large', 'To check the thermocouple'], a: 1, why: 'Keeping austenitising identical isolates the effect of cooling and tempering.' } },
    { title: 'Cooling routes', lines: [
      ['Cooled in the furnace, it forms soft coarse pearlite: annealed. Cooled in air, finer and harder pearlite: normalised.', { r: [0, 0.3] }],
      ['Quenched in water, there is no time for carbon to diffuse, and hard martensite forms. Oil is slower and gives a mixed structure.', { r: [0.3, 0.6] }],
      ['Tempering the quenched steel at two, four and six hundred degrees trades hardness for toughness.', { r: [0.6, 1] }]],
      q: { q: 'Why is martensite so hard?', o: ['It has large grains', 'Carbon is trapped in a distorted crystal lattice that blocks dislocation movement', 'It contains graphite', 'It is very pure iron'], a: 1, why: 'Rapid cooling traps carbon in a strained body-centred tetragonal lattice.' } },
    { title: 'Time and temperature', lines: [
      ['Hardness falls steadily as the tempering parameter rises. Temperature and time act together, combined in the Hollomon–Jaffe parameter.', null],
      ['So a longer time at a lower temperature can give the same result as a short time at a higher one.', null]],
      q: { q: 'A part must not be tempered above 550 °C, but the specification was written for 600 °C for 1 hour. What should you do?', o: ['Temper at 550 °C for 1 hour', 'Temper at 550 °C for a longer time that gives the same Hollomon–Jaffe parameter', 'Skip tempering', 'Quench again'], a: 1, why: 'Equal P = T(20 + log t) gives similar hardness, about 16 hours at 550 °C here.' } }
  ] };
  X.xrd = { scenes: [
    { title: 'The diffractometer', lines: [
      ['X-ray diffraction reveals the crystal structure. X-rays have a wavelength similar to the spacing between atomic planes.', { s: 0 }],
      ['The powder is pressed flat so that the surface sits exactly on the focusing circle of the goniometer.', { s: 1 }],
      ['The enclosure is closed and the tube is ramped up to forty kilovolts and thirty milliamps.', { s: 2 }]],
      q: { q: 'Why must the powder surface be flat and at the right height?', o: ['To stop the powder falling out', 'Any height error shifts all the peak positions', 'To increase intensity only', 'To cool the sample'], a: 1, why: 'Displacement from the focusing circle changes the measured 2θ and therefore the d-spacings.' } },
    { title: 'Scanning two theta', lines: [
      ['The tube and detector sweep together through increasing angles.', { r: [0, 0.3] }],
      ['At angles where Bragg’s law is satisfied, waves from successive planes add up and a sharp peak appears.', { r: [0.3, 0.7] }],
      ['Each peak belongs to one family of planes. Some families are missing because of the crystal’s symmetry.', { r: [0.7, 1] }]],
      q: { q: 'In a BCC metal, why is there no (100) peak?', o: ['It is too weak to detect', 'Atoms at the cell centre scatter exactly out of phase and cancel it', 'It lies below 20°', 'It overlaps another peak'], a: 1, why: 'For BCC the structure factor is zero when h + k + l is odd.' } },
    { title: 'From peaks to structure', lines: [
      ['The ratios of sine squared theta for successive peaks identify the lattice: for B C C they go one, two, three, four.', null],
      ['The highest angle peak gives the most accurate lattice parameter, and the peak width tells us the crystallite size.', null]],
      q: { q: 'Why does a ball-milled powder give broader peaks than an annealed one?', o: ['It is amorphous', 'Its crystallites are much smaller and strained', 'It has a larger lattice parameter', 'The X-ray tube changed'], a: 1, why: 'Small crystallites and microstrain both broaden diffraction peaks.' } }
  ] };
  X.sem = { scenes: [
    { title: 'Loading the specimen', lines: [
      ['A scanning electron microscope builds an image by scanning a fine electron beam over the surface.', { s: 0 }],
      ['The fracture surface is mounted on a stub with carbon tape and never touched, because fine features are easily damaged.', { s: 0 }],
      ['The chamber is closed and pumped to high vacuum, since electrons would be scattered by air.', { s: 1 }]],
      q: { q: 'Why must the SEM chamber be under vacuum?', o: ['To cool the specimen', 'Electrons would be scattered by gas molecules', 'To prevent X-rays escaping', 'To keep dust off'], a: 1, why: 'The electron beam needs a clear path to stay focused on the specimen.' } },
    { title: 'Imaging the fracture', lines: [
      ['Secondary electrons from the surface give a picture with great depth of field, ideal for rough fractures.', { r: [0, 0.35] }],
      ['Dimples mean ductile tearing. Flat facets with river lines mean brittle cleavage. Grain-shaped facets mean failure along the boundaries. Fine parallel lines mean fatigue.', { r: [0.35, 0.6] }]],
      q: { q: 'A fracture surface is covered with small cup-shaped dimples. What does that indicate?', o: ['Brittle cleavage', 'Ductile overload by microvoid coalescence', 'Fatigue', 'Corrosion'], a: 1, why: 'Voids nucleate at particles, grow and link, leaving dimples on both halves.' } },
    { title: 'Chemical analysis', lines: [
      ['The beam also excites X-rays with energies that are characteristic of each element.', { r: [0.6, 1] }],
      ['The EDS detector sorts them by energy. Iron shows a peak at six point four kilo electron volts, copper at eight point zero five. Peak sizes give an estimate of composition.', null]],
      q: { q: 'How does EDS tell which elements are present?', o: ['From image brightness', 'From the energies of the characteristic X-ray peaks', 'From the vacuum level', 'From the magnification'], a: 1, why: 'Each element emits X-rays at its own fixed energies, set by its electron shell structure.' } }
  ] };
})();
