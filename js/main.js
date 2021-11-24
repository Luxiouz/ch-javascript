class Loan {
    constructor(amount, rate, installments, iva) {
        this.amount = Number(amount);
        this.rate = Number(rate);
        this.installments = Number(installments);
        this.iva = Number(iva);
    }

    getDetail() {
        const iva_detail = this.amount * this.iva;
        const total_detail = this.amount + iva_detail;

        console.log('**********LOAN DETAIL*********')
        console.log(`Monto: ${this.amount}`)
        console.log(`Iva: ${iva_detail}`)
        console.log(`Total: ${total_detail}`)
        console.log('**********CUOTAS*********')
        for (let i = 0; i < this.installments; i++) {
            const capital = (this.installments - (i)) * total_detail / this.installments;

            console.log(`Capital: ${capital} - Cuota ${i + 1}: ${total_detail / this.installments + capital * this.rate / 100}`)
        }
        return `**********FINISH LOAN DETAIL***********
        `
    }

    getDomDetail() {
        const iva_detail = this.amount * this.iva;
        const total_detail = Number(this.amount) + Number(iva_detail);

        let totalPayment = 0;

        let innerhtml =
            `<h4 style="text-decoration: underline;">Loan Simulation</h4>
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
            const paymentInstallment = Math.round((total_detail / this.installments + capital * this.rate / 100) * 100) / 100;
            totalPayment += paymentInstallment;

            innerhtml +=
                `
            <tr>
                <td>${i + 1}</td>
                <td>$${Math.round(capital * 100) / 100}</td>
                <td>$${paymentInstallment}</td>
            </tr>`;
        }

        innerhtml +=
            `<tr>
        <td col="4">Total Loan: $${Math.round(total_detail * 100) / 100}</td>
        </tr><tr>
        <td col="4">Total Payment: $${Math.round(totalPayment * 100) / 100}</td>
        </tr>
        </table>
        <hr>`
        return innerhtml;
    }
}

//DOM

//Initialization
const IVA = 0.21;
let historial = [];

setDomHistorial();
// end of initializacion

function setDomHistorial() {

    historial = getFromLocalStorage();

    const historialSectionResults = document.getElementById('section-historial-results')
    const historialSectionNoResults = document.getElementById('section-historial-no-results')

    historialSectionResults.style.display = 'none';
    historialSectionNoResults.style.display = 'none';

    if (historial && historial.length > 0) {
        historialSectionResults.style.display = 'block';
        const historialDiv = document.getElementById('historial-results');
        let innerhtml = '';
        for (let i = historial.length - 1; i >= 0; i--) {
            innerhtml += historial[i].getDomDetail();
        }

        historialDiv.innerHTML = innerhtml;
    } else {
        historialSectionNoResults.style.display = 'block';
    }


}

function getFromLocalStorage() {
    if (localStorage.getItem('historial')) {
        historial = JSON.parse(localStorage.getItem('historial'));

        historial = historial.map(loan => new Loan(loan.amount, loan.rate, loan.installments, loan.iva));

    } else {
        localStorage.setItem('historial', historial)
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

const formLoan = document.getElementById('form-data-loan');
formLoan.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(formLoan);

    const validation = validateLoan(formData);

    if (typeof validation === 'string') {
        Swal.fire(
            'Oh no!',
            validation,
            'warning'
        );
    } else {
        Swal.fire(
            'Good job!',
            'Loan simulation was created!',
            'success'
        );
    }
})


//The following code will be deprecated in future relases


//Console

function crear(monto, tasa, cuotas) {
    const amount = Number(monto);
    const installments = Number(cuotas);
    if (!isNaN(amount)) {
        if (!isNaN(tasa)) {
            if (!isNaN(cuotas)) {
                const prestamo = new Loan(amount, tasa, cuotas, IVA);
                historial.push(prestamo);

                localStorage.setItem('historial', JSON.stringify(historial));

                return 'Préstamo creado correctamente'
            } else return 'Número de cuotas erróneo, vuelva a ingresar.'
        } else return 'Tasa de interés erróneo, vuelva a ingresar.'
    } else return 'Monto erróneo, vuelva a ingresar.'
}

function getDetail() {
    if (historial?.length > 0) {
        console.log(historial[historial.length - 1].getDetail());
        return 'Proceso finalizado.'
    } else {
        return 'Aun no se han simulado préstamos.'
    }
}

function getHistorial() {
    if (historial?.length > 0) {
        historial.forEach(item => {
            console.log(item.getDetail());
        });
        return 'Proceso finalizado.'
    } else {
        return 'Aun no se han simulado préstamos.'
    }
}

function getHistorialSort() {

    if (historial?.length > 0) {
        const historialCopy = [...historial];
        historialCopy.sort((a, b) => a.amount - b.amount);
        historialCopy.forEach(item => {
            console.log(item.getDetail());
        });
        return 'Proceso finalizado.'
    } else {
        return 'Aun no se han simulado préstamos.'
    }
}

// alert('Simulador de préstamos, ver la consola para iniciar')
console.log(`*******Calculadora de cuotas v.0.1*******
1. Usa crear(monto, tasa, cuotas) para crear una simulación de prestamo.
2. Usa getDetail() para mostrar el detalle del último préstamo creado.
3. Usa getHistorial() para mostrar el historial de préstamos simulados.
4. Usa getHistorialSort() para mostrar el historial de préstamos simulados ordenados de menor a mayor según el monto.
5. Dona a nuestro proyecto aquí: http://shorturl.at/ajCR1
`)
