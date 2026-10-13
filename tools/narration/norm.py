# Turns formulas, symbols, units and abbreviations in the lab text into speakable English for the TTS voice.
# Order matters: exact formula fragments first, then generic symbols, units and abbreviations.
import re

FIX = [
 ('Mean intercept ℓ̄ = L_T/ΣN', 'Mean intercept equals L T over the total number of intercepts'),
 ('n = 2^(G−1)', 'n equals two to the power G minus one'),
 ('10⁻²', 'ten to the minus 2'),
 # tensile
 ('σ = Eε', 'stress equals E times strain'),
 ('R_p0.2', 'R p zero point two'),
 ('σ_t = Kε_t^n', 'true stress equals K times true strain to the power n'),
 ('dσ_t/dε_t = σ_t', 'the slope of the true stress, true strain curve equals the true stress'),
 ('ε_t = n', 'true strain equals n'),
 ('L₀ = 5.65√S₀', 'L nought equals five point six five times the square root of S nought'),
 ('σ ∝ ε̇^m', 'stress proportional to strain rate to the power m'),
 ('ASTM E8/E8M', 'A S T M E 8'),
 ('6–60 MPa/s', '6 to 60 megapascals per second'),
 ('(E)', ''),
 # compression
 ('θ = 45° + φ/2', 'theta equals 45 degrees plus half the friction angle'),
 ('d = d₀√(h₀/h)', 'd equals d nought times the square root of h nought over h'),
 ('aspect ratio d/h', 'aspect ratio d over h'),
 # shear
 ('τ_y = 0.5σ_y', 'shear yield equals half the yield strength'),
 ('τ_y = 0.577σ_y', 'shear yield equals 0.577 times the yield strength'),
 ('f_y/√3', 'f y over root three'),
 # torsion
 ('γ = rθ/L', 'gamma equals r theta over L'),
 ('τ = Gγ', 'shear stress equals G times gamma'),
 ('T–θ', 'torque, twist'),
 ('G = E/(2(1+ν))', 'G equals E over two times one plus Poisson’s ratio'),
 ('T_p = (2/3)πr³τ_y', 'T p equals two thirds pi r cubed times the shear yield stress'),
 ('τ = Tr/J', 'tau equals T r over J'),
 ('4/3', 'four thirds'),
 ('τ = 3T_max/(2πr³)', 'tau equals three T max over two pi r cubed'),
 # bending
 ('1/R = M/(EI)', 'one over R equals M over E I'),
 ('(L/h > 20)', '(span to depth ratio above 20)'),
 ('PL/(κGA)', 'P L over kappa G A'),
 ('(here ≤ 60%)', '(here at most 60 percent of yield)'),
 # impact
 ('β₀ < α', 'beta nought, less than alpha'),
 ('E = WR(cos β − cos β₀)', 'E equals W R times cos beta minus cos beta nought'),
 # fatigue
 ('M = W·a', 'M equals W times a'),
 ('S–N', 'S N'),
 ('(10³–10⁶)', '(ten cubed to ten to the six cycles)'),
 ('σ_a = σ′_f(2N)^b', 'stress amplitude equals sigma f prime times two N to the power b'),
 ('−0.05 to −0.15', 'minus 0.05 to minus 0.15'),
 ('10⁷', 'ten million'), ('10⁹', 'one billion'), ('10⁵ h', 'one hundred thousand hours'),
 ('k_a', 'k a'), ('k_b', 'k b'), ('K_f', 'K f'),
 # creep
 ('LMP = T(C + log t_r)', 'L M P equals T times C plus log t r'),
 ('ε̇_min·t_r', 'minimum creep rate times rupture time'),
 ('(t_r in hours)', '(rupture time in hours)'),
 ('log ε̇', 'log of creep rate'),
 ('(T_m = 456 K)', '(melting point 456 kelvin)'),
 ('0.4 T_m', '0.4 of the melting temperature'), ('0.5 T_m', 'half the melting temperature'), ('0.65 T_m', '0.65 of the melting temperature'),
 ('600 K', '600 kelvin'), ('298 K / 600 K', '298 kelvin over 600 kelvin'),
 # brinell
 ('d/D', 'd over D'), ('F/D²', 'F over D squared'),
 ('0.24D', '0.24 D'), ('0.6D', '0.6 D'), ('0.375D', '0.375 D'),
 ('HM = 4F/(πd²)', 'H M equals four F over pi d squared'),
 ('σ_u (MPa) ≈ 3.45 HB', 'tensile strength in megapascals is about 3.45 times H B'),
 ('2.5d', '2.5 d'), ('3d', '3 d'),
 # rockwell
 ('F₀ = 10 kgf', 'F nought equals 10 kilogram force'),
 ('1/16″', 'one sixteenth inch'), ('1/8″', 'one eighth inch'),
 ('15N, 30T', '15 N, 30 T'),
 # vickers
 ('136°', '136 degrees'),
 ('F = adⁿ', 'F equals a times d to the n'),
 ('n = 2', 'n equals 2'), ('n < 2', 'n less than 2'),
 ('(≈ 5 HV)', '(about 5 H V)'), ('(≈ 1800 HV)', '(about 1800 H V)'),
 # wear
 ('A_r ≈ F_N/H', 'A r is about F N over H'), ('A_r', 'A r'),
 # ultrasonic
 ('Z = ρv', 'Z equals rho v'),
 ('t = 2T/v', 't equals 2 T over v'),
 ('N = D²f/(4v)', 'N equals D squared f over 4 v'),
 ('sin γ = 0.51λ/D', 'sine gamma equals 0.51 lambda over D'),
 ('(−6 dB edge)', '(minus 6 decibel edge)'),
 ('B1 and B3', 'B 1 and B 3'), ('of B1', 'of B 1'),
 # mpi
 ('NI = 35 000/(L/D + 2)', 'N I equals 35000 over L over D plus 2'),
 ('2 ≤ L/D < 15', 'L over D between 2 and 15'),
 ('"furring"', 'furring'),
 # dpt
 ('Δp = 2γ cos θ / w', 'delta p equals 2 gamma cos theta over w'),
 ('≥ 1000 lux', 'at least 1000 lux'), ('UV-A', 'U V A'),
 # microstructure
 ('Ferrite (α)', 'Ferrite, alpha'),
 ('≤ 0.022% C', 'up to 0.022 percent carbon'),
 ('(< 0.77% C)', '(below 0.77 percent carbon)'), ('(> 0.77% C)', '(above 0.77 percent carbon)'),
 ('Al–12% Si (LM6)', 'Aluminium 12 percent silicon, L M 6,'),
 ('α-Al', 'alpha aluminium'), ('Al–Si', 'aluminium silicon'), ('Si forms', 'silicon forms'),
 ('Na or Sr', 'sodium or strontium'),
 ('70/30', '70 30'), ('60/40', '60 40'), ('β′', 'beta prime'),
 ('V_V = P_P', 'V V equals P P'),
 ('√[P(1−P)/n]', 'the square root of P times one minus P over n'),
 ('Al grains', 'aluminium grains'),
 # grain size
 ('100×', '100 times'),
 ('n = 2^(G−1)', 'n equals two to the power G minus one'),
 ('G = 1', 'G equals 1'), ('G = 8', 'G equals 8'),
 ('(ℓ̄ ≈ 254 µm)', '(mean intercept about 254 micrometres)'), ('(ℓ̄ ≈ 22 µm)', '(mean intercept about 22 micrometres)'),
 ('ℓ̄ = L_T/ΣN', 'mean intercept equals L T over the total number of intercepts'),
 ('G = −6.6457 log ℓ̄ − 3.298 (mm)', 'G equals minus 6.6457 log of the mean intercept in millimetres, minus 3.298'),
 ('L_T', 'L T'),
 ('(N_in)', ''), ('(N_int, counted as half)', '(counted as half)'),
 ('N_A = (N_in + 0.5 N_int)/A; G = 3.3219 log N_A − 2.954', 'N A equals the inside count plus half the cut count, over A; then G equals 3.3219 log N A minus 2.954'),
 ('d² − d₀² = K t', 'd squared minus d nought squared equals K t'),
 ('(AlN, Nb(C,N))', '(aluminium nitride and niobium carbonitride)'),
 ('σ₀ ≈ 70 MPa', 'sigma nought is about 70 megapascals'),
 ('k ≈ 0.74 MPa·m½', 'k is about 0.74 megapascal root metres'),
 # jominy / heat treatment
 ('°C/s', ' degrees per second'),
 ('(Mn, Cr, Mo, Ni, B)', '(manganese, chromium, molybdenum, nickel and boron)'),
 ('TTT/CCT', 'T T T and C C T'),
 ('(J₅₀)', '(J 50)'), ('SAE J1268', 'S A E J 1268'),
 ('Ac₃', 'A C 3'), ('A₁', 'A 1'), ('M_s', 'M s'),
 ('~0.01–0.05', 'about 0.01 to 0.05'), ('~1 ', 'about 1 '), ('~20–60', 'about 20 to 60'), ('~100+', 'over 100'),
 ('ε-carbide', 'epsilon carbide'),
 ('1 h at', '1 hour at'), ('10 h at', '10 hours at'),
 ('As-quenched', 'As quenched'),
 # xrd
 ('(Cu Kα: 1.5406 Å)', '(copper K alpha: 1.5406 angstroms)'),
 ('2θ', 'two theta'),
 ('d = a/√N', 'd equals a over root N'),
 ('N = h²+k²+l²', 'N equals h squared plus k squared plus l squared'),
 ('sin²θ = (λ²/4a²)N', 'sine squared theta equals lambda squared over 4 a squared, times N'),
 ('sin²θ', 'sine squared theta'),
 ('F_hkl = Σ f_j exp[2πi(hx_j+ky_j+lz_j)]', 'F h k l, the sum over the atoms in the cell,'),
 ('h+k+l ≠ 4n+2', 'h plus k plus l not equal to 4 n plus 2'),
 ('h+k+l', 'h plus k plus l'),
 ('→ N = 2, 4, 6, 8, 10, 12… (ratios 1:2:3:4…)', ', so N equals 2, 4, 6, 8, 10, 12 and so on, ratios one, two, three, four'),
 ('→ N = 3, 4, 8, 11, 12, 16… (ratios 1:1.33:2.67:3.67…)', ', so N equals 3, 4, 8, 11, 12, 16 and so on, ratios one, 1.33, 2.67, 3.67'),
 ('→ N = 3, 8, 11, 16, 19… (ratios 1:2.67:3.67…)', ', so N equals 3, 8, 11, 16, 19 and so on, ratios one, 2.67, 3.67'),
 ('Δd/d = −cot θ·Δθ', 'delta d over d equals minus cot theta times delta theta'),
 ('θ = 90°', 'theta equals 90 degrees'),
 ('1/(L cos θ)', 'one over L cos theta'),
 ('β cos θ against 4 sin θ', 'beta cos theta against 4 sine theta'),
 ('Si SRM 640', 'silicon S R M 640'),
 # sem
 ('×20 to ×100 000', '20 times to 100000 times'),
 ('(e.g., {100} in ferrite)', '(for example the 1 0 0 planes in ferrite)'),
 ('da/dN', 'd a by d N'),
 ('(Kα, Kβ, L lines)', '(K alpha, K beta and L lines)'),
 ('(Fe Kα 6.40 keV, Cr Kα 5.41, Ni Kα 7.48, Cu Kα 8.05, Zn Kα 8.64, Al Kα 1.49, Si Kα 1.74 keV)', '(iron K alpha 6.40 kilo electron volts, chromium 5.41, nickel 7.48, copper 8.05, zinc 8.64, aluminium 1.49 and silicon 1.74)'),
 ('(ZAF)', '(Z A F)'),
 ('C_i ∝ k_iN_i', 'C i proportional to k i times N i'),
 ('C and O', 'carbon and oxygen'),
 ('(5–30 kV)', '(5 to 30 kilovolts)'),
]

