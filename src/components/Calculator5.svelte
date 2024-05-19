<script lang="ts">
    import {grossToNetWithTotal} from "../lib/score-tax.ts";
    import {round, convertToReadableString} from "../lib/utils.ts";

    let authorTaxDeductibleCostPercent = $state(0);
    let grossSalaryPerMonth = $state(0);
    let employerKeys = [
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

    let employeeKeys = [
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

    let ppkEmployeePercent = $state(0);
    let ppkEmployerPercent = $state(0);

    let grossOverTheYear = $derived(Array(12).fill(Number(grossSalaryPerMonth)));
    let authorTaxDeductibleCostRatio = $derived(authorTaxDeductibleCostPercent / 100);
    let ppkEmployeeRatio = $derived(ppkEmployeePercent / 100);
    let ppkEmployerRatio = $derived(ppkEmployerPercent / 100);

    let yearSalaryEmployee = $state(grossToNetWithTotal(
        Array(12).fill(0),
        250,
        0,
        0,
        0,
        false,
    ));

    let yearSalaryEmployer = $state(grossToNetWithTotal(
        Array(12).fill(0),
        250,
        0,
        0,
        0,
        true,
    ));


    function calculate() {
        yearSalaryEmployee = grossToNetWithTotal(
            grossOverTheYear,
            250,
            authorTaxDeductibleCostRatio,
            ppkEmployeeRatio,
            ppkEmployerRatio,
            false,
        );

        yearSalaryEmployer = grossToNetWithTotal(
            grossOverTheYear,
            250,
            authorTaxDeductibleCostRatio,
            ppkEmployeeRatio,
            ppkEmployerRatio,
            true,
        );
    }
</script>
<svelte:options runes={true} />
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="container">
    <h2>Kalkulator UOP - brutto => netto</h2>
    <form onsubmit|preventDefault={calculate}>
        <div class="params">
            <label>
                Miesięczne wynagrodzenie brutto:
                <input
                        type="number"
                        bind:value={grossSalaryPerMonth}
                        min="0"
                />
            </label>
            <label>
                Autorskie koszty uzyskanie przychodu: <input
                    type="number"
                    bind:value={authorTaxDeductibleCostPercent}
                    min="0"
                    max="100"
            /> %
            </label>
            <br/>
            <label>
                PPK pracownik:
                <input
                        type="number"
                        bind:value={ppkEmployeePercent}
                        min="0"
                        step="0.5"
                /> %
            </label>
            <label>
                PPK pracodawca:
                <input
                        type="number"
                        bind:value={ppkEmployerPercent}
                        min="0"
                        step="0.5"
                /> %
            </label>

            <button type="submit"> calculate</button>
        </div>
    </form>
    <h3>Pracownik</h3>
    <table>
        <thead>
        <tr>
            {#each employeeKeys as heading}
                <th>{convertToReadableString(heading)}</th>
            {/each}
        </tr>
        </thead>
        <tbody>
        {#each yearSalaryEmployee as monthSalary, index}
            <tr class:higherTax={monthSalary.higherTax}>
                {#each employeeKeys as key}
                    {#if key === "grossSalaryPerMonth" && index < 12}
                        <td>
                            <input
                                    type="number"
                                    bind:value={grossOverTheYear[index]}
                                    oninput={calculate}
                            />
                        </td>
                    {:else if employeeKeys.includes(key)}
                        <td>{round(monthSalary[key])}</td>
                    {/if}
                {/each}
            </tr>
        {/each}
        </tbody>
    </table>

    <h3>Pracodawca</h3>
    <table>
        <thead>
        <tr>
            {#each employerKeys as heading}
                <th>{convertToReadableString(heading)}</th>
            {/each}
        </tr>
        </thead>
        <tbody>
        {#each yearSalaryEmployer as monthSalary, index}
            <tr class:higherTax={monthSalary.higherTax}>
                {#each employerKeys as key}
                    {#if key === "grossSalaryPerMonth" && index < 12}
                        <td>
                            <input
                                    type="number"
                                    bind:value={grossOverTheYear[index]}
                                    oninput={calculate}
                            />
                        </td>
                    {:else if employerKeys.includes(key)}
                        <td>{round(monthSalary[key])}</td>
                    {/if}
                {/each}
            </tr>
        {/each}
        </tbody>
    </table>
</div>

<style>
    .container {
        display: flex;
        flex-direction column;
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
