<script lang="ts">
    import { grossToNetWithTotal} from "../lib/score-tax.ts";
    import { round } from "../lib/utils.ts";

    let authorTaxDeductibleCostPercent = $state(0);
    let grossSalaryPerMonth = $state(0);
    let PPK = $state(false);
    let AUTHOR = $state(false);

    let ppkEmployeePercent = $state(0);
    let ppkEmployerPercent = $state(0);

    $effect(() => {
        ppkEmployeePercent = PPK ? 2 : 0;
        ppkEmployerPercent = PPK ? 1.5 : 0;
        authorTaxDeductibleCostPercent = AUTHOR ? 70 : 0;
    });



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



   const translations =  {
        "month": "miesiąc",
        "grossSalaryPerMonth": "brutto",
        "pension": "składka emerytalna",
        "disability": "składka rentowa",
        "accident": "składka wypadkowa",
        "laborFund": "Fundusz Pracy",
        "guaranteedEmployeeBenefitsFund": "Fundusz Gwarantowanych Świadczeń Pracowniczych",
        "ppkEmployer": "PPK pracodawcy",
        "employerCost": "koszt pracodawcy",
        "deductibles": "koszty uzyskania przychodu",
        "sickness": "składka chorobowa",
        "health": "składka zdrowotna",
        "sumToTax": "podstawa opodatkowania",
        "tax": "podatek",
        "ppkEmployee": "PPK pracownika",
        "netSalary": "netto",
        "January": "styczeń",
        "February": "luty",
        "March": "marzec",
        "April": "kwiecień",
        "May": "maj",
        "June": "czerwiec",
        "July": "lipiec",
        "August": "sierpień",
        "September": "wrzesień",
        "October": "październik",
        "November": "listopad",
        "December": "grudzień"
    }



    let grossOverTheYear = $derived(
        Array(12).fill(Number(grossSalaryPerMonth)),
    );
    let authorTaxDeductibleCostRatio = $derived(
        authorTaxDeductibleCostPercent / 100,
    );
    let ppkEmployeeRatio = $derived(ppkEmployeePercent / 100);
    let ppkEmployerRatio = $derived(ppkEmployerPercent / 100);

    let yearSalaryEmployee = $state(
        grossToNetWithTotal(Array(12).fill(0), 250, 0, 0, 0, false),
    );

    let yearSalaryEmployer = $state(
        grossToNetWithTotal(Array(12).fill(0), 250, 0, 0, 0, true),
    );

    function calculateSalary() {
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

    function calculate(
        e: Event & {
            currentTarget: EventTarget | (SubmitEvent & HTMLInputElement);
        },
    ) {
        e.preventDefault();
        calculateSalary();
    }

    $effect(() => {
        calculateSalary();
    });
</script>

<!-- a11y_no_static_element_interactions -->
<div class="container">
    <h2>Kalkulator UOP: brutto - netto</h2>
    <form onsubmit={calculate}>
        <ul class="params">
            <li>
            <label>
                <strong>Miesięczne wynagrodzenie brutto: </strong>
                <input type="number" bind:value={grossSalaryPerMonth} min="0"  step="0.01" />
            </label>
            </li>
            <li>
<label><input type="checkbox" bind:checked={AUTHOR} />    Autorskie koszty uzyskanie przychodu
                    {#if AUTHOR}

             <input
                    type="number"
                    bind:value={authorTaxDeductibleCostPercent}
                    min="0"
                    max="100"
                /> %


            {/if}       </label>
                    </li>
              <li>
            <label> <input type="checkbox" bind:checked={PPK} /> PPK:


            {#if PPK}


            <!-- <label> -->
                PPK pracownik:
                <input
                    type="number"
                    bind:value={ppkEmployeePercent}
                    min="0"
                    step="0.5"
                /> %
            <!-- </label>
            <label> -->
                PPK pracodawca:
                <input
                    type="number"
                    bind:value={ppkEmployerPercent}
                    min="0"
                    step="0.5"
                /> %
            <!-- </label> -->
  {/if}   </label>
              <li>
<!--            <button type="submit"> calculate</button>-->
        </ul>
    </form>
    <h3>Pracownik</h3>
    <table>
        <thead>
            <tr>
                {#each employeeKeys as heading}
                    <th> {translations[heading]}</th>
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
                                    step="0.01"
                                    bind:value={grossOverTheYear[index]}
                                    oninput={calculate}
                                />
                            </td>
                            {:else if key === "month"}
                                <td>{translations[monthSalary[key]]}</td>
                            {:else if employeeKeys.includes(key)}

                                <td>{key in monthSalary && round(monthSalary[key])}</td>
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
                    <th> {translations[heading as string]}</th>
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
                                    oninput={calculate}
                                    bind:value={grossOverTheYear[index]}
                                    step="0.01"
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
        flex-direction: column;
        gap: 32px;
    }
    li{
        width: auto;
    }
    .params{
        display: flex;
        /* flex-direction: column; */
        list-style: none;
        gap: 16px;
        background-color: var(--sand-1);
        padding: 16px;
    }

    label{
        display: flex;
        gap: 16px;
        align-items: center;
        border: 1px solid var(--sand-3);
        border-radius: 8px;
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

    input[type="number"] {
        max-width: var(--size-fluid-6);
        background-color: var(--sand-0);
        border: 1px solid var(--sand-2);
    }

    input:invalid {
        border: 2px solid var(--red-5);
    }

    /*button {*/
    /*    background-color: var(--red-3);*/
    /*    color: var(--sand-0);*/
    /*}*/
</style>