GREEK = [('ε̇', 'strain rate'), ('ℓ̄', 'mean intercept'), ('σ′', 'sigma prime'), ('σ', 'sigma'), ('ε', 'epsilon'), ('τ', 'tau'), ('θ', 'theta'), ('γ', 'gamma'), ('α', 'alpha'), ('β', 'beta'), ('δ', 'delta'),
         ('Δ', 'delta '), ('λ', 'lambda'), ('μ', 'mu'), ('π', 'pi'), ('ρ', 'rho'), ('φ', 'phi'), ('ν', 'nu'), ('κ', 'kappa'), ('Σ', 'sum of ')]
SUBS = {'₀': ' nought', '₁': ' 1', '₂': ' 2', '₃': ' 3', '₅': ' 5'}
SUPS = [('²', ' squared'), ('³', ' cubed'), ('ⁿ', ' to the n')]
UNITS = [('°C', ' degrees Celsius'), ('µm', ' micrometres'), ('mm²', ' square millimetres'), ('mm⁴', ' millimetres to the fourth'), ('mm/min', ' millimetres per minute'),
         ('rpm', ' revolutions per minute'), ('MPa', ' megapascals'), ('GPa', ' gigapascals'), ('kgf', ' kilogram force'), ('kN', ' kilonewtons'), ('N·m', ' newton metres'),
         ('kHz', ' kilohertz'), ('MHz', ' megahertz'), ('kV', ' kilovolts'), ('mA', ' milliamps'), ('keV', ' kilo electron volts'), ('nm', ' nanometres'), ('mm', ' millimetres'),
         ('dB', ' decibels'), ('Å', ' angstroms'), ('°', ' degrees'), ('%', ' percent'), ('min', ' minutes'), ('kg', ' kilograms'), ('lux', ' lux'), ('Hz', ' hertz'), ('h', ' hours')]
