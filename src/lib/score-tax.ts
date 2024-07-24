interface SalaryData {
  month: string;
  grossSalaryPerMonth: number;
  pension: number;
  disability: number;
  deductibles: number;
  sickness: number;
  health: number;
  sumToTax: number;
  tax: number;
  netSalary: number;
  higherTax: boolean;
  accident: number;
  laborFund: number;
  guaranteedEmployeeBenefitsFund: number;
  ppkEmployee: number;
  ppkEmployer: number;
  employerCost: number;
}

interface SalarySummary {
  [key: string]: number | string | boolean;
}

const GROSS_SALARY_MINIMAL = 4300;
const GROSS_SALARY_LIMIT = 234720;
const DEDUCTIBLE_AUTHOR_LIMIT = 120000;
const TAX_THRESHOLD = 120000;
const TAX_RATE_LOW = 0.12;
const TAX_RATE_HIGH = 0.32;
const TAX_REDUCING_AMOUNT = 3600;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function calculateSumToTax(
  grossSalaryPerMonth: number,
  socialContribution: number,
  ratioAuthor: number,
  deductibleAuthor: number,
  deductibleNormal: number,
  ppkEmployerRatio: number = 0
): number {
  const grossSalaryPerMonthAuthor = ratioAuthor * grossSalaryPerMonth;
  const grossSalaryPerMonthStandard = grossSalaryPerMonth * (1 - ratioAuthor);

  const sumToTaxNormal =
    grossSalaryPerMonthStandard -
    (1 - ratioAuthor) * socialContribution -
    deductibleNormal;
  const sumToTaxAuthor =
    grossSalaryPerMonthAuthor -
    ratioAuthor * socialContribution -
    deductibleAuthor;

  return (
    Math.max(0, sumToTaxNormal) +
    Math.max(0, sumToTaxAuthor) +
    grossSalaryPerMonth * ppkEmployerRatio
  );
}

function calculateTax(current: number, prevSum: number): number {
  let tax = 0;
  const sum = prevSum + current;

  if (sum < TAX_THRESHOLD) {
    tax = TAX_RATE_LOW * current - TAX_REDUCING_AMOUNT / 12;
  } else if (sum > TAX_THRESHOLD && prevSum < TAX_THRESHOLD) {
    tax =
      TAX_RATE_LOW * (TAX_THRESHOLD - prevSum) +
      TAX_RATE_HIGH * (sum - TAX_THRESHOLD) -
      TAX_REDUCING_AMOUNT / 12;
  } else {
    tax = TAX_RATE_HIGH * current - TAX_REDUCING_AMOUNT / 12;
  }

  return Math.max(0, Math.round(tax));
}

function contributionValue(
  currentValue: number,
  previousGrossSalarySum: number,
  rate: number,
  limit: number
): number {
  let sum = previousGrossSalarySum + currentValue;
  let tax;

  if (sum < limit && previousGrossSalarySum < limit) {
    tax = rate * currentValue;
  } else if (sum >= limit && previousGrossSalarySum <= limit) {
    tax = rate * (limit - previousGrossSalarySum);
  } else {
    tax = 0;
  }

  return tax;
}

function calculateHealthContribution(
  grossSalary: number,
  socialContribution: number
): number {
  const rate = 0.09;
  return rate * (grossSalary - socialContribution);
}

function calculateAccidentContribution(grossSalary: number): number {
  const rate = 0.0167;
  return rate * grossSalary;
}

function calculateLaborFund(grossSalary: number): number {
  const rate = grossSalary > GROSS_SALARY_MINIMAL ? 0.0245 : 0;
  return rate * grossSalary;
}

function calculateGuaranteedEmployeeBenefitsFund(grossSalary: number): number {
  const rate = 0.001;
  return rate * grossSalary;
}

function calculateSicknessContribution(value: number): number {
  const rate = 0.0245;
  return rate * value;
}

function calculateDisabilityContribution(
  currentValue: number,
  previousGrossSalarySum: number,
  limit: number,
  employer: boolean = false
): number {
  const rate = employer ? 0.065 : 0.015;
  return contributionValue(currentValue, previousGrossSalarySum, rate, limit);
}

function calculatePensionContribution(
  currentValue: number,
  previousGrossSalarySum: number,
  limit: number
): number {
  const rate = 0.0976;
  return contributionValue(currentValue, previousGrossSalarySum, rate, limit);
}

function calculateDeductiblesAuthor(
  grossSalaryPerMonth: number,
  socialContribution: number,
  authorTaxDeductibleCostRatio: number,
  previousDeductiblesCostSum: number
): number {
  const currentValue =
    (grossSalaryPerMonth - socialContribution) *
    authorTaxDeductibleCostRatio *
    0.5;

  return contributionValue(
    currentValue,
    previousDeductiblesCostSum,
    1,
    DEDUCTIBLE_AUTHOR_LIMIT
  );
}

