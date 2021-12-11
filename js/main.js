class Loan {
    constructor(amount, rate, installments, iva) {
        this.amount = Number(amount);
        this.rate = Number(rate);
        this.installments = Number(installments);
        this.iva = Number(iva);
    }

    getDomDetail(dolarExchange, index) {
        const iva_detail = this.amount * this.iva;
        const total_detail = Number(this.amount) + Number(iva_detail);

        let totalPayment = 0;

        let innerhtml =
            `<h4 style="text-decoration: underline;">Loan Simulation #${index}</h4>
        <br>
        <table class="table table-striped">
            <tr>
                <th>Amount (monto)</th>
                <th>Amount + IVA</th>
                <th>Rate (tasa)</th>
                <th>Installments (cuotas)</th>
            </tr>
            <tr>
                <td>$${this.amount}</td>
                <td>$${total_detail}</td>
                <td>${this.rate}%</td>
                <td>${this.installments}</td>
            </tr>
        </table>
        <table class="table table-striped">
            <tr>
                <th>#</th>
                <th>Capital</th>
                <th>Installment</th>
            </tr>`;

        for (let i = 0; i < this.installments; i++) {
            const capital = (this.installments - (i)) * total_detail / this.installments;
            const paymentInstallment = round2(total_detail / this.installments + capital * this.rate / 100);
            totalPayment += paymentInstallment;

            innerhtml +=
                `
            <tr>
                <td>${i + 1}</td>
                <td>$${round2(capital)}</td>
                <td>$${paymentInstallment}</td>
            </tr>`;
        }

        innerhtml +=
            `<tr>
        <td col="4">Total Loan: $${round2(total_detail)} (${round2(total_detail / dolarExchange)} USD)</td>
        </tr><tr>
        <td col="4">Total Payment: $${round2(totalPayment)} (${round2(totalPayment / dolarExchange)} USD)</td>
        </tr>
        </table>
        <hr>`
        return innerhtml;
    }
}

function round2(number) {
    return Math.round(number * 100) / 100;
}

//DOM

$(() => {

    //Initialization
    const IVA = 0.21;
    let historial = [];
    let dolarExchange = 0;
    const historialSectionResults = $('#section-historial-results');
    const historialSectionNoResults = $('#section-historial-no-results');
    const formLoan = $('#form-data-loan');
    const btnNewSim = $('#btn-simulation');
    const btnClear = $('#btn-clear')
    const titleApp = $('#titleApp');

    formLoan.hide();
    btnNewSim.hide();
    titleApp.hide();

    btnNewSim.click(() => {
        btnNewSim.fadeOut(500, () => {
            formLoan.fadeIn(1000);
        });

    })

    titleApp.fadeIn(1500);
    getDolarData();

    // end of initializacion

    async function getDolarData() {
        let data = await fetch('https://www.dolarsi.com/api/api.php?type=valoresprincipales');
        data = await data.json();
        dolarExchange = data[0]?.casa?.compra ? round2(Number(data[0].casa.compra.replace(',', '.'))) : 110;
        $('#dolar-exchange').html(dolarExchange);
        setDomHistorial();
    }

    function setDomHistorial() {

        formLoan.hide();
        btnNewSim.hide();

        historial = getFromLocalStorage();

        historialSectionNoResults.hide();
        historialSectionResults.hide();

        titleApp.fadeIn(1500, () => {
            if (historial && historial.length > 0) {
                const historialDiv = $('#historial-results');
                let innerhtml = '';
                for (let i = historial.length - 1; i >= 0; i--) {
                    innerhtml += historial[i].getDomDetail(dolarExchange, i + 1);
                }

                historialDiv.html(innerhtml);
                historialSectionResults.fadeIn(700, () => {
                    btnNewSim.fadeIn(700);
                });
            } else {
                historialSectionNoResults.fadeIn(700, () => {
                    btnNewSim.fadeIn(700);
                });
            }
        });
    }

    function getFromLocalStorage() {
        if (localStorage.getItem('historial')) {
            historial = JSON.parse(localStorage.getItem('historial'));

            historial = historial.map(loan => new Loan(loan.amount, loan.rate, loan.installments, loan.iva));

        } else {
            localStorage.setItem('historial', JSON.stringify(historial))
        }

        return historial;
    }

    function validateLoan(formData) {
        let loan;
        const amount = formData.get('amount');
        const rate = formData.get('rate');
        const installments = formData.get('installments');

        if (!isNaN(amount) && amount > 0) {
            if (!isNaN(rate) && rate > 0) {
                if (!isNaN(installments) && installments > 0) {
                    loan = new Loan(amount, rate, installments, IVA);
                    historial.push(loan);

                    localStorage.setItem('historial', JSON.stringify(historial));

                    setDomHistorial();

                    return loan;
                } else return 'Wrong installments number, try again.'
            } else return 'Wrong interest rate, try again.'
        } else return 'Wrong amount, try again.'
    }

    btnClear.click(() => {
        localStorage.clear();
        historial = [];
        setDomHistorial();
    })

    formLoan.submit((e) => {
        e.preventDefault();

        const formData = new FormData(e.target);

        const validation = validateLoan(formData);

        if (typeof validation === 'string') {
            Swal.fire(
                'Oh no!',
                validation,
                'warning'
            );
        } else {

            formLoan.hide();
            formLoan.trigger('reset');

            historialSectionResults.hide();
            formLoan.fadeOut('slow', () => {
                btnNewSim.fadeIn(1000);
                historialSectionResults.fadeIn(1000);
            })

            Swal.fire(
                'Good job!',
                'Loan simulation was created!',
                'success'
            );
        }
    });

});