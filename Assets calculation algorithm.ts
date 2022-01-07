// PREREQUISITES
// --------------------------------------------------

// Strike price
const strikePrice = 3800

// Price of strike asset initial
const psi = 1
// Price of strike asset at expiry
const pse = 1

// ITM in Strike
const r = 300

// Price initial
const pi1 = 1
const pi2 = 1

// Price expiry
const pe1 = 1
const pe2 = 1

// Deposit by vault
const d1 = 2000
const d2 = 2700

// ON MINT OF OPTION
// --------------------------------------------------

// Deposit values
const dv1 = d1 * pi1
const dv2 = d2 * pi2

// Deposit total value
const dt = dv1 + dv2

// Collateralization ratio on deposit, how much of certain collateral used for collaterizing 1 option
const cr1 = dv1 / dt
const cr2 = dv2 / dt

// Collaterization values to be used for minting for specific collateral
// Calculated in strike asset UNITS
const cv1 = cr1 * strikePrice
const cv2 = cr2 * strikePrice

// Collaterization amounts, how much of collateral to reserve when mint option
// const ca1 = cv1 * psi/ pi1;
// const ca1 = cr1 * ps * psi / pi1
// const ca1 = (dv1 * ps * psi) / (pi1 * dt)
// const ca1 = (d1 * pi1 * ps * psi) / (pi1 * dt)
// const ca1 = (d1 * ps * psi) / dt
const ca1 = (d1 * strikePrice * psi) / dt
// ca1 = 1266.6666666666667
// ca1 = 253.33333333333337
// ca1 = 1940.425
// = 3459
// = 2826
const ca2 = (d2 * strikePrice * psi) / dt

// ON REDEEM
// --------------------------------------------------

// Redeem ratios
const rr1 = cv1 / (cv1 + cv2)
const rr2 = cv2 / (cv1 + cv2)
// alternatively
// const rr1 = cv1 / (ps * optionTokensMinted)
// for multiple vaults: const rr1 = (vault1CV1 + vault2CV1....) / (ps * optionTokensMinted)

// Redeem values
const rv1 = rr1 * r * pse
const rv2 = rr2 * r * pse

// Redeem amounts in
// const ra1 = rv1 / pe1
// const ra1 = cv1 * r * pse / (pe1 * optionTokensMinted * ps)
const ra1 = (cv1 * r * pse) / (pe1 * 1 * strikePrice)
const ra2 = rv2 / pe2
// const ra1 = rr1 * r * pse / pe1
// const ra1 =  (vault1CV1 + vault2CV1....) * r * pse / (pe1 * optionTokensMinted * ps)

// ON SETTLE
// --------------------------------------------------
// Redeem amount