ACR = {'IS': 'I S', 'ASTM': 'A S T M', 'ISO': 'I S O', 'FCC': 'F C C', 'BCC': 'B C C', 'BCT': 'B C T', 'HV': 'H V', 'HB': 'H B', 'HBW': 'H B W', 'HRC': 'H R C', 'HRB': 'H R B',
       'HRA': 'H R A', 'HRE': 'H R E', 'HRF': 'H R F', 'HR': 'H R', 'LMP': 'L M P', 'EDS': 'E D S', 'SEM': 'S E M', 'XRD': 'X R D', 'NDT': 'N D T', 'LVDT': 'L V D T', 'CCT': 'C C T',
       'TTT': 'T T T', 'SiC': 'silicon carbide', 'SAE': 'S A E', 'ZAF': 'Z A F', 'SRM': 'S R M', 'DBTT': 'D B T T', 'FATT': 'F A T T', 'RT': 'room temperature', 'MoS2': 'molybdenum disulphide',
       'HNO3': 'nitric acid', 'HCl': 'hydrochloric acid', 'HF': 'H F', 'Nital': 'nital', 'SDH': 'side drilled hole', 'UTM': 'U T M', 'LM6': 'L M 6', 'AC': 'A C', 'DC': 'D C', 'HWDC': 'half wave D C',
       'ASME': 'A S M E', 'MPI': 'M P I', 'Fe3C': 'iron carbide', 'PPE': 'P P E'}

