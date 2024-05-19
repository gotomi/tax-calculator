<template>
  <div class="container">
    <h2>Kalkulator UOP - brutto => netto</h2>
    <form @submit.prevent="calculate">
      <div class="params">
        <label>
          Miesięczne wynagrodzenie brutto:
          <input
              type="number"
              v-model.number="grossSalaryPerMonth"
              min="0"
          />
        </label>
        <label>
          Autorskie koszty uzyskanie przychodu:
          <input
              type="number"
              v-model.number="authorTaxDeductibleCostPercent"
              min="0"
              max="100"
          />
          %
        </label>
        <br>
        <label>
          PPK pracownik
          <input
              type="number"
              v-model.number="ppkEmployee"
              min="0"
              max="100"
              step="0.5"
          />
          %
        </label>
        <label>
          PPK pracodawca
          <input
              type="number"
              v-model.number="ppkEmployer"
              min="0"
              max="100"
              step="0.5"
          />
          %
        </label>
        <button type="submit">calculate</button>
      </div>
    </form>
    <h3>Pracownik</h3>
    <table>
      <thead>
      <tr>
        <th v-for="heading in employeeKeys" :key="heading">
          {{ convertToReadableString(heading) }}
        </th>
      </tr>
      </thead>
      <tbody>
      <tr
          v-for="(monthSalary, index) in yearSalaryEmployee"
          :key="index"
          :class="{ higherTax: monthSalary.higherTax }"
      >
        <template v-for="key in  employeeKeys" :key="key">
          <td v-if="key === 'grossSalaryPerMonth' && index < 12">
            <input
                type="number"
                v-model.number="grossOverTheYear[index]"
                @input="calculate"
            />
          </td>
          <td v-else-if="employeeKeys.includes(key)">
            {{ round(monthSalary[key]) }}
          </td>
        </template>
      </tr>
      </tbody>
    </table>

    <h3>Pracodawca</h3>
    <table>
      <thead>
      <tr>
        <th v-for="heading in employerKeys" :key="heading">
          {{ convertToReadableString(heading) }}
        </th>
      </tr>
      </thead>
      <tbody>
      <tr
          v-for="(monthSalary, index) in yearSalaryEmployer"
          :key="index"
          :class="{ higherTax: monthSalary.higherTax }"
      >
        <template v-for="key in  employerKeys" :key="key">
          <td v-if="key === 'grossSalaryPerMonth' && index < 12">
            <input
                type="number"
                v-model.number="grossOverTheYear[index]"
                @input="calculate"
            />
          </td>
          <td v-else-if="employerKeys.includes(key)">
            {{ round(monthSalary[key]) }}
          </td>
        </template>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch} from "vue";
import {grossToNetWithTotal} from "../lib/score-tax.ts";
import {round, convertToReadableString} from "../lib/utils.ts";

const authorTaxDeductibleCostPercent = ref(0);
const grossSalaryPerMonth = ref(0);
const ppkEmployee = ref(0);
const ppkEmployer = ref(0);
const employerKeys = [
  "month",
  "grossSalaryPerMonth",
  "pension",
  "disability",
  "accident",
  "laborFund",
  "guaranteedEmployeeBenefitsFund",
  "ppkEmployer",
  "employerCost",
];

const employeeKeys = [
  "month",
  "grossSalaryPerMonth",
  "deductibles",
  "pension",
  "disability",
  "sickness",
  "health",
  "sumToTax",
  "tax",
  "ppkEmployee",
  "netSalary",
];

const grossOverTheYear = computed(() =>
    Array(12).fill(Number(grossSalaryPerMonth.value)),
);

let yearSalaryEmployee = ref(
    grossToNetWithTotal(
        Array(12).fill(0),
        0, 0, 0, 0,
        false,
    ),
);

let yearSalaryEmployer = ref(
    grossToNetWithTotal(
        Array(12).fill(0),
        0, 0, 0, 0,
        true,
    ),
);


function calculate() {
  yearSalaryEmployee.value = grossToNetWithTotal(
      grossOverTheYear.value,
      250,
      authorTaxDeductibleCostPercent.value / 100,
      ppkEmployee.value / 100,
      ppkEmployer.value / 100,
      false,
  );

  yearSalaryEmployer.value = grossToNetWithTotal(
      grossOverTheYear.value,
      250,
      authorTaxDeductibleCostPercent.value / 100,
      ppkEmployee.value / 100,
      ppkEmployer.value / 100,
      true,
  );
}
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
}

td,
th {
  border: 1px solid var(--sand-5);
  padding: 0.75rem;
  text-align: center;
}

th {
  background-color: var(--sand-4);
  color: var(--sand-0);
}

tr:nth-child(even) td {
  background-color: var(--sand-1);
}

label {
  padding: 8px;
}

tr.higherTax td {
  background-color: var(--red-2);
}

tr:last-child td {
  font-weight: bold;
  background-color: var(--sand-7);
  color: var(--sand-0);
}

input {
  width: var(--size-fluid-6);
  background-color: var(--sand-0);
  border: 1px solid var(--sand-2);
}

input:invalid {
  border: 2px solid var(--red-5);
}
</style>