export function grossToNet(
  grossSalaryPerMonthValues: number[],
  taxDeductibleCost: number,
  authorTaxDeductibleCostRatio: number,
  ppkEmployeeRatio: number = 0.02,
  ppkEmployerRatio: number = 0.015,
  employer: boolean
): SalaryData[] {
  let previousGrossSalarySum = 0;
  let previousToTaxSum = 0;
  let previousDeductiblesCostSum = 0;

  return grossSalaryPerMonthValues.map((grossSalaryPerMonth, index) => {
    const pension = calculatePensionContribution(
      grossSalaryPerMonth,
      previousGrossSalarySum,
      GROSS_SALARY_LIMIT
    );
    const disability = calculateDisabilityContribution(
      grossSalaryPerMonth,
      previousGrossSalarySum,
      GROSS_SALARY_LIMIT,
      employer
    );
    const sickness = calculateSicknessContribution(grossSalaryPerMonth);

    const socialContribution = pension + disability + sickness;
    previousGrossSalarySum += grossSalaryPerMonth;

    const deductiblesWithAuthor = calculateDeductiblesAuthor(
      grossSalaryPerMonth,
      socialContribution,
      authorTaxDeductibleCostRatio,
      previousDeductiblesCostSum
    );
    let deductibles = deductiblesWithAuthor + taxDeductibleCost;
    if (deductibles > grossSalaryPerMonth) {
      deductibles = grossSalaryPerMonth;
    }

    previousDeductiblesCostSum += deductiblesWithAuthor;

    const sumToTax = calculateSumToTax(
      grossSalaryPerMonth,
      socialContribution,
      authorTaxDeductibleCostRatio,
      deductiblesWithAuthor,
      taxDeductibleCost,
      ppkEmployerRatio
    );

    const tax = calculateTax(sumToTax, previousToTaxSum);
    previousToTaxSum += sumToTax;

    const health = calculateHealthContribution(
      grossSalaryPerMonth,
      socialContribution
    );

    const ppkEmployee = ppkEmployeeRatio * grossSalaryPerMonth;
    const ppkEmployer = ppkEmployerRatio * grossSalaryPerMonth;
    const netSalary =
      grossSalaryPerMonth - (socialContribution + health + tax) - ppkEmployee;

    const laborFund = calculateLaborFund(grossSalaryPerMonth);
    const guaranteedEmployeeBenefitsFund =
      calculateGuaranteedEmployeeBenefitsFund(grossSalaryPerMonth);
    const accident = calculateAccidentContribution(grossSalaryPerMonth);

    const employerCost =
      grossSalaryPerMonth +
      pension +
      disability +
      accident +
      laborFund +
      guaranteedEmployeeBenefitsFund +
      ppkEmployer;

    return {
      month: MONTHS[index],
      grossSalaryPerMonth,
      deductibles,
      pension,
      disability,
      accident,
      laborFund,
      guaranteedEmployeeBenefitsFund,
      ppkEmployee,
      ppkEmployer,
      employerCost,
      sickness,
      health,
      sumToTax,
      tax,
      netSalary,
      higherTax: previousToTaxSum > TAX_THRESHOLD && !employer,
    };
  });
}

function annualSummary(yearSalary: SalaryData[]): SalarySummary {
  const summary: SalarySummary = {
    month: "", // Typically not relevant in the annual summary
    grossSalaryPerMonth: 0,
    pension: 0,
    disability: 0,
    deductibles: 0,
    sickness: 0,
    health: 0,
    sumToTax: 0,
    tax: 0,
    netSalary: 0,
    higherTax: false, // This might need a different handling
    accident: 0,
    laborFund: 0,
    guaranteedEmployeeBenefitsFund: 0,
    ppkEmployee: 0,
    ppkEmployer: 0,
    employerCost: 0,
  };

  for (const month of yearSalary) {
    for (const key in summary) {
      if (typeof month[key as keyof SalaryData] === "number") {
        summary[key] =
          (summary[key] as number) + (month[key as keyof SalaryData] as number);
      } else if (typeof month[key as keyof SalaryData] === "boolean") {
        summary[key] = summary[key] || month[key as keyof SalaryData]; // If any month has true, the summary should be true
      }
    }
  }

  return summary;
}

export function grossToNetWithTotal(
  grossSalaryPerMonthValues: number[],
  taxDeductibleCost: number,
  authorTaxDeductibleCostRatio: number,
  ppkEmployeeRatio: number,
  ppkEmployerRatio: number,
  employer: boolean = false
) {
  const year = grossToNet(
    grossSalaryPerMonthValues,
    taxDeductibleCost,
    authorTaxDeductibleCostRatio,
    ppkEmployeeRatio,
    ppkEmployerRatio,
    employer
  );

  const total = annualSummary(year);
  return [...year, total];
}