def norm(t):
    for a, b in FIX:
        t = t.replace(a, b)
    for a, b in GREEK:
        t = t.replace(a, b)
    t = t.replace('̄', '').replace('̇', '')
    for a, b in SUBS.items():
        t = t.replace(a, b)
    t = re.sub(r'10⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+', lambda m: 'ten to the ' + ('minus ' if '⁻' in m.group(0) else '') + ''.join('0123456789'['⁰¹²³⁴⁵⁶⁷⁸⁹'.index(c)] for c in m.group(0)[2:] if c != '⁻'), t)
    for a, b in SUPS:
        t = t.replace(a, b)
    t = re.sub(r'(\w)_(\w+)', r'\1 \2', t)          # sigma_t -> sigma t
    t = re.sub(r'\^(\w+)', r' to the power \1', t)
    t = re.sub(r'(\d)\s(\d{3})\b', r'\1\2', t)       # 35 000 -> 35000
    t = re.sub(r'(\d(?:\.\d+)?)\s?[–-]\s?(\d)', r'\1 to \2', t)  # numeric ranges
    for u, w in UNITS:
        t = re.sub(r'(?<=\d)\s?' + re.escape(u) + r'(?![A-Za-z²³⁴])', w, t)
    t = re.sub(r'\b(' + '|'.join(sorted(map(re.escape, ACR), key=len, reverse=True)) + r')\b', lambda m: ACR[m.group(1)], t)
    rep = [(' = ', ' equals '), ('≈', ' about '), ('∝', ' proportional to '), ('≤', ' at most '), ('≥', ' at least '), (' < ', ' less than '), (' > ', ' greater than '),
           ('→', ', which gives '), ('×', ' times '), ('±', ' plus or minus '), ('√', ' the square root of '), ('−', ' minus '), ('·', ' '), ('…', '.'), ('—', ', '), ('~', 'about '),
           ('½', ' half'), ('’', "'"), ('′', ' prime'), ('″', ' inch'), ('+', ' plus ')]
    for a, b in rep:
        t = t.replace(a, b)
    t = t.replace('–', ' ')                          # en dash between words: S–N, Coulomb–Mohr
    t = re.sub(r'(?<=[A-Za-z])/(?=[A-Za-z])', ' or ', t)
    t = t.replace('/', ' over ')
    t = t.replace('(', ', ').replace(')', ',').replace('[', ', ').replace(']', ',').replace('{', '').replace('}', '')
    t = re.sub(r'\s+', ' ', t).strip()
    t = re.sub(r'\s+([,.;:?])', r'\1', t)
    t = re.sub(r',\s*([,.;:?])', r'\1', t)
    t = re.sub(r'^,\s*', '', t)
    t = re.sub(r',\s*$', '.', t)
    return t

if __name__ == '__main__':
    import json, sys
    d = json.load(open(sys.argv[1] if len(sys.argv) > 1 else 'tools/narration/narration.json'))
    bad = 0
    for k, v in d.items():
        for t in v['theory'] + [l for s in v['expl'] for l in s] + [q for q in v['q'] if q]:
            n = norm(t)
            if re.search(r'[^\x00-\x7F’üèöÜ]|[=_^<>{}\[\]/]', n):
                bad += 1; print(k, '|', n[:300])
    print('remaining', bad)
